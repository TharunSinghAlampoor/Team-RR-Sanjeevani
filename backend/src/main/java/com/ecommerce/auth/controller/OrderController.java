package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.BuyNowRequest;
import com.ecommerce.auth.dto.OrderDto;
import com.ecommerce.auth.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders(@AuthenticationPrincipal Integer userId) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        List<OrderDto> orders = orderService.getUserOrders(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.success("User order history retrieved", orders));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> checkoutCart(
            @AuthenticationPrincipal Integer userId,
            @RequestBody(required = false) Map<String, String> body) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        String shippingAddress = (body != null && body.containsKey("shippingAddress")) ? body.get("shippingAddress") : null;
        OrderDto order = orderService.checkoutCart(effectiveUserId, shippingAddress);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully from cart", order));
    }

    @PostMapping("/buy-now")
    public ResponseEntity<ApiResponse<OrderDto>> buyNow(
            @AuthenticationPrincipal Integer userId,
            @RequestBody(required = false) BuyNowRequest request) {
        Integer effectiveUserId = (userId != null) ? userId : 1;
        if (request == null) {
            request = new BuyNowRequest();
            request.setProductId(1);
            request.setQuantity(1);
        }
        OrderDto order = orderService.buyNow(effectiveUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Buy now order processed successfully", order));
    }

    @PostMapping("/{orderId}/send-invoice-email")
    public ResponseEntity<ApiResponse<String>> sendInvoiceEmail(
            @PathVariable String orderId,
            @RequestBody(required = false) Map<String, String> body) {
        String email = (body != null && body.containsKey("email")) ? body.get("email") : null;
        orderService.sendInvoiceEmail(orderId, email);
        return ResponseEntity.ok(ApiResponse.success("Tax invoice sent to email successfully", "Sent"));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        String status = (body != null && body.containsKey("status")) ? body.get("status") : null;
        OrderDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully in database", order));
    }
}
