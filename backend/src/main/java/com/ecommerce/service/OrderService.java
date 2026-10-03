package com.ecommerce.service;

import com.ecommerce.dto.OrderRequest;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ForbiddenException;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.model.Product;
import com.ecommerce.model.UserProfile;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserProfileRepository profileRepository;
    private final CartService cartService;
    private final MongoTemplate mongoTemplate;

    public Order createFromCart(String userId, OrderRequest request) {
        Cart cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        List<OrderItem> items = new ArrayList<>();
        List<OrderItem> reserved = new ArrayList<>();
        double total = 0;
        try {
            for (CartItem cartItem : cart.getItems()) {
                Product product = productRepository.findById(cartItem.getProductId())
                        .orElseThrow(() -> new BadRequestException("'" + cartItem.getProductName() + "' is no longer available"));
                // atomic decrement: only succeeds when enough stock is left
                Product updated = mongoTemplate.findAndModify(
                        Query.query(Criteria.where("id").is(product.getId()).and("stock").gte(cartItem.getQuantity())),
                        new Update().inc("stock", -cartItem.getQuantity()).set("updatedAt", Instant.now()),
                        FindAndModifyOptions.options().returnNew(true),
                        Product.class);
                if (updated == null) {
                    throw new InsufficientStockException("Not enough stock for '" + product.getName() + "'");
                }
                // price always comes from the database, never from the client
                OrderItem orderItem = OrderItem.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .price(product.getPrice())
                        .quantity(cartItem.getQuantity())
                        .imageUrl(product.getImageUrl())
                        .build();
                reserved.add(orderItem);
                items.add(orderItem);
                total += product.getPrice() * cartItem.getQuantity();
            }
        } catch (RuntimeException ex) {
            restoreStock(reserved);
            throw ex;
        }

        String email = profileRepository.findByClerkUserId(userId).map(UserProfile::getEmail).orElse(null);
        Instant now = Instant.now();
        Order order = Order.builder()
                .clerkUserId(userId)
                .customerName(request.getShippingAddress().getFullName())
                .customerEmail(email)
                .items(items)
                .totalAmount(round(total))
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .orderStatus(OrderStatus.PLACED)
                .createdAt(now)
                .updatedAt(now)
                .build();
        try {
            order = orderRepository.save(order);
        } catch (RuntimeException ex) {
            restoreStock(reserved);
            throw ex;
        }
        cartService.clear(userId);
        return order;
    }

    public List<Order> getMyOrders(String userId) {
        return orderRepository.findByClerkUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrder(String orderId, String userId, boolean admin) {
        Order order = findOrder(orderId);
        if (!admin && !order.getClerkUserId().equals(userId)) {
            throw new ForbiddenException("You can only view your own orders");
        }
        return order;
    }

    public Order cancel(String orderId, String userId) {
        Order order = findOrder(orderId);
        if (!order.getClerkUserId().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own orders");
        }
        if (order.getOrderStatus() != OrderStatus.PLACED && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Orders that are " + order.getOrderStatus() + " cannot be cancelled");
        }
        return markCancelled(order);
    }

    public List<Order> getAllOrders(OrderStatus status) {
        return status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc()
                : orderRepository.findByOrderStatusOrderByCreatedAtDesc(status);
    }

    public Order updateStatus(String orderId, OrderStatus newStatus) {
        Order order = findOrder(orderId);
        OrderStatus current = order.getOrderStatus();
        if (current == newStatus) {
            return order;
        }
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new BadRequestException("A " + current + " order can no longer be changed");
        }
        if (newStatus == OrderStatus.CANCELLED) {
            return markCancelled(order);
        }
        order.setOrderStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    private Order markCancelled(Order order) {
        restoreStock(order.getItems());
        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    private void restoreStock(List<OrderItem> items) {
        for (OrderItem item : items) {
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("id").is(item.getProductId())),
                    new Update().inc("stock", item.getQuantity()).set("updatedAt", Instant.now()),
                    Product.class);
        }
    }

    private Order findOrder(String id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
