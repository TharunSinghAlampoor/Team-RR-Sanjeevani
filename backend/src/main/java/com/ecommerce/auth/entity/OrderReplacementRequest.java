package com.ecommerce.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_replacement_requests")
public class OrderReplacementRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "request_id", nullable = false, unique = true)
    private String requestId;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "replacement_address", columnDefinition = "TEXT")
    private String replacementAddress;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "REPLACEMENT SCHEDULED";

    @Column(name = "estimated_delivery", length = 255)
    private String estimatedDelivery;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public OrderReplacementRequest() {
    }

    public OrderReplacementRequest(String orderId, Long userId, String requestId, String reason, String replacementAddress, String comment, String estimatedDelivery) {
        this.orderId = orderId;
        this.userId = userId;
        this.requestId = requestId;
        this.reason = reason;
        this.replacementAddress = replacementAddress;
        this.comment = comment;
        this.estimatedDelivery = estimatedDelivery;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReplacementAddress() { return replacementAddress; }
    public void setReplacementAddress(String replacementAddress) { this.replacementAddress = replacementAddress; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(String estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
