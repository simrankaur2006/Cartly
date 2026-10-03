package com.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileRequest {
    @Size(max = 100, message = "Name is too long")
    private String name;

    @Email(message = "Email must be a valid email address")
    private String email;

    @Size(max = 20, message = "Phone number is too long")
    private String phone;

    @Size(max = 300, message = "Address is too long")
    private String address;
}
