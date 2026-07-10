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
    Optional<BlogDraft> findBySlugAndStatus(String slug, Status status);
    
    // For Tier 1: User Dashboard
    List<BlogDraft> findByUserId(UUID userId);
    Optional<BlogDraft> findByIdAndUserId(UUID id, UUID userId);
    
    long countByStatus(Status status);
}
