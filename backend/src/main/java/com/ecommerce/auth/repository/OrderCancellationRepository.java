package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.OrderCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderCancellationRepository extends JpaRepository<OrderCancellation, Long> {
    Optional<OrderCancellation> findByOrderId(String orderId);
}
