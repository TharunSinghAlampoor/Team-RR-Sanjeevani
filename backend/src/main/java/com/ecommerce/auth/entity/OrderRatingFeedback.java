package com.ecommerce.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_rating_feedbacks")
public class OrderRatingFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "feedback_tags", length = 512)
    private String feedbackTags;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public OrderRatingFeedback() {
    }

    public OrderRatingFeedback(String orderId, Long userId, Integer rating, String feedbackTags, String comment) {
        this.orderId = orderId;
        this.userId = userId;
        this.rating = rating;
        this.feedbackTags = feedbackTags;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedbackTags() { return feedbackTags; }
    public void setFeedbackTags(String feedbackTags) { this.feedbackTags = feedbackTags; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
