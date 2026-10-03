package com.ecommerce.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    /** Clerk Frontend API URL (the JWT issuer), e.g. https://your-app-12.clerk.accounts.dev */
    private String clerkIssuer;
    private List<String> adminClerkUserIds = new ArrayList<>();
    private List<String> corsAllowedOrigins = new ArrayList<>();
    private int lowStockThreshold = 10;

    public boolean isAdmin(String clerkUserId) {
        return clerkUserId != null && adminClerkUserIds.stream().anyMatch(id -> id.trim().equals(clerkUserId));
    }
}
