package com.ecommerce.controller;

import com.ecommerce.dto.ProfileRequest;
import com.ecommerce.model.UserProfile;
import com.ecommerce.security.AuthUtil;
import com.ecommerce.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public UserProfile get(Authentication auth) {
        return profileService.get(AuthUtil.userId(auth));
    }

    @PutMapping
    public UserProfile update(Authentication auth, @Valid @RequestBody ProfileRequest request) {
        return profileService.update(AuthUtil.userId(auth), request);
    }
}
