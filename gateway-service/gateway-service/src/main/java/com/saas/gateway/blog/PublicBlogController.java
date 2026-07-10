package com.saas.gateway.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/blogs")
public class PublicBlogController {

    private final BlogRepository blogRepository;
    private final com.saas.gateway.user.UserRepository userRepository;

    public PublicBlogController(BlogRepository blogRepository, com.saas.gateway.user.UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    // DTO to exclude rawMarkdown for the feed
    public record PublicBlogSummary(
            UUID id,
            String topic,
            String title,
            String slug,
            String seoDescription,
            String category,
            Instant createdAt,
            String authorEmail,
            String authorUsername,
            java.util.List<String> tags,
            Integer likesCount,
            Long viewCount,
            Boolean isStaffPick
    ) {}

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PublicBlogSummary>> getPublicBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BlogDraft> publishedBlogs;
        
        if (category != null && !category.isEmpty()) {
            publishedBlogs = blogRepository.findByCategoryAndStatus(category, Status.PUBLISHED, pageable);
        } else {
            publishedBlogs = blogRepository.findByStatus(Status.PUBLISHED, pageable);
        }
        
        Page<PublicBlogSummary> summaryPage = publishedBlogs.map(blog -> new PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCategory(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount(),
                blog.getIsStaffPick()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }

    @GetMapping("/trending")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PublicBlogSummary>> getTrendingBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
        Page<BlogDraft> publishedBlogs;
        
        if (category != null && !category.isEmpty()) {
            publishedBlogs = blogRepository.findByCategoryAndStatus(category, Status.PUBLISHED, pageable);
        } else {
            publishedBlogs = blogRepository.findByStatus(Status.PUBLISHED, pageable);
        }
        
        Page<PublicBlogSummary> summaryPage = publishedBlogs.map(blog -> new PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCategory(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount(),
                blog.getIsStaffPick()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }

    @GetMapping("/top")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PublicBlogSummary>> getTopBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "likesCount", "viewCount"));
        Page<BlogDraft> publishedBlogs;
        
        if (category != null && !category.isEmpty()) {
            publishedBlogs = blogRepository.findByCategoryAndStatus(category, Status.PUBLISHED, pageable);
        } else {
            publishedBlogs = blogRepository.findByStatus(Status.PUBLISHED, pageable);
        }
        
        Page<PublicBlogSummary> summaryPage = publishedBlogs.map(blog -> new PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCategory(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount(),
                blog.getIsStaffPick()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }

    @GetMapping("/staff-picks")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PublicBlogSummary>> getStaffPicks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BlogDraft> staffPicks = blogRepository.findByIsStaffPickTrueAndStatus(Status.PUBLISHED, pageable);
        
        Page<PublicBlogSummary> summaryPage = staffPicks.map(blog -> new PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCategory(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount(),
                blog.getIsStaffPick()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }

    @GetMapping("/{slug}")
    @Transactional
    public ResponseEntity<BlogResponseDTO> getBlogBySlug(@PathVariable String slug) {
        return blogRepository.findBySlugAndStatus(slug, Status.PUBLISHED)
                .map(blog -> {
                    blog.setViewCount(blog.getViewCount() + 1);
                    blogRepository.save(blog);
                    return BlogResponseDTO.fromEntity(blog);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<java.util.Map<String, Long>> getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalBlogs = blogRepository.countByStatus(Status.PUBLISHED);
        return ResponseEntity.ok(java.util.Map.of(
                "activeUsers", totalUsers,
                "publishedBlogs", totalBlogs
        ));
    }
}
