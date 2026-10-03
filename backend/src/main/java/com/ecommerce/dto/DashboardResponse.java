package com.ecommerce.dto;

import com.ecommerce.model.Product;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private long totalProducts;
    private long totalOrders;
    private long totalCustomers;
    private double totalRevenue;
    private long pendingOrders;
    private long lowStockCount;
    private List<Product> lowStockProducts;
    private Map<String, Long> ordersByStatus;
    private List<DailySales> salesLast7Days;
}
