package com.saas.gateway.gateway;


import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.Status;
import com.saas.gateway.system.SystemErrorLog;
import com.saas.gateway.system.SystemErrorLogRepository;
import com.saas.gateway.system.SystemPrompt;
import com.saas.gateway.system.SystemPromptRepository;
import com.saas.gateway.user.SubscriptionTier;
import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class SyncWebClientAiService implements AiGenerationService {

    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final SystemPromptRepository systemPromptRepository;
    private final SystemErrorLogRepository systemErrorLogRepository;
    private final WebClient webClient;
    private final String internalSecret;

    public SyncWebClientAiService(
            UserRepository userRepository,
            BlogRepository blogRepository,
            SystemPromptRepository systemPromptRepository,
            SystemErrorLogRepository systemErrorLogRepository,
            WebClient.Builder webClientBuilder,
            @Value("${ai-service.base-url}") String baseUrl,
            @Value("${app.security.internal-secret}") String internalSecret
    ) {
        this.userRepository = userRepository;
        this.blogRepository = blogRepository;
        this.systemPromptRepository = systemPromptRepository;
        this.systemErrorLogRepository = systemErrorLogRepository;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.internalSecret = internalSecret;
    }

    @Override
    public Mono<BlogDraft> generateMultimodal(
            UUID userId, String topic, String websiteUrl, 
            String youtubeUrl, String rawText, FilePart pdfFile) {

        // 1. Quota Validation Check
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getSubscriptionTier() == SubscriptionTier.FREE && user.getGenerationsCount() >= 5) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Quota exceeded. Please upgrade to PRO.");
        }

        // 2. Dynamic Prompt Assembly
        SystemPrompt systemPrompt = systemPromptRepository.findByPromptName("TECH_BLOG_PROMPT")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "System prompt not configured"));

        // 3. Multipart Request Marshalling
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("system_prompt", systemPrompt.getPromptText());
        
        if (topic != null) builder.part("topic", topic);
        if (websiteUrl != null) builder.part("website_url", websiteUrl);
        if (youtubeUrl != null) builder.part("youtube_url", youtubeUrl);
        if (rawText != null) builder.part("raw_text", rawText);
        if (pdfFile != null) builder.part("pdf_file", pdfFile);

        // 4 & 5. Remote Invocation & Fault Handling
        try {
            java.util.Map responseMap = webClient.post()
                    .uri("/api/v1/blogs/generate-multimodal")
                    .header("X-Internal-Secret", internalSecret)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(java.util.Map.class)
                    .block(); // Synchronous block as per requirement

            // Safe Persistence
            java.util.Map<String, Object> blogOutput = (java.util.Map<String, Object>) responseMap.get("blog_output");
            String generatedTitle = blogOutput != null && blogOutput.get("title") != null ? blogOutput.get("title").toString() : "Untitled Generated Blog";
            String markdownContent = blogOutput != null && blogOutput.get("markdown_content") != null ? blogOutput.get("markdown_content").toString() : "";

            BlogDraft draft = new BlogDraft();
            draft.setUser(user);
            draft.setTopic(topic != null ? topic : "Inferred Topic");
            draft.setTitle(generatedTitle);
            draft.setRawMarkdown(markdownContent);
            draft.setStatus(Status.DRAFT);
            BlogDraft savedDraft = blogRepository.save(draft);

            user.setGenerationsCount(user.getGenerationsCount() + 1);
            userRepository.save(user);

            return Mono.just(savedDraft);

        } catch (Exception e) {
            SystemErrorLog errorLog = new SystemErrorLog("/api/v1/blogs/generate-multimodal", e.getMessage());
            systemErrorLogRepository.save(errorLog);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The AI text engine is temporarily unavailable. The incident has been logged for engineering review.");
        }
    }
}
