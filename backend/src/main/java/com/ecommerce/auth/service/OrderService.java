package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.BuyNowRequest;
import com.ecommerce.auth.dto.OrderDto;
import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductService productService,
            PaymentRepository paymentRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
    }

    public List<OrderDto> getUserOrders(Integer userId) {
        if (userId == null) return List.of();
        List<Order> orders = orderRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderDto checkoutCart(Integer userId, String shippingAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUserUserId(userId);
        if (cartItems.isEmpty()) {
            throw new AuthException("Your shopping cart is empty.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) {
                throw new AuthException("Insufficient stock for product: " + p.getName());
            }
            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
        if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            order.setShippingAddress(shippingAddress.trim());
        }
        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            // Decrement stock
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);

            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            OrderItem oi = new OrderItem(savedOrder, p, ci.getQuantity(), p.getPrice(), lineTotal);
            orderItems.add(orderItemRepository.save(oi));
        }

        // Clear cart
        cartItemRepository.deleteByUserUserId(userId);

        return convertToDto(savedOrder, orderItems);
    }

    @Transactional
    public OrderDto buyNow(Integer userId, BuyNowRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AuthException("Product not found: " + request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new AuthException("Insufficient stock available for " + product.getName());
        }

        BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        String orderId = "BUY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
        Order savedOrder = orderRepository.save(order);

        // Decrement stock
        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        OrderItem oi = new OrderItem(savedOrder, product, request.getQuantity(), product.getPrice(), totalAmount);
        OrderItem savedOi = orderItemRepository.save(oi);

        return convertToDto(savedOrder, List.of(savedOi));
    }

    private OrderDto convertToDto(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        return convertToDto(order, items);
    }

    private OrderDto convertToDto(Order order, List<OrderItem> items) {
        List<OrderDto.OrderItemDto> itemDtos = items.stream().map(item -> {
            String imgUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80";
            try {
                imgUrl = productService.convertToDto(item.getProduct()).getImageUrl();
            } catch (Exception ignored) {
            }

            return new OrderDto.OrderItemDto(
                    item.getId(),
                    item.getProduct().getProductId(),
                    item.getProduct().getName(),
                    imgUrl,
                    item.getQuantity(),
                    item.getPricePerUnit(),
                    item.getTotalPrice());
        }).collect(Collectors.toList());

        OrderDto dto = new OrderDto(
                order.getOrderId(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                itemDtos);

        dto.setUpdatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getCreatedAt());

        if (order.getUser() != null) {
            dto.setCustomerName(
                    order.getUser().getFullName() != null ? order.getUser().getFullName() : order.getUser().getEmail());
            dto.setCustomerEmail(order.getUser().getEmail());
            dto.setCustomerPhone(order.getUser().getPhoneNumber());
        }
        dto.setShippingAddress(order.getShippingAddress() != null ? order.getShippingAddress() : "");

        try {
            var paymentOpt = paymentRepository.findFirstByOrderOrderId(order.getOrderId());
            if (paymentOpt.isPresent()) {
                var p = paymentOpt.get();
                dto.setPaymentId(p.getRazorpayPaymentId() != null && !p.getRazorpayPaymentId().isEmpty()
                        ? p.getRazorpayPaymentId() : "pay_" + order.getOrderId().replace("-", ""));
                dto.setReferenceNumber(p.getRazorpayOrderId() != null && !p.getRazorpayOrderId().isEmpty()
                        ? p.getRazorpayOrderId() : "order_REF_" + order.getOrderId().replace("-", ""));
            } else {
                dto.setPaymentId("pay_" + order.getOrderId().replace("-", ""));
                dto.setReferenceNumber("order_REF_" + order.getOrderId().replace("-", ""));
            }
        } catch (Exception e) {
            dto.setPaymentId("pay_" + order.getOrderId().replace("-", ""));
            dto.setReferenceNumber("order_REF_" + order.getOrderId().replace("-", ""));
        }

        return dto;
    }

    public void sendInvoiceEmail(String orderId, String customEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AuthException("Order not found with id: " + orderId));
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        OrderDto dto = convertToDto(order, items);
        String recipient = (customEmail != null && !customEmail.isBlank()) ? customEmail : dto.getCustomerEmail();
        emailService.sendOrderInvoiceEmail(
                recipient,
                dto.getOrderId(),
                dto.getTotalAmount() != null ? dto.getTotalAmount().doubleValue() : 0.0,
                dto.getPaymentId(),
                dto.getReferenceNumber()
        );
    }

    @Transactional
    public OrderDto updateOrderStatus(String orderId, String newStatusStr) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AuthException("Order not found with ID: " + orderId));

        if (newStatusStr != null && !newStatusStr.trim().isEmpty()) {
            try {
                String formatted = newStatusStr.trim().toUpperCase().replace(" ", "_");
                OrderStatus newStatus = OrderStatus.valueOf(formatted);
                order.setStatus(newStatus);
                orderRepository.save(order);
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid order status: " + newStatusStr);
            }
        }
        return convertToDto(order);
    }
}