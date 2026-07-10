package com.saas.gateway.system;

import java.util.UUID;

public record AuthorStat(
        UUID userId,
        String email,
        String username,
        Long totalBlogs,
        Long totalViews
) {}
