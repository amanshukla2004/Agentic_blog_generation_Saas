package com.saas.gateway.system;

import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.saas.gateway.blog.BlogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/v1/master")
public class MasterAdminController {

    private final UserRepository userRepository;
    private final SystemErrorLogRepository systemErrorLogRepository;
    private final SystemPromptRepository systemPromptRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final BlogRepository blogRepository;

    @Value("${ai-service.base-url}")
    private String aiServiceBaseUrl;

    @Value("${app.security.internal-secret}")
    private String internalSecret;

    public MasterAdminController(UserRepository userRepository, 
                                 SystemErrorLogRepository systemErrorLogRepository,
                                 SystemPromptRepository systemPromptRepository,
                                 SystemSettingRepository systemSettingRepository,
                                 BlogRepository blogRepository) {
        this.userRepository = userRepository;
        this.systemErrorLogRepository = systemErrorLogRepository;
        this.systemPromptRepository = systemPromptRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.blogRepository = blogRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/reset-quota")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<User> resetUserQuota(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            user.setGenerationsCount(0);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/toggle-active")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<User> toggleUserActive(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            user.setIsActive(!user.getIsActive());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/toggle-admin")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<User> toggleUserAdmin(@PathVariable UUID id) {
        return userRepository.findById(id).map(user -> {
            if (user.getRole() == com.saas.gateway.user.Role.MASTER_ADMIN) {
                return ResponseEntity.badRequest().body(user); // Can't toggle master admin
            }
            if (user.getRole() == com.saas.gateway.user.Role.ADMIN) {
                user.setRole(com.saas.gateway.user.Role.USER);
            } else {
                user.setRole(com.saas.gateway.user.Role.ADMIN);
            }
            return ResponseEntity.ok(userRepository.save(user));
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
        if (newValue == null || newValue.isBlank()) {
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
        
        long totalGenerations = userRepository.findAll().stream()
                .mapToLong(User::getGenerationsCount)
                .sum();
        stats.put("totalGenerations", totalGenerations);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/ai-health")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAiHealth() {
        RestTemplate restTemplate = new RestTemplate();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceBaseUrl + "/health", 
                HttpMethod.GET, 
                entity, 
                Map.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("service", "ai-worker");
            error.put("message", e.getMessage());
            return ResponseEntity.status(502).body(error);
        }
    }
}
