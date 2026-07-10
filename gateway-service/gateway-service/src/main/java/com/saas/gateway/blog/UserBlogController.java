package com.saas.gateway.blog;

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

    public UserBlogController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
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
            if (rawMarkdown != null) {
                blog.setRawMarkdown(rawMarkdown);
            }
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
}
