package com.saas.gateway.blog;

import java.time.Instant;
import java.util.UUID;

public record BlogResponseDTO(
        UUID id,
        String topic,
        String title,
        String slug,
        String rawMarkdown,
        String seoDescription,
        String seoKeywords,
        String category,
        Status status,
        Instant createdAt,
        String authorEmail,
        String authorUsername,
        String authorBio,
        java.util.List<String> tags,
        Integer likesCount,
        Long viewCount
) {
    public static BlogResponseDTO fromEntity(BlogDraft blog) {
        return new BlogResponseDTO(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getRawMarkdown(),
                blog.getSeoDescription(),
                blog.getSeoKeywords(),
                blog.getCategory(),
                blog.getStatus(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getUser() != null ? blog.getUser().getBio() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount()
        );
    }
}
