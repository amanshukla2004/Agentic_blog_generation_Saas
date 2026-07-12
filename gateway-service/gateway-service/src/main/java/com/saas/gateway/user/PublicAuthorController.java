package com.saas.gateway.user;

import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.Status;
import com.saas.gateway.blog.BlogResponseDTO;
import com.saas.gateway.system.AuthorStat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/authors")
public class PublicAuthorController {

    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    public PublicAuthorController(UserRepository userRepository, BlogRepository blogRepository) {
        this.userRepository = userRepository;
        this.blogRepository = blogRepository;
    }

    public record AuthorProfileDTO(
            String username,
            String email,
            String bio,
            long totalViews,
            List<BlogResponseDTO> recentBlogs
    ) {}

    @GetMapping("/top")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AuthorStat>> getTopAuthors() {
        List<AuthorStat> stats = userRepository.getAuthorsStats();
        // Return top 5
        if (stats.size() > 5) {
            stats = stats.subList(0, 5);
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{username}")
    @Transactional(readOnly = true)
    public ResponseEntity<AuthorProfileDTO> getAuthorProfile(@PathVariable String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .map(user -> {
                    List<BlogResponseDTO> blogs = blogRepository.findByUserId(user.getId()).stream()
                            .filter(b -> b.getStatus() == Status.PUBLISHED)
                            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                            .map(BlogResponseDTO::fromEntity)
                            .collect(Collectors.toList());
                    
                    long totalViews = blogs.stream().mapToLong(b -> b.viewCount() != null ? b.viewCount() : 0).sum();
                    
                    return ResponseEntity.ok(new AuthorProfileDTO(
                            user.getUsername(),
                            user.getEmail(),
                            user.getBio(),
                            totalViews,
                            blogs
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
