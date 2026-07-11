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
    private final PasswordResetService passwordResetService;
    private final TwoFactorAuthService twoFactorAuthService;

    public AuthController(AuthService authService, com.saas.gateway.user.UserRepository userRepository, PasswordResetService passwordResetService, TwoFactorAuthService twoFactorAuthService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordResetService = passwordResetService;
        this.twoFactorAuthService = twoFactorAuthService;
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
    @PostMapping("/login/2fa")
    public ResponseEntity<AuthResponse> login2FA(@RequestBody TwoFactorLoginRequest request) {
        log.info("Received 2FA login request for email: {}", request.email());
        AuthResponse response = authService.authenticate2FA(request);
        log.info("Successfully processed 2FA login request for email: {}", request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@RequestParam String email) {
        log.info("Received forgot password request for email: {}", email);
        passwordResetService.initiatePasswordReset(email);
        return ResponseEntity.ok(java.util.Map.of("message", "If that email is registered, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        log.info("Received reset password request");
        passwordResetService.resetPassword(token, newPassword);
        return ResponseEntity.ok(java.util.Map.of("message", "Password successfully reset."));
    }

    @PostMapping("/2fa/generate")
    public ResponseEntity<java.util.Map<String, String>> generate2fa(@RequestParam String email) {
        // In a real app, this should require authentication and use the logged-in user's email.
        // For simplicity, we are passing email.
        com.saas.gateway.user.User user = userRepository.findByEmail(email).orElseThrow();
        String secret = twoFactorAuthService.generateNewSecret();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);
        
        String qrCodeUri = twoFactorAuthService.generateQrCodeImageUri(secret, email);
        return ResponseEntity.ok(java.util.Map.of("qrCodeUri", qrCodeUri));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<java.util.Map<String, String>> enable2fa(@RequestParam String email, @RequestParam String code) {
        com.saas.gateway.user.User user = userRepository.findByEmail(email).orElseThrow();
        
        if (twoFactorAuthService.isOtpValid(user.getTwoFactorSecret(), code)) {
            user.setIs2faEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(java.util.Map.of("message", "2FA successfully enabled."));
        } else {
            throw new RuntimeException("Invalid 2FA code");
        }
    }
}
