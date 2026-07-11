package com.saas.gateway.auth;

public record TwoFactorLoginRequest(String email, String password, String code) {}
