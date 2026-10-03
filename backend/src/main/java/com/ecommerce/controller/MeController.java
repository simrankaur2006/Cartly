package com.ecommerce.controller;

import com.ecommerce.dto.MeResponse;
import com.ecommerce.security.AuthUtil;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    /** Lets the frontend know who the backend thinks the caller is, and whether they are an admin. */
    @GetMapping
    public MeResponse me(Authentication auth) {
        return new MeResponse(AuthUtil.userId(auth), AuthUtil.isAdmin(auth));
    }
}
