package com.saas.gateway.gateway;

import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/gateway")
public class GatewayController {

    private static final Logger log = LoggerFactory.getLogger(GatewayController.class);

    private final AiGenerationService aiGenerationService;

    public GatewayController(AiGenerationService aiGenerationService) {
        this.aiGenerationService = aiGenerationService;
    }

    @PostMapping(value = "/generate-multimodal", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> generateMultimodal(
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "website_url", required = false) String websiteUrl,
            @RequestParam(value = "youtube_url", required = false) String youtubeUrl,
            @RequestParam(value = "raw_text", required = false) String rawText,
            @RequestPart(value = "pdf_file", required = false) MultipartFile pdfFile,
            Principal principal
    ) {
        log.info("Received blog generation request for user: {}", principal.getName());
        log.info("Topic: {}, Website: {}, YouTube: {}, RawText provided: {}, PDF provided: {}", 
                 topic, websiteUrl, youtubeUrl, rawText != null, pdfFile != null);
                 
        UUID userId = UUID.fromString(principal.getName());
        log.info("Delegating generation request to AI service");
        BlogDraft draft = aiGenerationService.generateMultimodal(userId, topic, websiteUrl, youtubeUrl, rawText, pdfFile).block();
        log.info("Successfully received generated blog draft from AI service, returning CREATED status");
        return ResponseEntity.status(HttpStatus.CREATED).body(BlogResponseDTO.fromEntity(draft));
    }
}
