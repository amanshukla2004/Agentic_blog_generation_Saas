package com.saas.gateway.blog;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.saas.gateway.gateway.AiGenerationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/blogs")
public class UserBlogController {

    private final BlogRepository blogRepository;
    private final AiGenerationService aiGenerationService;

    public UserBlogController(BlogRepository blogRepository, AiGenerationService aiGenerationService) {
        this.blogRepository = blogRepository;
        this.aiGenerationService = aiGenerationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BlogResponseDTO>> getUserBlogs(Principal principal) {
        // Principal name will be set to the user ID (UUID string) by the JWT filter
        UUID userId = UUID.fromString(principal.getName());
        List<BlogResponseDTO> dtos = blogRepository.findByUserId(userId).stream()
                .map(BlogResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> updateBlog(@PathVariable UUID id, @RequestBody Map<String, String> body, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return blogRepository.findByIdAndUserId(id, userId).map(blog -> {
            String rawMarkdown = body.get("rawMarkdown");
            String title = body.get("title");
            if (rawMarkdown != null) {
                blog.setRawMarkdown(rawMarkdown);
            }
            if (title != null && !title.isBlank()) {
                blog.setTitle(title);
            }
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blogRepository.save(blog)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/revise")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> reviseBlog(@PathVariable UUID id, @RequestBody Map<String, String> body, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return blogRepository.findByIdAndUserId(id, userId).map(blog -> {
            String instruction = body.get("instruction");
            if (instruction == null || instruction.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instruction is required");
            }
            String revisedMarkdown = aiGenerationService.reviseBlog(blog.getRawMarkdown(), instruction).block();
            blog.setRawMarkdown(revisedMarkdown);
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blogRepository.save(blog)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return blogRepository.findByIdAndUserId(id, userId).map(blog -> {
            blogRepository.delete(blog);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> publishBlog(@PathVariable UUID id, @RequestBody Map<String, String> body, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return blogRepository.findByIdAndUserId(id, userId).map(blog -> {
            blog.setStatus(Status.PUBLISHED);
            
            // Generate a URL-friendly slug from the title to avoid NPE and unique constraint violations
            String title = blog.getTitle();
            if (title == null || title.isBlank()) title = "untitled-blog";
            String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
            String slug = baseSlug + "-" + blog.getId().toString().substring(0, 8);
            blog.setSlug(slug);

            String customSeo = body.get("seoDescription");
            String category = body.get("category");
            String seoKeywords = body.get("seoKeywords");

            if (customSeo != null && !customSeo.isBlank()) {
                blog.setSeoDescription(customSeo);
            }
            if (category != null && !category.isBlank()) {
                blog.setCategory(category);
            }
            if (seoKeywords != null && !seoKeywords.isBlank()) {
                blog.setSeoKeywords(seoKeywords);
            }

            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blogRepository.save(blog)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
