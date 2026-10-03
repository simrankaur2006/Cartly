package com.ecommerce.repository;

import com.ecommerce.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    Optional<UserProfile> findByClerkUserId(String clerkUserId);

    List<UserProfile> findAllByOrderByCreatedAtDesc();
}
