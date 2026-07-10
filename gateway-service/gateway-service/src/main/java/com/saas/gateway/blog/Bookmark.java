package com.saas.gateway.blog;

import com.saas.gateway.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_bookmarks")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private BlogDraft blog;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Bookmark() {}

    public Bookmark(User user, BlogDraft blog) {
        this.user = user;
        this.blog = blog;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BlogDraft getBlog() { return blog; }
    public void setBlog(BlogDraft blog) { this.blog = blog; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
