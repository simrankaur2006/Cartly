package com.ecommerce.service;

import com.ecommerce.dto.PageResponse;
import com.ecommerce.dto.ProductRequest;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MongoTemplate mongoTemplate;

    public PageResponse<Product> search(String search, String category, String sort, int page, int size) {
        Query query = new Query();
        List<Criteria> filters = new ArrayList<>();
        if (StringUtils.hasText(search)) {
            String pattern = Pattern.quote(search.trim());
            filters.add(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern, "i"),
                    Criteria.where("description").regex(pattern, "i")));
        }
        if (StringUtils.hasText(category)) {
            filters.add(Criteria.where("category").is(category.trim()));
        }
        if (!filters.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(filters.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Product.class);

        Sort order = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize, order.and(Sort.by("id")));
        List<Product> content = mongoTemplate.find(query.with(pageable), Product.class);

        int totalPages = (int) Math.ceil((double) total / safeSize);
        return new PageResponse<>(content, pageable.getPageNumber(), safeSize, total, totalPages);
    }

    public Product getById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public Product create(ProductRequest request) {
        Instant now = Instant.now();
        Product product = Product.builder().createdAt(now).build();
        apply(product, request);
        return productRepository.save(product);
    }

    public Product update(String id, ProductRequest request) {
        Product product = getById(id);
        apply(product, request);
        return productRepository.save(product);
    }

    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    public Product updateStock(String id, int stock) {
        Product product = getById(id);
        product.setStock(stock);
        product.setUpdatedAt(Instant.now());
        return productRepository.save(product);
    }

    private void apply(Product product, ProductRequest request) {
        Category category = categoryRepository.findByNameIgnoreCase(request.getCategory().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategory()));
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category.getName());
        product.setImageUrl(request.getImageUrl());
        product.setStock(request.getStock());
        product.setRating(request.getRating() == null ? 0 : request.getRating());
        product.setUpdatedAt(Instant.now());
    }
}
