package com.saas.gateway.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<BlogDraft, UUID> {
    
    // For Tier 0: Public Feed
    Page<BlogDraft> findByStatus(Status status, Pageable pageable);
    Page<BlogDraft> findByCategoryAndStatus(String category, Status status, Pageable pageable);
    Optional<BlogDraft> findBySlugAndStatus(String slug, Status status);
    Page<BlogDraft> findByIsStaffPickTrueAndStatus(Status status, Pageable pageable);
    
    // For Tier 1: User Dashboard
    List<BlogDraft> findByUserId(UUID userId);
    Optional<BlogDraft> findByIdAndUserId(UUID id, UUID userId);
    List<BlogDraft> findByStatus(Status status);
    
    long countByStatus(Status status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE BlogDraft b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@org.springframework.data.repository.query.Param("id") UUID id);
}
