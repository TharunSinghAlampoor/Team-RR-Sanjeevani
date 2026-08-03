package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AddToCartRequest;
import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.UpdateCartRequest;
import com.ecommerce.auth.dto.WishlistItemDto;
import com.ecommerce.auth.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getUserWishlist(@AuthenticationPrincipal Integer userId) {
        List<WishlistItemDto> wishlist = wishlistService.getUserWishlist(userId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched successfully", wishlist));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<WishlistItemDto>> addToWishlist(
            @AuthenticationPrincipal Integer userId,
            @RequestBody AddToCartRequest request) {
        WishlistItemDto item = wishlistService.addToWishlist(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", item));
    }

    @PutMapping("/items/{wishlistItemId}")
    public ResponseEntity<ApiResponse<WishlistItemDto>> updateWishlistItem(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer wishlistItemId,
            @RequestBody UpdateCartRequest request) {
        WishlistItemDto updated = wishlistService.updateWishlistItem(userId, wishlistItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Wishlist item updated", updated));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWishlist(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer productId) {
        Map<String, Object> result = wishlistService.toggleWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated", result));
    }

    @DeleteMapping("/items/{wishlistItemId}")
    public ResponseEntity<ApiResponse<Object>> removeWishlistItem(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer wishlistItemId) {
        wishlistService.removeWishlistItem(userId, wishlistItemId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Object>> removeWishlistByProduct(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer productId) {
        wishlistService.removeWishlistByProduct(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Removed product from wishlist", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Object>> clearWishlist(@AuthenticationPrincipal Integer userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared", null));
    }
}