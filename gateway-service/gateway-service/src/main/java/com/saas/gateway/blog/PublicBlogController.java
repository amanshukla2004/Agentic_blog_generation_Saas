package com.saas.gateway.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/blogs")
public class PublicBlogController {

    private final BlogRepository blogRepository;

    public PublicBlogController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    // DTO to exclude rawMarkdown for the feed
    public record PublicBlogSummary(
            UUID id,
            String topic,
            String title,
            String slug,
            String seoDescription,
            Instant createdAt
    ) {}

    @GetMapping
    public ResponseEntity<Page<PublicBlogSummary>> getPublicBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BlogDraft> publishedBlogs = blogRepository.findByStatus(Status.PUBLISHED, pageable);
        
        Page<PublicBlogSummary> summaryPage = publishedBlogs.map(blog -> new PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCreatedAt()
        ));
        
        return ResponseEntity.ok(summaryPage);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogDraft> getBlogBySlug(@PathVariable String slug) {
        return blogRepository.findBySlugAndStatus(slug, Status.PUBLISHED)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
