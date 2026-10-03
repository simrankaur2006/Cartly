package com.ecommerce.controller;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.QuantityRequest;
import com.ecommerce.model.Cart;
import com.ecommerce.security.AuthUtil;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public Cart get(Authentication auth) {
        return cartService.getCart(AuthUtil.userId(auth));
    }

    @PostMapping("/items")
    public Cart add(Authentication auth, @Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(AuthUtil.userId(auth), request);
    }

    @PutMapping("/items/{productId}")
    public Cart update(Authentication auth, @PathVariable String productId, @Valid @RequestBody QuantityRequest request) {
        return cartService.updateQuantity(AuthUtil.userId(auth), productId, request.getQuantity());
    }

    @DeleteMapping("/items/{productId}")
    public Cart remove(Authentication auth, @PathVariable String productId) {
        return cartService.removeItem(AuthUtil.userId(auth), productId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(Authentication auth) {
        cartService.clear(AuthUtil.userId(auth));
        return ResponseEntity.noContent().build();
    }
}
