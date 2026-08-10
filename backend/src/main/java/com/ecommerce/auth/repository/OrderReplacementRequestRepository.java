package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.OrderReplacementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderReplacementRequestRepository extends JpaRepository<OrderReplacementRequest, Long> {
    Optional<OrderReplacementRequest> findByOrderId(String orderId);
    Optional<OrderReplacementRequest> findByRequestId(String requestId);
}
