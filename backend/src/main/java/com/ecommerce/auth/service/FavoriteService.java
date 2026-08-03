package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.ProductDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FavoriteService {

    private final WishlistService wishlistService;

    public FavoriteService(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    public List<ProductDto> getUserFavorites(Integer userId) {
        return wishlistService.getUserWishlistProducts(userId);
    }

    @Transactional
    public Map<String, Object> toggleFavorite(Integer userId, Integer productId) {
        return wishlistService.toggleWishlist(userId, productId);
    }

    @Transactional
    public void removeFavorite(Integer userId, Integer productId) {
        wishlistService.removeWishlistByProduct(userId, productId);
    }
}
