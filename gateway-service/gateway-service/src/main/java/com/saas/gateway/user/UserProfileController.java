package com.saas.gateway.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import com.saas.gateway.system.SystemSettingRepository;

@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {

    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;

    public UserProfileController(UserRepository userRepository, SystemSettingRepository systemSettingRepository) {
        this.userRepository = userRepository;
        this.systemSettingRepository = systemSettingRepository;
    }

    public record UserProfileResponse(
            UUID id,
            String email,
            String username,
            String bio,
            Integer generationsCount,
            Integer generationsLimit,
            SubscriptionTier subscriptionTier,
            Role role
    ) {}

    private int getLimitForUser(User user) {
        if (user.getRole() == Role.MASTER_ADMIN) return 999999;
        if (user.getRole() == Role.ADMIN) {
            return systemSettingRepository.findBySettingKey("ADMIN_GENERATION_LIMIT")
                    .map(s -> Integer.parseInt(s.getSettingValue()))
                    .orElse(30);
        }
        return systemSettingRepository.findBySettingKey("USER_GENERATION_LIMIT")
                .map(s -> Integer.parseInt(s.getSettingValue()))
                .orElse(6);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return userRepository.findById(userId).map(user -> ResponseEntity.ok(
                new UserProfileResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getBio(),
                        user.getGenerationsCount(),
                        getLimitForUser(user),
                        user.getSubscriptionTier(),
                        user.getRole()
                )
        )).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<UserProfileResponse> updateProfile(Principal principal, @RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(principal.getName());
        return userRepository.findById(userId).map(user -> {
            if (body.containsKey("username")) {
                user.setUsername(body.get("username"));
            }
            if (body.containsKey("bio")) {
                user.setBio(body.get("bio"));
            }
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(
                    new UserProfileResponse(
                            savedUser.getId(),
                            savedUser.getEmail(),
                            savedUser.getUsername(),
                            savedUser.getBio(),
                            savedUser.getGenerationsCount(),
                            getLimitForUser(savedUser),
                            savedUser.getSubscriptionTier(),
                            savedUser.getRole()
                    )
            );
        }).orElse(ResponseEntity.notFound().build());
    }
}
