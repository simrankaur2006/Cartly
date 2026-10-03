package com.ecommerce.controller;

import com.ecommerce.dto.OrderRequest;
import com.ecommerce.model.Order;
import com.ecommerce.security.AuthUtil;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> create(Authentication auth, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createFromCart(AuthUtil.userId(auth), request));
    }

    @GetMapping("/my")
    public List<Order> mine(Authentication auth) {
        return orderService.getMyOrders(AuthUtil.userId(auth));
    }

    @GetMapping("/{id}")
    public Order get(Authentication auth, @PathVariable String id) {
        return orderService.getOrder(id, AuthUtil.userId(auth), AuthUtil.isAdmin(auth));
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(Authentication auth, @PathVariable String id) {
        return orderService.cancel(id, AuthUtil.userId(auth));
    }
}
