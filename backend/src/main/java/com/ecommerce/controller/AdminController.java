package com.ecommerce.controller;

import com.ecommerce.config.AppProperties;
import com.ecommerce.dto.DashboardResponse;
import com.ecommerce.dto.StatusRequest;
import com.ecommerce.dto.StockRequest;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.model.Product;
import com.ecommerce.model.UserProfile;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.DashboardService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ProductService;
import com.ecommerce.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Every route under /api/admin requires ROLE_ADMIN (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;
    private final OrderService orderService;
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final ProfileService profileService;
    private final AppProperties props;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.getDashboard();
    }

    @GetMapping("/orders")
    public List<Order> orders(@RequestParam(required = false) OrderStatus status) {
        return orderService.getAllOrders(status);
    }

    @PutMapping("/orders/{id}/status")
    public Order updateStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }

    @GetMapping("/customers")
    public List<UserProfile> customers() {
        return profileService.getAllCustomers();
    }

    @GetMapping("/inventory")
    public List<Product> lowStock(@RequestParam(required = false) Integer threshold) {
        int limit = threshold == null ? props.getLowStockThreshold() : threshold;
        return productRepository.findByStockLessThanEqualOrderByStockAsc(limit);
    }

    @PutMapping("/inventory/{productId}")
    public Product updateStock(@PathVariable String productId, @Valid @RequestBody StockRequest request) {
        return productService.updateStock(productId, request.getStock());
    }
}
