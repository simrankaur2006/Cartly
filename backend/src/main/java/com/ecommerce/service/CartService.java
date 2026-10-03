package com.ecommerce.service;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public Cart getCart(String userId) {
        return cartRepository.findByClerkUserId(userId).orElseGet(() -> Cart.builder()
                .clerkUserId(userId)
                .items(new ArrayList<>())
                .updatedAt(Instant.now())
                .build());
    }

    public Cart addItem(String userId, CartItemRequest request) {
        Product product = findProduct(request.getProductId());
        Cart cart = getCart(userId);
        CartItem existing = findItem(cart, product.getId());
        int newQuantity = request.getQuantity() + (existing == null ? 0 : existing.getQuantity());
        ensureStock(product, newQuantity);

        if (existing == null) {
            cart.getItems().add(CartItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(newQuantity)
                    .imageUrl(product.getImageUrl())
                    .build());
        } else {
            existing.setQuantity(newQuantity);
            existing.setPrice(product.getPrice());
            existing.setProductName(product.getName());
            existing.setImageUrl(product.getImageUrl());
        }
        return save(cart);
    }

    public Cart updateQuantity(String userId, String productId, int quantity) {
        Cart cart = getCart(userId);
        CartItem item = findItem(cart, productId);
        if (item == null) {
            throw new ResourceNotFoundException("Item not found in cart");
        }
        ensureStock(findProduct(productId), quantity);
        item.setQuantity(quantity);
        return save(cart);
    }

    public Cart removeItem(String userId, String productId) {
        Cart cart = getCart(userId);
        boolean removed = cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        if (!removed) {
            throw new ResourceNotFoundException("Item not found in cart");
        }
        return save(cart);
    }

    public void clear(String userId) {
        cartRepository.findByClerkUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            save(cart);
        });
    }

    private Product findProduct(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private CartItem findItem(Cart cart, String productId) {
        return cart.getItems().stream().filter(i -> i.getProductId().equals(productId)).findFirst().orElse(null);
    }

    private void ensureStock(Product product, int quantity) {
        if (quantity > product.getStock()) {
            throw new InsufficientStockException("Only " + product.getStock() + " unit(s) of '" + product.getName() + "' in stock");
        }
    }

    private Cart save(Cart cart) {
        cart.setUpdatedAt(Instant.now());
        return cartRepository.save(cart);
    }
}
