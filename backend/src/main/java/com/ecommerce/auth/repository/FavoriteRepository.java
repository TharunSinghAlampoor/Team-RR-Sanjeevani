package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserUserIdOrderByCreatedAtDesc(Integer userId);
    Optional<Favorite> findByUserUserIdAndProductProductId(Integer userId, Integer productId);
    boolean existsByUserUserIdAndProductProductId(Integer userId, Integer productId);
    void deleteByUserUserIdAndProductProductId(Integer userId, Integer productId);
    void deleteByUserUserId(Integer userId);
}
