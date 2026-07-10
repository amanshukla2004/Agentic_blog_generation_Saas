package com.saas.gateway.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {

    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public record UserProfileResponse(
            UUID id,
            String email,
            String username,
            String bio,
            Integer generationsCount,
            SubscriptionTier subscriptionTier,
            Role role
    ) {}

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
                            savedUser.getSubscriptionTier(),
                            savedUser.getRole()
                    )
            );
        }).orElse(ResponseEntity.notFound().build());
    }
}
