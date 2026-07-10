package com.saas.gateway.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import com.saas.gateway.system.AuthorStat;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);

    @Query("SELECT new com.saas.gateway.system.AuthorStat(u.id, u.email, u.username, COUNT(b.id), COALESCE(SUM(b.viewCount), 0)) " +
           "FROM User u JOIN BlogDraft b ON u.id = b.user.id " +
           "WHERE b.status = 'PUBLISHED' " +
           "GROUP BY u.id, u.email, u.username " +
           "ORDER BY COUNT(b.id) DESC, SUM(b.viewCount) DESC")
    List<AuthorStat> getAuthorsStats();
}
