package com.saas.gateway.blog;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blogs")
public class UserBlogController {

    private final BlogRepository blogRepository;

    public UserBlogController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<List<BlogDraft>> getUserBlogs(Principal principal) {
        // Principal name will be set to the user ID (UUID string) by the JWT filter
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(blogRepository.findByUserId(userId));
    }
}
