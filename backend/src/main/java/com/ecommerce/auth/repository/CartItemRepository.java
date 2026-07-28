package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUserUserId(Integer userId);
    void deleteByUserUserId(Integer userId);
}
