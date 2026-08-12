package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.service.RazorpayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final RazorpayService razorpayService;

    public PaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    /**
     * Creates a Razorpay order for the user's current cart.
     * Does NOT create a database order.
     */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentDto>> createOrder(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(required = false) BigDecimal amount) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        PaymentDto paymentDto = razorpayService.createRazorpayOrder(effectiveUserId, amount);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created", paymentDto));
    }

    /**
     * Verifies Razorpay payment signature and places the order.
     * Only after successful verification: order is created, stock reduced, cart
     * cleared.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<OrderDto>> verifyPayment(
            @AuthenticationPrincipal Integer userId,
            @RequestBody PaymentDto paymentDto) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        OrderDto order = razorpayService.verifyAndPlaceOrder(effectiveUserId, paymentDto);
        return ResponseEntity.ok(ApiResponse.success("Payment verified and order placed successfully", order));
    }

    /**
     * Creates a Razorpay order for Buy Now (single product).
     */
    @PostMapping("/create-buy-now-order")
    public ResponseEntity<ApiResponse<PaymentDto>> createBuyNowOrder(
            @AuthenticationPrincipal Integer userId,
            @RequestParam Integer productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) BigDecimal amount) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        PaymentDto paymentDto = razorpayService.createBuyNowRazorpayOrder(effectiveUserId, productId, quantity, amount);
        return ResponseEntity.ok(ApiResponse.success("Razorpay Buy Now order created", paymentDto));
    }

    /**
     * Verifies Razorpay payment signature and places Buy Now order.
     */
    @PostMapping("/verify-buy-now")
    public ResponseEntity<ApiResponse<OrderDto>> verifyBuyNowPayment(
            @AuthenticationPrincipal Integer userId,
            @RequestBody PaymentDto paymentDto) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        OrderDto order = razorpayService.verifyAndPlaceBuyNowOrder(effectiveUserId, paymentDto);
        return ResponseEntity.ok(ApiResponse.success("Buy Now payment verified and order placed successfully", order));
    }

    /**
     * Records a failed or cancelled payment attempt in the database.
     */
    @PostMapping("/record-failure")
    public ResponseEntity<ApiResponse<String>> recordPaymentFailure(
            @AuthenticationPrincipal Integer userId,
            @RequestBody PaymentDto paymentDto) {
        razorpayService.recordPaymentFailure(userId, paymentDto);

        return ResponseEntity.ok(ApiResponse.success("Failed payment recorded", "Recorded successfully"));
    }
}
