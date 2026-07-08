package com.saas.gateway.gateway;

import com.saas.gateway.blog.BlogDraft;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gateway")
public class GatewayController {

    private final AiGenerationService aiGenerationService;

    public GatewayController(AiGenerationService aiGenerationService) {
        this.aiGenerationService = aiGenerationService;
    }

    @PostMapping(value = "/generate-multimodal", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public Mono<ResponseEntity<BlogDraft>> generateMultimodal(
            @RequestPart(value = "topic", required = false) String topic,
            @RequestPart(value = "website_url", required = false) String websiteUrl,
            @RequestPart(value = "youtube_url", required = false) String youtubeUrl,
            @RequestPart(value = "raw_text", required = false) String rawText,
            @RequestPart(value = "pdf_file", required = false) FilePart pdfFile,
            Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        return aiGenerationService.generateMultimodal(userId, topic, websiteUrl, youtubeUrl, rawText, pdfFile)
                .map(draft -> ResponseEntity.status(HttpStatus.CREATED).body(draft));
    }
}
