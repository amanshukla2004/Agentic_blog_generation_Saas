package com.saas.gateway.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final com.saas.gateway.user.UserRepository userRepository;

    public AuthController(AuthService authService, com.saas.gateway.user.UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        log.info("Received login request for email: {}", request.email());
        AuthResponse response = authService.authenticate(request);
        log.info("Successfully processed login request for email: {}", request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        log.info("Received registration request for email: {}", request.email());
        AuthResponse response = authService.register(request);
        log.info("Successfully processed registration request for email: {}", request.email());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username")
    public ResponseEntity<java.util.Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(java.util.Map.of("available", !exists));
    }
}
