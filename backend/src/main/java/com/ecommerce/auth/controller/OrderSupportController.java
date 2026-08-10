package com.ecommerce.auth.controller;

import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/order-support")
public class OrderSupportController {

    @Autowired
    private OrderRatingFeedbackRepository feedbackRepository;

    @Autowired
    private OrderRefundRequestRepository refundRepository;

    @Autowired
    private OrderReplacementRequestRepository replacementRepository;

    @Autowired
    private OrderCancellationRepository cancellationRepository;

    @Autowired
    private OrderRepository orderRepository;

    // 1. Submit Rating & Feedback
    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> payload) {
        String orderId = payload.get("orderId") != null ? String.valueOf(payload.get("orderId")) : "1002";
        Integer rating = payload.get("rating") != null ? Integer.parseInt(String.valueOf(payload.get("rating"))) : 5;
        String feedbackTags = payload.get("feedbackTags") != null ? String.valueOf(payload.get("feedbackTags")) : "";
        String comment = payload.get("comment") != null ? String.valueOf(payload.get("comment")) : "";
        Long userId = (payload.get("userId") != null && !"null".equalsIgnoreCase(String.valueOf(payload.get("userId"))))
                ? Long.parseLong(String.valueOf(payload.get("userId"))) : null;

        OrderRatingFeedback feedback = feedbackRepository.findByOrderId(orderId)
                .orElse(new OrderRatingFeedback());

        feedback.setOrderId(orderId);
        feedback.setUserId(userId);
        feedback.setRating(rating);
        feedback.setFeedbackTags(feedbackTags);
        feedback.setComment(comment);

        feedbackRepository.save(feedback);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Rating & feedback saved successfully");
        response.put("data", feedback);
        return ResponseEntity.ok(response);
    }

    // 2. Request Refund / Return
    @PostMapping("/refund")
    public ResponseEntity<?> requestRefund(@RequestBody Map<String, Object> payload) {
        String orderId = payload.get("orderId") != null ? String.valueOf(payload.get("orderId")) : "1002";
        String requestId = payload.get("requestId") != null ? String.valueOf(payload.get("requestId")) : ("REF-" + System.currentTimeMillis());
        String reason = payload.get("reason") != null ? String.valueOf(payload.get("reason")) : "";
        String refundMethod = payload.get("refundMethod") != null ? String.valueOf(payload.get("refundMethod")) : "";
        String upiId = payload.get("upiId") != null ? String.valueOf(payload.get("upiId")) : "";
        String comment = payload.get("comment") != null ? String.valueOf(payload.get("comment")) : "";
        BigDecimal amount = payload.get("amount") != null ? new BigDecimal(String.valueOf(payload.get("amount"))) : BigDecimal.ZERO;
        Long userId = (payload.get("userId") != null && !"null".equalsIgnoreCase(String.valueOf(payload.get("userId"))))
                ? Long.parseLong(String.valueOf(payload.get("userId"))) : null;

        OrderRefundRequest refund = new OrderRefundRequest(orderId, userId, requestId, amount, reason, refundMethod, upiId, comment);
        refundRepository.save(refund);

        // Sync order status if found in database
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Refund & Return request submitted successfully");
        response.put("data", refund);
        return ResponseEntity.ok(response);
    }

    // 3. Request Product Replacement
    @PostMapping("/replace")
    public ResponseEntity<?> requestReplacement(@RequestBody Map<String, Object> payload) {
        String orderId = payload.get("orderId") != null ? String.valueOf(payload.get("orderId")) : "1002";
        String requestId = payload.get("requestId") != null ? String.valueOf(payload.get("requestId")) : ("RET-" + System.currentTimeMillis());
        String reason = payload.get("reason") != null ? String.valueOf(payload.get("reason")) : "";
        String replacementAddress = payload.get("replacementAddress") != null ? String.valueOf(payload.get("replacementAddress")) : "";
        String comment = payload.get("comment") != null ? String.valueOf(payload.get("comment")) : "";
        String estimatedDelivery = payload.get("estimatedDelivery") != null ? String.valueOf(payload.get("estimatedDelivery")) : "Courier Pickup & Replacement Tomorrow";
        Long userId = (payload.get("userId") != null && !"null".equalsIgnoreCase(String.valueOf(payload.get("userId"))))
                ? Long.parseLong(String.valueOf(payload.get("userId"))) : null;

        OrderReplacementRequest replacement = new OrderReplacementRequest(orderId, userId, requestId, reason, replacementAddress, comment, estimatedDelivery);
        replacementRepository.save(replacement);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Replacement request submitted successfully");
        response.put("data", replacement);
        return ResponseEntity.ok(response);
    }

    // 4. Cancel Order
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelOrder(@RequestBody Map<String, Object> payload) {
        String orderId = payload.get("orderId") != null ? String.valueOf(payload.get("orderId")) : "1002";
        String reason = payload.get("reason") != null ? String.valueOf(payload.get("reason")) : "";
        String comment = payload.get("comment") != null ? String.valueOf(payload.get("comment")) : "";
        Long userId = (payload.get("userId") != null && !"null".equalsIgnoreCase(String.valueOf(payload.get("userId"))))
                ? Long.parseLong(String.valueOf(payload.get("userId"))) : null;

        OrderCancellation cancellation = new OrderCancellation(orderId, userId, reason, comment);
        cancellationRepository.save(cancellation);

        // Update order status in orders table to CANCELLED
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order cancellation recorded successfully");
        response.put("data", cancellation);
        return ResponseEntity.ok(response);
    }

    // 5. Fetch Support Status for Order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderSupportStatus(@PathVariable String orderId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("feedback", feedbackRepository.findByOrderId(orderId).orElse(null));
        response.put("refund", refundRepository.findByOrderId(orderId).orElse(null));
        response.put("replacement", replacementRepository.findByOrderId(orderId).orElse(null));
        response.put("cancellation", cancellationRepository.findByOrderId(orderId).orElse(null));
        return ResponseEntity.ok(response);
    }
}
