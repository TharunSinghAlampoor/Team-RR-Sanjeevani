package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Integer> {
    List<WishlistItem> findByUserUserId(Integer userId);
    List<WishlistItem> findAllByUserUserIdAndProductProductId(Integer userId, Integer productId);
    Optional<WishlistItem> findByUserUserIdAndProductProductId(Integer userId, Integer productId);
    boolean existsByUserUserIdAndProductProductId(Integer userId, Integer productId);

    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.user.userId = :userId AND w.product.productId = :productId")
    void deleteByUserUserIdAndProductProductId(@Param("userId") Integer userId, @Param("productId") Integer productId);

    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.user.userId = :userId")
    void deleteByUserUserId(@Param("userId") Integer userId);
}
