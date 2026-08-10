package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.OrderRefundRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRefundRequestRepository extends JpaRepository<OrderRefundRequest, Long> {
    Optional<OrderRefundRequest> findByOrderId(String orderId);
    Optional<OrderRefundRequest> findByRequestId(String requestId);
}
