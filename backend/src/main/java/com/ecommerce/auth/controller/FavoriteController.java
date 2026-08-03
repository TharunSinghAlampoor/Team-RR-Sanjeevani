package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.ProductDto;
import com.ecommerce.auth.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getUserFavorites(@AuthenticationPrincipal Integer userId) {
        List<ProductDto> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(ApiResponse.success("Favorites fetched successfully", favorites));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer productId) {
        Map<String, Object> result = favoriteService.toggleFavorite(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated", result));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Object>> removeFavorite(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer productId) {
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}
