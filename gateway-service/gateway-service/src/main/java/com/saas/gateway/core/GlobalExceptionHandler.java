package com.saas.gateway.core;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import com.saas.gateway.system.SystemErrorLog;
import com.saas.gateway.system.SystemErrorLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final SystemErrorLogRepository systemErrorLogRepository;

    public GlobalExceptionHandler(SystemErrorLogRepository systemErrorLogRepository) {
        this.systemErrorLogRepository = systemErrorLogRepository;
    }

    /**
     * Handles Spring's ResponseStatusException (thrown by services with specific HTTP codes).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        log.warn("ResponseStatusException: {} - {}", ex.getStatusCode(), ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", ex.getStatusCode().value(),
                "error", ex.getReason() != null ? ex.getReason() : "Error occurred"
        ));
    }

    /**
     * Handles validation errors from @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        log.warn("Validation error: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 400,
                "error", message
        ));
    }

    /**
     * Handles bad login credentials.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 401,
                "error", "Invalid email or password."
        ));
    }

    /**
     * Handles disabled/banned user accounts.
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabledException(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 403,
                "error", "Your account has been disabled."
        ));
    }

    /**
     * Handles generic RuntimeExceptions thrown by AuthService, PasswordResetService, etc.
     * Our services throw user-friendly messages, so we pass them through.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("RuntimeException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 400,
                "error", ex.getMessage() != null ? ex.getMessage() : "An error occurred."
        ));
    }

    /**
     * Catch-all for any unexpected checked exceptions. Logs to DB for Master Admin dashboard.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex, HttpServletRequest request) {
        String endpoint = request.getRequestURI();
        String errorMessage = ex.getMessage() != null ? ex.getMessage() : ex.toString();
        log.error("Unexpected exception at {}: {}", endpoint, errorMessage, ex);

        try {
            SystemErrorLog errorLog = new SystemErrorLog(endpoint, errorMessage);
            systemErrorLogRepository.save(errorLog);
        } catch (Exception logEx) {
            log.error("Failed to persist error log to database", logEx);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 500,
                "error", "An unexpected system error occurred. The incident has been logged."
        ));
    }
}
