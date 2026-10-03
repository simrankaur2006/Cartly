package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    @Indexed
    private String clerkUserId;
    private String customerName;
    private String customerEmail;
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    private double totalAmount;
    private ShippingAddress shippingAddress;
    private PaymentMethod paymentMethod;
    private OrderStatus orderStatus;
    private Instant createdAt;
    private Instant updatedAt;
}
