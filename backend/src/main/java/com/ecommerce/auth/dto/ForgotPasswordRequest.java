package com.ecommerce.auth.dto;


import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    private String identifier;

    // ── Getters & Setters ──

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
