package com.saas.gateway.admin;

import com.saas.gateway.blog.BlogDraft;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.BlogResponseDTO;
import com.saas.gateway.blog.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final BlogRepository blogRepository;

    public AdminController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @GetMapping("/blogs")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BlogResponseDTO>> getAllBlogs() {
        List<BlogResponseDTO> dtos = blogRepository.findAll().stream()
                .map(BlogResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/blogs/all-paginated")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<BlogResponseDTO>> getAllBlogsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogDraft> blogsPage;
        
        if (search != null && !search.trim().isEmpty()) {
            blogsPage = blogRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            blogsPage = blogRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(blogsPage.map(BlogResponseDTO::fromEntity));
    }

    @DeleteMapping("/blogs/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id) {
        if (!blogRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        blogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/blogs/bulk-delete")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<Void> bulkDeleteBlogs(@RequestBody List<UUID> ids) {
        if (ids != null && !ids.isEmpty()) {
            blogRepository.deleteAllByIds(ids);
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/blogs/bulk-approve")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<Void> bulkApproveBlogs(@RequestBody List<UUID> ids) {
        if (ids != null && !ids.isEmpty()) {
            List<BlogDraft> blogs = blogRepository.findAllById(ids);
            for (BlogDraft blog : blogs) {
                if (blog.getStatus() != Status.PUBLISHED) {
                    blog.setStatus(Status.PUBLISHED);
                    if (blog.getSlug() == null || blog.getSlug().isBlank()) {
                        String title = blog.getTitle();
                        if (title == null || title.isBlank()) title = "untitled-blog";
                        String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
                        String slug = baseSlug + "-" + blog.getId().toString().substring(0, 8);
                        blog.setSlug(slug);
                    }
                }
            }
            blogRepository.saveAll(blogs);
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/blogs/{id}/publish")
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
    @PutMapping("/blogs/{id}/staff-pick")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<BlogResponseDTO> toggleStaffPick(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        Boolean isStaffPick = body.get("isStaffPick");
        if (isStaffPick == null) {
            return ResponseEntity.badRequest().build();
        }

        return blogRepository.findById(id).map(blog -> {
            blog.setIsStaffPick(isStaffPick);
            blogRepository.save(blog);
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blog));
        }).orElse(ResponseEntity.notFound().build());
    }
}
