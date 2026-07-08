package com.saas.gateway.admin;

import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/blogs")
public class AdminController {

    private final BlogRepository blogRepository;

    public AdminController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<BlogDraft> publishBlog(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String customSeo = body.get("seoDescription");

        return blogRepository.findById(id).map(blog -> {
            blog.setStatus(Status.PUBLISHED);
            
            // Generate a URL-friendly slug from the title
            String slug = blog.getTitle().toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
            blog.setSlug(slug);

            if (customSeo != null && !customSeo.isBlank()) {
                blog.setSeoDescription(customSeo);
            }

            return ResponseEntity.ok(blogRepository.save(blog));
        }).orElse(ResponseEntity.notFound().build());
    }
}
