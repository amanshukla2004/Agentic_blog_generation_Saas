package com.saas.gateway.admin;

import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.BlogResponseDTO;
import com.saas.gateway.blog.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/blogs")
public class AdminController {

    private final BlogRepository blogRepository;

    public AdminController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BlogResponseDTO>> getAllBlogs() {
        List<BlogResponseDTO> dtos = blogRepository.findAll().stream()
                .map(BlogResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id) {
        if (!blogRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        blogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> publishBlog(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String customSeo = body.get("seoDescription");
        String category = body.get("category");
        String seoKeywords = body.get("seoKeywords");

        return blogRepository.findById(id).map(blog -> {
            blog.setStatus(Status.PUBLISHED);
            
            // Generate a URL-friendly slug from the title to avoid NPE and unique constraint violations
            String title = blog.getTitle();
            if (title == null || title.isBlank()) title = "untitled-blog";
            String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
            String slug = baseSlug + "-" + blog.getId().toString().substring(0, 8);
            blog.setSlug(slug);

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
