package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Integer productId);
    boolean existsByProductIdAndReviewerNameIgnoreCase(Integer productId, String reviewerName);
    boolean existsByProductIdAndUserId(Integer productId, Integer userId);
}
