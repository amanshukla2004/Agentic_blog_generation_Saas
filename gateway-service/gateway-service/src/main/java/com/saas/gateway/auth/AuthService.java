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

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final TwoFactorAuthService twoFactorAuthService;

    public AuthService(AuthenticationManager authenticationManager, TokenProvider tokenProvider, UserRepository userRepository, PasswordEncoder passwordEncoder, TwoFactorAuthService twoFactorAuthService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.twoFactorAuthService = twoFactorAuthService;
    }

    public AuthResponse authenticate(AuthRequest request) {
        log.info("Attempting to authenticate user with email: {}", request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        
        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            log.info("User {} has 2FA enabled, prompting for code", request.email());
            return new AuthResponse(null, true, user.getEmail());
        }

        log.info("Generating JWT token for authenticated user ID: {}", user.getId());
        String token = tokenProvider.createToken(authentication, user.getId());

        return new AuthResponse(token, false, user.getEmail());
    }
    
    public AuthResponse authenticate2FA(TwoFactorLoginRequest request) {
        log.info("Attempting to authenticate user with email and 2FA code: {}", request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        
        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            if (!twoFactorAuthService.isOtpValid(user.getTwoFactorSecret(), request.code())) {
                log.warn("Invalid 2FA code provided for user {}", request.email());
                throw new RuntimeException("Invalid 2FA code");
            }
        }

        log.info("2FA successful, generating JWT token for user ID: {}", user.getId());
        String token = tokenProvider.createToken(authentication, user.getId());

        return new AuthResponse(token, false, user.getEmail());
    }

    public AuthResponse register(AuthRequest request) {
        log.info("Attempting to register new user with email: {}", request.email());
        if (userRepository.findByEmail(request.email()).isPresent()) {
            log.warn("Registration failed: Email {} is already in use", request.email());
            throw new RuntimeException("Email already in use");
        }

        log.info("Saving new user to database");
        User user = new User(request.email(), passwordEncoder.encode(request.password()));
        userRepository.save(user);

        log.info("User successfully registered, proceeding to auto-login");

        return authenticate(request);
    }
}
