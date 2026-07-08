package com.saas.gateway.gateway;

import com.saas.gateway.blog.BlogDraft;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AiGenerationService {
    Mono<BlogDraft> generateMultimodal(
            UUID userId,
            String topic,
            String websiteUrl,
            String youtubeUrl,
            String rawText,
            FilePart pdfFile
    );
}
