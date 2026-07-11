package com.saas.gateway.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final com.saas.gateway.user.UserRepository userRepository;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, com.saas.gateway.user.UserRepository userRepository, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("Received login request for email: {}", request.email());
        AuthResponse response = authService.authenticate(request);
        log.info("Successfully processed login request for email: {}", request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<java.util.Map<String, String>> register(@Valid @RequestBody AuthRequest request) {
        log.info("Received registration request for email: {}", request.email());
        authService.register(request);
        log.info("Successfully processed registration request for email: {}", request.email());
        return ResponseEntity.ok(java.util.Map.of("message", "Registration successful. Please check your email for the verification OTP."));
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<AuthResponse> verifySignup(@RequestParam String email, @RequestParam String otp) {
        log.info("Received verification request for email: {}", email);
        AuthResponse response = authService.verifySignupOtp(email, otp);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username")
    public ResponseEntity<java.util.Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(java.util.Map.of("available", !exists));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@RequestParam String email) {
        log.info("Received forgot password request for email: {}", email);
        passwordResetService.initiatePasswordReset(email);
        return ResponseEntity.ok(java.util.Map.of("message", "If that email is registered, a password reset OTP has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        log.info("Received reset password request for email: {}", email);
        passwordResetService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(java.util.Map.of("message", "Password successfully reset."));
    }
}
