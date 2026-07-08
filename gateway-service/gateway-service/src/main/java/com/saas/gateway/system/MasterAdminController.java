package com.saas.gateway.system;

import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/master")
public class MasterAdminController {

    private final UserRepository userRepository;
    private final SystemErrorLogRepository systemErrorLogRepository;
    private final SystemPromptRepository systemPromptRepository;

    public MasterAdminController(UserRepository userRepository, 
                                 SystemErrorLogRepository systemErrorLogRepository,
                                 SystemPromptRepository systemPromptRepository) {
        this.userRepository = userRepository;
        this.systemErrorLogRepository = systemErrorLogRepository;
        this.systemPromptRepository = systemPromptRepository;
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

    @GetMapping("/errors")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<SystemErrorLog>> getSystemErrors() {
        return ResponseEntity.ok(systemErrorLogRepository.findAll());
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
}
