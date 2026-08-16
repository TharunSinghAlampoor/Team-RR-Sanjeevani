package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.AddToCartRequest;
import com.ecommerce.auth.dto.CartItemDto;
import com.ecommerce.auth.dto.UpdateCartRequest;
import com.ecommerce.auth.entity.CartItem;
import com.ecommerce.auth.entity.Product;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.CartItemRepository;
import com.ecommerce.auth.repository.ProductRepository;
import com.ecommerce.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductService productService) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    public List<CartItemDto> getUserCart(Integer userId) {
        List<CartItem> items = cartItemRepository.findByUserUserId(userId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public CartItemDto addToCart(Integer userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AuthException("Product not found: " + request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new AuthException("Insufficient stock available for " + product.getName());
        }

        Optional<CartItem> existingOpt = cartItemRepository.findByUserUserIdAndProductProductId(userId, request.getProductId());
        CartItem cartItem;
        if (existingOpt.isPresent()) {
            cartItem = existingOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = new CartItem(user, product, request.getQuantity());
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return convertToDto(saved);
    }

    @Transactional
    public CartItemDto updateCartItem(Integer userId, Integer cartItemId, UpdateCartRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AuthException("Cart item not found: " + cartItemId));

        if (!cartItem.getUser().getUserId().equals(userId)) {
            throw new AuthException("Unauthorized cart modification.");
        }

        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        if (cartItem.getProduct().getStock() < request.getQuantity()) {
            throw new AuthException("Insufficient stock available for " + cartItem.getProduct().getName());
        }

        cartItem.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(cartItem);
        return convertToDto(saved);
    }

    @Transactional
    public void removeCartItem(Integer userId, Integer cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AuthException("Cart item not found: " + cartItemId));

        if (!cartItem.getUser().getUserId().equals(userId)) {
            throw new AuthException("Unauthorized cart deletion.");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Integer userId) {
        cartItemRepository.deleteByUserUserId(userId);
    }

    private CartItemDto convertToDto(CartItem item) {
        BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemDto(
                item.getId(),
                productService.convertToDto(item.getProduct()),
                item.getQuantity(),
                itemTotal
        );
    }
}
