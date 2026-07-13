package com.saas.gateway.system;

import com.saas.gateway.user.User;
import com.saas.gateway.user.Role;
import com.saas.gateway.user.SubscriptionTier;
import com.saas.gateway.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.saas.gateway.blog.BlogRepository;
import com.saas.gateway.blog.BlogResponseDTO;
import com.saas.gateway.blog.Status;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/v1/master")
public class MasterAdminController {

    /**
     * Safe DTO that excludes sensitive fields (passwordHash, otp, otpExpiry).
     */
    public record UserDTO(
            UUID id,
            String email,
            String username,
            String bio,
            Integer generationsCount,
            SubscriptionTier subscriptionTier,
            Boolean isActive,
            Role role,
            Boolean isVerified
    ) {
        public static UserDTO fromEntity(User user) {
            return new UserDTO(
                    user.getId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getBio(),
                    user.getGenerationsCount(),
                    user.getSubscriptionTier(),
                    user.getIsActive(),
                    user.getRole(),
                    user.getIsVerified()
            );
        }
    }

    private final UserRepository userRepository;
    private final SystemErrorLogRepository systemErrorLogRepository;
    private final SystemPromptRepository systemPromptRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final BlogRepository blogRepository;
    private final WebClient aiWebClient;

    public MasterAdminController(UserRepository userRepository, 
                                 SystemErrorLogRepository systemErrorLogRepository,
                                 SystemPromptRepository systemPromptRepository,
                                 SystemSettingRepository systemSettingRepository,
                                 BlogRepository blogRepository,
                                 WebClient.Builder webClientBuilder,
                                 @Value("${ai-service.base-url}") String aiServiceBaseUrl,
                                 @Value("${app.security.internal-secret}") String internalSecret) {
        this.userRepository = userRepository;
        this.systemErrorLogRepository = systemErrorLogRepository;
        this.systemPromptRepository = systemPromptRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.blogRepository = blogRepository;
        this.aiWebClient = webClientBuilder.baseUrl(aiServiceBaseUrl)
                .defaultHeader("X-Internal-Secret", internalSecret)
                .build();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("email").ascending());
        Page<User> usersPage;
        
        if (search != null && !search.trim().isEmpty()) {
            usersPage = userRepository.findByEmailContainingIgnoreCase(search.trim(), pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(usersPage.map(UserDTO::fromEntity));
    }

    @PostMapping("/users/{id}/reset-quota")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<UserDTO> resetUserQuota(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            user.setGenerationsCount(0);
            return ResponseEntity.ok(UserDTO.fromEntity(userRepository.save(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/toggle-active")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<UserDTO> toggleUserActive(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            user.setIsActive(!user.getIsActive());
            return ResponseEntity.ok(UserDTO.fromEntity(userRepository.save(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/toggle-admin")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<UserDTO> toggleUserAdmin(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            if (user.getRole() == Role.MASTER_ADMIN) {
                return ResponseEntity.badRequest().body(UserDTO.fromEntity(user)); // Can't toggle master admin
            }
            if (user.getRole() == Role.ADMIN) {
                user.setRole(Role.USER);
            } else {
                user.setRole(Role.ADMIN);
            }
            return ResponseEntity.ok(UserDTO.fromEntity(userRepository.save(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/errors")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<SystemErrorLog>> getSystemErrors() {
        return ResponseEntity.ok(systemErrorLogRepository.findAll());
    }

    @GetMapping("/prompts")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<SystemPrompt>> getSystemPrompts() {
        return ResponseEntity.ok(systemPromptRepository.findAll());
    }

    @PutMapping("/prompts/{name}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<SystemPrompt> updatePrompt(@PathVariable String name, @RequestBody Map<String, String> body) {
        String newPromptText = body.get("promptText");
        if (newPromptText == null || newPromptText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return systemPromptRepository.findByPromptName(name).map(prompt -> {
            prompt.setPromptText(newPromptText);
            return ResponseEntity.ok(systemPromptRepository.save(prompt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/authors/stats")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<AuthorStat>> getAuthorsStats() {
        return ResponseEntity.ok(userRepository.getAuthorsStats());
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<SystemSetting>> getSystemSettings() {
        return ResponseEntity.ok(systemSettingRepository.findAll());
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<SystemSetting> updateSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        String newValue = body.get("settingValue");
        if (newValue == null) {
            return ResponseEntity.badRequest().build();
        }

        return systemSettingRepository.findBySettingKey(key).map(setting -> {
            setting.setSettingValue(newValue);
            return ResponseEntity.ok(systemSettingRepository.save(setting));
        }).orElseGet(() -> {
            SystemSetting newSetting = new SystemSetting(key, newValue);
            return ResponseEntity.ok(systemSettingRepository.save(newSetting));
        });
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalBlogs", blogRepository.count());
        stats.put("totalGenerations", userRepository.sumGenerationsCount());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/trends")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Map<String, List<Integer>>> getStatsTrends() {
        // Since we don't have historical data tables (like User.createdAt),
        // we generate a 7-day mock trend for the sparklines to maintain the UI/UX aura.
        List<Integer> userTrend = List.of(2, 3, 5, 4, 7, 10, 12);
        List<Integer> blogTrend = List.of(5, 8, 7, 12, 15, 20, 25);
        
        Map<String, List<Integer>> trends = new HashMap<>();
        trends.put("users", userTrend);
        trends.put("blogs", blogTrend);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/ai-health")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAiHealth() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = aiWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("service", "ai-worker");
            error.put("message", e.getMessage());
            return ResponseEntity.status(502).body(error);
        }
    }
    @GetMapping("/blogs/reviews")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<BlogResponseDTO>> getReviewRequests() {
        List<BlogResponseDTO> requests = blogRepository.findByStatus(Status.IN_REVIEW).stream()
                .map(BlogResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/blogs/{id}/accept-review")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> acceptReview(@PathVariable UUID id) {
        return blogRepository.findById(id).map(blog -> {
            if (blog.getStatus() != Status.IN_REVIEW) {
                return ResponseEntity.badRequest().<BlogResponseDTO>build();
            }
            blog.setStatus(Status.PUBLISHED);
            if (blog.getSlug() == null || blog.getSlug().isBlank()) {
                String title = blog.getTitle();
                if (title == null || title.isBlank()) title = "untitled-blog";
                String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
                String slug = baseSlug + "-" + blog.getId().toString().substring(0, 8);
                blog.setSlug(slug);
            }
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blogRepository.save(blog)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/blogs/{id}/reject-review")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<BlogResponseDTO> rejectReview(@PathVariable UUID id) {
        return blogRepository.findById(id).map(blog -> {
            if (blog.getStatus() != Status.IN_REVIEW) {
                return ResponseEntity.badRequest().<BlogResponseDTO>build();
            }
            blog.setStatus(Status.REJECTED);
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blogRepository.save(blog)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
