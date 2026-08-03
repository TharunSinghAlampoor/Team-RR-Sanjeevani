package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AddToCartRequest;
import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.CartItemDto;
import com.ecommerce.auth.dto.UpdateCartRequest;
import com.ecommerce.auth.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemDto>>> getUserCart(@AuthenticationPrincipal Integer userId) {
        List<CartItemDto> cart = cartService.getUserCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItemDto>> addToCart(
            @AuthenticationPrincipal Integer userId,
            @Valid @RequestBody AddToCartRequest request) {
        CartItemDto item = cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartItemDto>> updateCartItem(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCartRequest request) {
        CartItemDto item = cartService.updateCartItem(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Object>> removeCartItem(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        cartService.removeCartItem(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Object>> clearCart(@AuthenticationPrincipal Integer userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
