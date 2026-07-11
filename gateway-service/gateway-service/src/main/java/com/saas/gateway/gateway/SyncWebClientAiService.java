package com.saas.gateway.gateway;


import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.Status;
import com.saas.gateway.system.SystemErrorLog;
import com.saas.gateway.system.SystemErrorLogRepository;
import com.saas.gateway.system.SystemPrompt;
import com.saas.gateway.system.SystemPromptRepository;
import com.saas.gateway.system.SystemSettingRepository;
import com.saas.gateway.user.SubscriptionTier;
import com.saas.gateway.user.Role;
import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;
import java.time.Duration;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SyncWebClientAiService implements AiGenerationService {

    private static final Logger log = LoggerFactory.getLogger(SyncWebClientAiService.class);

    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final SystemPromptRepository systemPromptRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final SystemErrorLogRepository systemErrorLogRepository;
    private final WebClient webClient;
    private final String internalSecret;

    public SyncWebClientAiService(
            UserRepository userRepository,
            BlogRepository blogRepository,
            SystemPromptRepository systemPromptRepository,
            SystemSettingRepository systemSettingRepository,
            SystemErrorLogRepository systemErrorLogRepository,
            WebClient.Builder webClientBuilder,
            @Value("${ai-service.base-url}") String baseUrl,
            @Value("${app.security.internal-secret}") String internalSecret
    ) {
        this.userRepository = userRepository;
        this.blogRepository = blogRepository;
        this.systemPromptRepository = systemPromptRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.systemErrorLogRepository = systemErrorLogRepository;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.internalSecret = internalSecret;
    }

    @Override
    public Mono<BlogDraft> generateMultimodal(
            UUID userId, String topic, String websiteUrl, 
            String youtubeUrl, String rawText, MultipartFile pdfFile) {

        log.info("Starting multimodal generation for user ID: {}", userId);

        // 1. Quota Validation Check
        log.info("Validating user quota and subscription tier");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User ID {} not found during generation check", userId);
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
                });

        if (user.getRole() != Role.MASTER_ADMIN) {
            int limit = 6; // default normal user limit
            if (user.getRole() == Role.ADMIN) {
                limit = systemSettingRepository.findBySettingKey("ADMIN_GENERATION_LIMIT")
                        .map(s -> Integer.parseInt(s.getSettingValue()))
                        .orElse(30);
            } else {
                limit = systemSettingRepository.findBySettingKey("USER_GENERATION_LIMIT")
                        .map(s -> Integer.parseInt(s.getSettingValue()))
                        .orElse(6);
            }

            int updatedRows = userRepository.incrementQuota(userId, limit);
            if (updatedRows == 0) {
                log.warn("User {} exceeded generation limit of {}", userId, limit);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Draft generation limit exceeded (" + limit + ").");
            }
        }

        // 2. Dynamic Prompt Assembly
        log.info("Fetching TECH_BLOG_PROMPT system prompt from database");
        SystemPrompt systemPrompt = systemPromptRepository.findByPromptName("TECH_BLOG_PROMPT")
                .orElseThrow(() -> {
                    log.error("System prompt TECH_BLOG_PROMPT not found in the database");
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "System prompt not configured");
                });

        // 3. Multipart Request Marshalling
        log.info("Assembling multipart request payload to forward to AI microservice");
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("system_prompt", systemPrompt.getPromptText());
        
        if (topic != null) builder.part("topic", topic);
        if (websiteUrl != null) builder.part("website_url", websiteUrl);
        if (youtubeUrl != null) builder.part("youtube_url", youtubeUrl);
        if (rawText != null) builder.part("raw_text", rawText);
        if (pdfFile != null) builder.part("pdf_file", pdfFile.getResource());

        // 4 & 5. Remote Invocation & Fault Handling
        log.info("Sending synchronous WebClient request to internal AI microservice at /api/v1/blogs/generate-multimodal");
        try {
            java.util.Map responseMap = webClient.post()
                    .uri("/api/v1/blogs/generate-multimodal")
                    .header("X-Internal-Secret", internalSecret)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(java.util.Map.class)
                    .retryWhen(Retry.fixedDelay(10, Duration.ofSeconds(10))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException) {
                                    return ((WebClientResponseException) throwable).getStatusCode().is5xxServerError();
                                }
                                return true; // Retry on connect exceptions as well
                            })
                            .doBeforeRetry(retrySignal -> log.warn("Retrying AI service connection (Render cold start)... attempt {}", retrySignal.totalRetries() + 1))
                    )
                    .block(Duration.ofMinutes(5)); // Allow enough time for retries

            log.info("Received successful response from AI microservice, parsing blog output");
            // Safe Persistence
            java.util.Map<String, Object> blogOutput = (java.util.Map<String, Object>) responseMap.get("blog");
            String generatedTitle = blogOutput != null && blogOutput.get("title") != null ? blogOutput.get("title").toString() : "Untitled Generated Blog";
            String markdownContent = blogOutput != null && blogOutput.get("markdown_content") != null ? blogOutput.get("markdown_content").toString() : "";
            String category = blogOutput != null && blogOutput.get("category") != null ? blogOutput.get("category").toString() : "Uncategorized";
            String seoKeywords = blogOutput != null && blogOutput.get("seo_keywords") != null ? blogOutput.get("seo_keywords").toString() : "";

            BlogDraft draft = new BlogDraft();
            draft.setUser(user);
            draft.setTopic(topic != null ? topic : "Inferred Topic");
            draft.setTitle(generatedTitle);
            draft.setRawMarkdown(markdownContent);
            draft.setCategory(category);
            draft.setSeoKeywords(seoKeywords);
            draft.setStatus(Status.DRAFT);
            BlogDraft savedDraft = blogRepository.save(draft);

            log.info("Successfully persisted new blog draft with ID: {}", savedDraft.getId());
            return Mono.just(savedDraft);

        } catch (Exception e) {
            if (user.getRole() != Role.MASTER_ADMIN) {
                userRepository.decrementQuota(userId);
                log.info("Refunded quota for user ID {} due to generation failure", userId);
            }
            log.error("AI service invocation failed or returned an error: {}", e.getMessage(), e);
            SystemErrorLog errorLog = new SystemErrorLog("/api/v1/blogs/generate-multimodal", e.getMessage());
            systemErrorLogRepository.save(errorLog);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The AI text engine is temporarily unavailable. The incident has been logged for engineering review.");
        }
    }

    @Override
    public Mono<String> reviseBlog(String currentMarkdown, String instruction) {
        log.info("Sending revision request to AI microservice");
        try {
            java.util.Map<String, String> requestBody = new java.util.HashMap<>();
            requestBody.put("current_markdown", currentMarkdown);
            requestBody.put("instruction", instruction);

            java.util.Map responseMap = webClient.post()
                    .uri("/api/v1/blogs/revise")
                    .header("X-Internal-Secret", internalSecret)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(java.util.Map.class)
                    .retryWhen(Retry.fixedDelay(10, Duration.ofSeconds(10))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException) {
                                    return ((WebClientResponseException) throwable).getStatusCode().is5xxServerError();
                                }
                                return true;
                            })
                            .doBeforeRetry(retrySignal -> log.warn("Retrying AI service connection (Render cold start)... attempt {}", retrySignal.totalRetries() + 1))
                    )
                    .block(Duration.ofMinutes(5));

            String revised = responseMap != null && responseMap.get("revised_markdown") != null 
                ? responseMap.get("revised_markdown").toString() 
                : currentMarkdown;
            return Mono.just(revised);
        } catch (Exception e) {
            log.error("AI service revision failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Revision failed.");
        }
    }
}
