package com.ecommerce.service;

import com.ecommerce.config.AppProperties;
import com.ecommerce.dto.DailySales;
import com.ecommerce.dto.DashboardResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProfileService profileService;
    private final MongoTemplate mongoTemplate;
    private final AppProperties props;

    public DashboardResponse getDashboard() {
        int threshold = props.getLowStockThreshold();
        List<Product> lowStock = productRepository.findByStockLessThanEqualOrderByStockAsc(threshold);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            byStatus.put(status.name(), orderRepository.countByOrderStatus(status));
        }

        return DashboardResponse.builder()
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.count())
                .totalCustomers(profileService.count())
                .totalRevenue(totalRevenue())
                .pendingOrders(byStatus.get(OrderStatus.PLACED.name()))
                .lowStockCount(lowStock.size())
                .lowStockProducts(lowStock.stream().limit(5).toList())
                .ordersByStatus(byStatus)
                .salesLast7Days(salesLast7Days())
                .build();
    }

    /** Revenue from every order that was not cancelled. */
    private double totalRevenue() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("orderStatus").ne(OrderStatus.CANCELLED.name())),
                Aggregation.group().sum("totalAmount").as("total"));
        Document result = mongoTemplate.aggregate(aggregation, "orders", Document.class).getUniqueMappedResult();
        if (result == null || result.get("total") == null) {
            return 0;
        }
        return Math.round(((Number) result.get("total")).doubleValue() * 100.0) / 100.0;
    }

    private List<DailySales> salesLast7Days() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        LocalDate start = today.minusDays(6);
        List<Order> orders = orderRepository.findByCreatedAtGreaterThanEqual(start.atStartOfDay(zone).toInstant());

        Map<LocalDate, double[]> buckets = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            buckets.put(start.plusDays(i), new double[]{0, 0});
        }
        for (Order order : orders) {
            if (order.getOrderStatus() == OrderStatus.CANCELLED) {
                continue;
            }
            double[] bucket = buckets.get(order.getCreatedAt().atZone(zone).toLocalDate());
            if (bucket != null) {
                bucket[0] += order.getTotalAmount();
                bucket[1] += 1;
            }
        }
        List<DailySales> result = new ArrayList<>();
        buckets.forEach((date, v) -> result.add(new DailySales(date.toString(), Math.round(v[0] * 100.0) / 100.0, (long) v[1])));
        return result;
    }
}
