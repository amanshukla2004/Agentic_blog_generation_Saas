package com.saas.gateway.auth;

import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(AuthenticationManager authenticationManager, TokenProvider tokenProvider, UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public AuthResponse authenticate(AuthRequest request) {
        log.info("Attempting to authenticate user with email: {}", request.email());
        
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            log.warn("User {} is not verified", request.email());
            throw new RuntimeException("Please verify your email address before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        log.info("Generating JWT token for authenticated user ID: {}", user.getId());
        String token = tokenProvider.createToken(authentication, user.getId());

        return new AuthResponse(token, false, user.getEmail());
    }

    public void register(AuthRequest request) {
        log.info("Attempting to register new user with email: {}", request.email());
        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(request.email());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.getIsVerified())) {
                log.warn("Registration failed: Email {} is already in use", request.email());
                throw new RuntimeException("Email already in use");
            } else {
                log.info("User exists but is not verified. Resending OTP.");
                String otp = String.format("%06d", new Random().nextInt(999999));
                existingUser.setOtp(otp);
                existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
                existingUser.setPasswordHash(passwordEncoder.encode(request.password()));
                userRepository.save(existingUser);
                emailService.sendVerificationOtpEmail(existingUser.getEmail(), otp);
                return;
            }
        }

        log.info("Saving new user to database");
        User user = new User(request.email(), passwordEncoder.encode(request.password()));
        user.setIsVerified(false);
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        
        userRepository.save(user);

        log.info("User successfully registered, sending OTP email");
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);
    }
    
    public AuthResponse verifySignupOtp(String email, String otp) {
        log.info("Attempting to verify signup OTP for email: {}", email);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new RuntimeException("User is already verified");
        }
        
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP code");
        }
        
        if (user.getOtpExpiry() != null && LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP code has expired");
        }
        
        user.setIsVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        log.info("User successfully verified, generating JWT token");
        
        // We create an unauthenticated token here just to generate the JWT since password is not provided again.
        // In a real scenario, you might want them to login after verifying, or generate JWT using user details directly.
        String token = tokenProvider.createToken(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, java.util.Collections.emptyList()), 
                user.getId());

        return new AuthResponse(token, false, user.getEmail());
    }
}
