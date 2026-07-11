package com.saas.gateway.auth;

public record AuthResponse(String token, boolean requires2fa, String email) {}
