package com.saas.gateway.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {
    Page<Bookmark> findByUserId(UUID userId, Pageable pageable);
    List<Bookmark> findByUserId(UUID userId);
    Optional<Bookmark> findByUserIdAndBlogId(UUID userId, UUID blogId);
    void deleteByUserIdAndBlogId(UUID userId, UUID blogId);
}
