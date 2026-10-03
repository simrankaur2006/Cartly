package com.ecommerce.service;

import com.ecommerce.dto.ProfileRequest;
import com.ecommerce.model.UserProfile;
import com.ecommerce.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;

    /** Returns the caller's profile, creating an empty one on first access. */
    public UserProfile get(String userId) {
        return profileRepository.findByClerkUserId(userId).orElseGet(() -> {
            Instant now = Instant.now();
            try {
                return profileRepository.save(UserProfile.builder()
                        .clerkUserId(userId).createdAt(now).updatedAt(now).build());
            } catch (DuplicateKeyException ex) {
                // two requests created it at the same moment; use the one that won
                return profileRepository.findByClerkUserId(userId).orElseThrow();
            }
        });
    }

    public UserProfile update(String userId, ProfileRequest request) {
        UserProfile profile = get(userId);
        profile.setName(request.getName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setUpdatedAt(Instant.now());
        return profileRepository.save(profile);
    }

    public List<UserProfile> getAllCustomers() {
        return profileRepository.findAllByOrderByCreatedAtDesc();
    }

    public long count() {
        return profileRepository.count();
    }
}
