package com.ecommerce.auth.controller;

import com.ecommerce.auth.config.RateLimitConfig;
import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimitConfig rateLimitConfig;

    public AuthController(AuthService authService, RateLimitConfig rateLimitConfig) {
        this.authService = authService;
        this.rateLimitConfig = rateLimitConfig;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<Object> response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        rateLimitConfig.checkLoginRateLimit(servletRequest.getRemoteAddr());
        ApiResponse<LoginResponse> response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(HttpServletRequest servletRequest) {
        String authHeader = servletRequest.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        ApiResponse<Object> response = authService.logout(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        rateLimitConfig.checkOtpRateLimit(servletRequest.getRemoteAddr());
        ApiResponse<Object> response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        ApiResponse<Object> response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse<Object> response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @AuthenticationPrincipal Integer userId,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest servletRequest) {
        String authHeader = servletRequest.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        ApiResponse<Object> response = authService.changePassword(userId, token, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserProfile>> getCurrentUser(
            @AuthenticationPrincipal Integer userId) {
        ApiResponse<LoginResponse.UserProfile> response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dev/otps")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getDevOtps() {
        ApiResponse<java.util.List<java.util.Map<String, Object>>> response = authService.getDevOtps();
        return ResponseEntity.ok(response);
    }
}
