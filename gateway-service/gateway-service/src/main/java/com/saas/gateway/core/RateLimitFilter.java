package com.saas.gateway.core;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Simple in-memory sliding-window rate limiter for authentication endpoints.
 * Limits each IP to a configurable number of requests per time window
 * to prevent brute-force attacks on login, OTP verification, and registration.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    /**
     * Maximum requests per IP per window for auth endpoints.
     */
    private static final int MAX_AUTH_REQUESTS = 15;

    /**
     * Sliding window duration in seconds.
     */
    private static final long WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only rate-limit authentication endpoints
        if (!path.startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String key = clientIp + ":" + path;
        long now = Instant.now().getEpochSecond();

        Deque<Long> timestamps = requestLog.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        // Evict entries outside the sliding window
        while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > WINDOW_SECONDS) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_AUTH_REQUESTS) {
            log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"error\":\"Too many requests. Please try again later.\",\"timestamp\":\"" + Instant.now() + "\"}"
            );
            return;
        }

        timestamps.addLast(now);
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the real client IP, accounting for reverse proxies (X-Forwarded-For).
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP (the original client)
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
