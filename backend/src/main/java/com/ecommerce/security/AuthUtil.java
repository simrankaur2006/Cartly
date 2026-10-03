package com.ecommerce.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;

public final class AuthUtil {
    private AuthUtil() {
    }

    /** Returns the Clerk user id (JWT "sub" claim) of the authenticated caller. Never read it from request bodies. */
    public static String userId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication is required");
        }
        return authentication.getName();
    }

    public static boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
