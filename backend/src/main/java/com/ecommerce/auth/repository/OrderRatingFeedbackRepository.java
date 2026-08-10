package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.OrderRatingFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRatingFeedbackRepository extends JpaRepository<OrderRatingFeedback, Long> {
    Optional<OrderRatingFeedback> findByOrderId(String orderId);
}
