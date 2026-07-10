package com.saas.gateway.blog;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/blogs")
public class AdminBlogController {

    private final BlogRepository blogRepository;

    public AdminBlogController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @PutMapping("/{id}/staff-pick")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<BlogResponseDTO> toggleStaffPick(@PathVariable UUID id, @RequestBody java.util.Map<String, Boolean> body) {
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
    
    public record AdminBlogSummary(
            UUID id,
            String title,
            String slug,
            Status status,
            java.time.Instant createdAt,
            String authorEmail,
            Boolean isStaffPick,
            Long viewCount
    ) {}

    @GetMapping("/all-paginated")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<org.springframework.data.domain.Page<AdminBlogSummary>> getAllBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<BlogDraft> blogs = blogRepository.findAll(pageable);
        
        org.springframework.data.domain.Page<AdminBlogSummary> summaryPage = blogs.map(blog -> new AdminBlogSummary(
                blog.getId(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getStatus(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getIsStaffPick(),
                blog.getViewCount()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }
}
