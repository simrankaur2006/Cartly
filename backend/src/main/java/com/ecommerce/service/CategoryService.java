package com.ecommerce.service;

import com.ecommerce.dto.CategoryRequest;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MongoTemplate mongoTemplate;

    public List<Category> getAll() {
        return categoryRepository.findAll(Sort.by("name"));
    }

    public Category create(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new BadRequestException("A category named '" + name + "' already exists");
        }
        return categoryRepository.save(Category.builder().name(name).description(request.getDescription()).build());
    }

    public Category update(String id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        String newName = request.getName().trim();
        categoryRepository.findByNameIgnoreCase(newName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("A category named '" + newName + "' already exists");
            }
        });
        String oldName = category.getName();
        category.setName(newName);
        category.setDescription(request.getDescription());
        Category saved = categoryRepository.save(category);
        if (!oldName.equals(newName)) {
            // keep products in sync with the renamed category
            mongoTemplate.updateMulti(Query.query(Criteria.where("category").is(oldName)),
                    new Update().set("category", newName), Product.class);
        }
        return saved;
    }

    public void delete(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        boolean inUse = mongoTemplate.exists(Query.query(Criteria.where("category").is(category.getName())), Product.class);
        if (inUse) {
            throw new BadRequestException("Category is used by products. Move or delete those products first.");
        }
        categoryRepository.deleteById(id);
    }
}
