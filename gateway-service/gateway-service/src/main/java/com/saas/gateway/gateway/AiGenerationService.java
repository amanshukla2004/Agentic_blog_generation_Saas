package com.saas.gateway.gateway;

import com.saas.gateway.blog.BlogDraft;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AiGenerationService {
    Mono<BlogDraft> generateMultimodal(
            UUID userId,
            String topic,
            String websiteUrl,
            String youtubeUrl,
            String rawText,
            MultipartFile pdfFile
    );

    Mono<String> reviseBlog(String currentMarkdown, String instruction);
}
