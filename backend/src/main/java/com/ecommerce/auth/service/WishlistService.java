package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.AddToCartRequest;
import com.ecommerce.auth.dto.ProductDto;
import com.ecommerce.auth.dto.UpdateCartRequest;
import com.ecommerce.auth.dto.WishlistItemDto;
import com.ecommerce.auth.entity.Product;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.WishlistItem;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.ProductRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.repository.WishlistItemRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class WishlistService {

    @PersistenceContext
    private EntityManager entityManager;

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public WishlistService(
            WishlistItemRepository wishlistItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductService productService) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateLegacyFavorites() {
        try {
            entityManager.createNativeQuery(
                "INSERT INTO wishlist_items (user_id, product_id, quantity) " +
                "SELECT user_id, product_id, 1 FROM favorites f " +
                "WHERE NOT EXISTS (" +
                "  SELECT 1 FROM wishlist_items w WHERE w.user_id = f.user_id AND w.product_id = f.product_id" +
                ")"
            ).executeUpdate();
            entityManager.createNativeQuery("DROP TABLE IF EXISTS favorites").executeUpdate();
        } catch (Exception ignored) {
            // Ignore if favorites table does not exist
        }
    }

    @Transactional(readOnly = true)
    public List<WishlistItemDto> getUserWishlist(Integer userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserUserId(userId);
        return items.stream()
                .filter(item -> item.getProduct() != null)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getUserWishlistProducts(Integer userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserUserId(userId);
        return items.stream()
                .filter(item -> item.getProduct() != null)
                .map(item -> productService.convertToDto(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemDto addToWishlist(Integer userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AuthException("Product not found: " + request.getProductId()));

        Optional<WishlistItem> existingOpt = wishlistItemRepository.findByUserUserIdAndProductProductId(userId, request.getProductId());
        WishlistItem item;
        if (existingOpt.isPresent()) {
            item = existingOpt.get();
            int newQty = item.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1);
            item.setQuantity(newQty);
        } else {
            int qty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
            item = new WishlistItem(user, product, qty);
        }

        WishlistItem saved = wishlistItemRepository.save(item);
        return convertToDto(saved);
    }

    @Transactional
    public Map<String, Object> toggleWishlist(Integer userId, Integer productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AuthException("Product not found: " + productId));

        List<WishlistItem> existingItems = wishlistItemRepository.findAllByUserUserIdAndProductProductId(userId, productId);
        boolean isWishlisted;
        if (!existingItems.isEmpty()) {
            wishlistItemRepository.deleteByUserUserIdAndProductProductId(userId, productId);
            wishlistItemRepository.flush();
            isWishlisted = false;
        } else {
            wishlistItemRepository.saveAndFlush(new WishlistItem(user, product, 1));
            isWishlisted = true;
        }

        int currentCount = wishlistItemRepository.findByUserUserId(userId).size();

        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("isFavorite", isWishlisted);
        response.put("isWishlisted", isWishlisted);
        response.put("count", currentCount);
        return response;
    }

    @Transactional
    public WishlistItemDto updateWishlistItem(Integer userId, Integer wishlistItemId, UpdateCartRequest request) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new AuthException("Wishlist item not found: " + wishlistItemId));

        if (!item.getUser().getUserId().equals(userId)) {
            throw new AuthException("Unauthorized wishlist modification.");
        }

        if (request.getQuantity() <= 0) {
            wishlistItemRepository.delete(item);
            wishlistItemRepository.flush();
            return null;
        }

        item.setQuantity(request.getQuantity());
        WishlistItem saved = wishlistItemRepository.saveAndFlush(item);
        return convertToDto(saved);
    }

    @Transactional
    public void removeWishlistItem(Integer userId, Integer wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new AuthException("Wishlist item not found: " + wishlistItemId));

        if (!item.getUser().getUserId().equals(userId)) {
            throw new AuthException("Unauthorized wishlist deletion.");
        }

        wishlistItemRepository.delete(item);
        wishlistItemRepository.flush();
    }

    @Transactional
    public void removeWishlistByProduct(Integer userId, Integer productId) {
        wishlistItemRepository.deleteByUserUserIdAndProductProductId(userId, productId);
        wishlistItemRepository.flush();
    }

    @Transactional
    public void clearWishlist(Integer userId) {
        wishlistItemRepository.deleteByUserUserId(userId);
        wishlistItemRepository.flush();
    }

    private WishlistItemDto convertToDto(WishlistItem item) {
        BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new WishlistItemDto(
                item.getId(),
                productService.convertToDto(item.getProduct()),
                item.getQuantity(),
                itemTotal
        );
    }
}
