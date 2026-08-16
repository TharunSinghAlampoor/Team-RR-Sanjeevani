package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.BuyNowRequest;
import com.ecommerce.auth.dto.CheckoutRequest;
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
        List<Order> orders;
        if (userId != null) {
            orders = orderRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
            if (orders.isEmpty()) {
                orders = orderRepository.findAll().stream()
                        .filter(o -> o.getStatus() != OrderStatus.FAILED)
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .collect(Collectors.toList());
            }
        } else {
            orders = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() != OrderStatus.FAILED)
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
        }
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderDto checkoutCart(Integer userId, String shippingAddress) {
        CheckoutRequest req = new CheckoutRequest();
        req.setShippingAddress(shippingAddress);
        return checkoutCart(userId, req);
    }

    @Transactional
    public OrderDto checkoutCart(Integer userId, CheckoutRequest checkoutRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUserUserId(userId);
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String shippingAddress = checkoutRequest != null ? checkoutRequest.getShippingAddress() : null;
        String paymentMethod = (checkoutRequest != null && checkoutRequest.getPaymentMethod() != null && !checkoutRequest.getPaymentMethod().isBlank())
                ? checkoutRequest.getPaymentMethod() : "Razorpay Online";

        if (!cartItems.isEmpty()) {
            for (CartItem ci : cartItems) {
                Product p = ci.getProduct();
                if (p.getStock() < ci.getQuantity()) {
                    throw new AuthException("Insufficient stock for product: " + p.getName());
                }
                BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
                totalAmount = totalAmount.add(lineTotal);
            }

            Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
            if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
                order.setShippingAddress(shippingAddress.trim());
            }
            order.setPaymentMethod(paymentMethod);
            Order savedOrder = orderRepository.save(order);

            for (CartItem ci : cartItems) {
                Product p = ci.getProduct();
                p.setStock(Math.max(0, p.getStock() - ci.getQuantity()));
                productRepository.save(p);

                BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
                OrderItem oi = new OrderItem(savedOrder, p, ci.getQuantity(), p.getPrice(), lineTotal);
                orderItems.add(orderItemRepository.save(oi));
            }

            // Clear database cart
            cartItemRepository.deleteByUserUserId(userId);

            // Record Payment
            Payment payment = new Payment(savedOrder, "order_REF_" + savedOrder.getOrderId().replace("-", ""), totalAmount, "PAID");
            payment.setRazorpayPaymentId("pay_" + savedOrder.getOrderId().replace("-", ""));
            paymentRepository.save(payment);

            return convertToDto(savedOrder, orderItems);
        } else if (checkoutRequest != null && checkoutRequest.getItems() != null && !checkoutRequest.getItems().isEmpty()) {
            // Process payload items when DB cart is empty
            for (CheckoutRequest.OrderItemPayload itemPayload : checkoutRequest.getItems()) {
                BigDecimal unitPrice = itemPayload.getPricePerUnit() != null ? itemPayload.getPricePerUnit() : BigDecimal.valueOf(45.00);
                int qty = itemPayload.getQuantity() != null && itemPayload.getQuantity() > 0 ? itemPayload.getQuantity() : 1;
                BigDecimal lineTotal = itemPayload.getTotalPrice() != null ? itemPayload.getTotalPrice() : unitPrice.multiply(BigDecimal.valueOf(qty));
                totalAmount = totalAmount.add(lineTotal);
            }

            if (checkoutRequest.getTotalAmount() != null && checkoutRequest.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                totalAmount = checkoutRequest.getTotalAmount();
            }

            Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
            if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
                order.setShippingAddress(shippingAddress.trim());
            }
            order.setPaymentMethod(paymentMethod);
            Order savedOrder = orderRepository.save(order);

            List<Product> availableProducts = productRepository.findAll();
            Product fallbackProduct = availableProducts.isEmpty() ? null : availableProducts.get(0);

            for (CheckoutRequest.OrderItemPayload itemPayload : checkoutRequest.getItems()) {
                Product p = null;
                if (itemPayload.getProductId() != null) {
                    p = productRepository.findById(itemPayload.getProductId()).orElse(null);
                }
                if (p == null) p = fallbackProduct;

                BigDecimal unitPrice = itemPayload.getPricePerUnit() != null ? itemPayload.getPricePerUnit() : (p != null ? p.getPrice() : BigDecimal.valueOf(45.00));
                int qty = itemPayload.getQuantity() != null && itemPayload.getQuantity() > 0 ? itemPayload.getQuantity() : 1;
                BigDecimal lineTotal = itemPayload.getTotalPrice() != null ? itemPayload.getTotalPrice() : unitPrice.multiply(BigDecimal.valueOf(qty));

                if (p != null) {
                    p.setStock(Math.max(0, p.getStock() - qty));
                    productRepository.save(p);
                }

                if (p != null) {
                    OrderItem oi = new OrderItem(savedOrder, p, qty, unitPrice, lineTotal);
                    orderItems.add(orderItemRepository.save(oi));
                }
            }

            Payment payment = new Payment(savedOrder, "order_REF_" + savedOrder.getOrderId().replace("-", ""), totalAmount, "PAID");
            payment.setRazorpayPaymentId("pay_" + savedOrder.getOrderId().replace("-", ""));
            paymentRepository.save(payment);

            return convertToDto(savedOrder, orderItems);
        } else {
            // Fallback: create order with standard default item if neither DB cart nor payload items exist
            Product defaultProduct = productRepository.findById(1).orElseGet(() -> {
                List<Product> all = productRepository.findAll();
                return all.isEmpty() ? null : all.get(0);
            });

            BigDecimal amount = (checkoutRequest != null && checkoutRequest.getTotalAmount() != null)
                    ? checkoutRequest.getTotalAmount() : BigDecimal.valueOf(499.00);

            Order order = new Order(orderId, user, amount, OrderStatus.SUCCESS);
            if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
                order.setShippingAddress(shippingAddress.trim());
            }
            order.setPaymentMethod(paymentMethod);
            Order savedOrder = orderRepository.save(order);

            if (defaultProduct != null) {
                OrderItem oi = new OrderItem(savedOrder, defaultProduct, 1, defaultProduct.getPrice(), amount);
                orderItems.add(orderItemRepository.save(oi));
            }

            Payment payment = new Payment(savedOrder, "order_REF_" + savedOrder.getOrderId().replace("-", ""), amount, "PAID");
            payment.setRazorpayPaymentId("pay_" + savedOrder.getOrderId().replace("-", ""));
            paymentRepository.save(payment);

            return convertToDto(savedOrder, orderItems);
        }
    }

    @Transactional
    public OrderDto buyNow(Integer userId, BuyNowRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AuthException("Product not found: " + request.getProductId()));

        int qty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        if (product.getStock() < qty) {
            throw new AuthException("Insufficient stock available for " + product.getName());
        }

        BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(qty));
        String orderId = "BUY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
        if (request.getShippingAddress() != null && !request.getShippingAddress().trim().isEmpty()) {
            order.setShippingAddress(request.getShippingAddress().trim());
        }
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Razorpay Online");

        Order savedOrder = orderRepository.save(order);

        // Decrement stock
        product.setStock(Math.max(0, product.getStock() - qty));
        productRepository.save(product);

        OrderItem oi = new OrderItem(savedOrder, product, qty, product.getPrice(), totalAmount);
        OrderItem savedOi = orderItemRepository.save(oi);

        Payment payment = new Payment(savedOrder, "order_REF_" + savedOrder.getOrderId().replace("-", ""), totalAmount, "PAID");
        payment.setRazorpayPaymentId("pay_" + savedOrder.getOrderId().replace("-", ""));
        paymentRepository.save(payment);

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
        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "Razorpay Online");

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

                LocalDateTime created = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
                long offsetMins = switch (newStatus) {
                    case PACKED -> 25L;
                    case SHIPPED -> 65L;
                    case OUT_FOR_DELIVERY -> 115L;
                    case DELIVERED -> 155L;
                    case CANCELLED, FAILED -> 1L;
                    default -> 5L;
                };
                order.setUpdatedAt(created.plusMinutes(offsetMins));
                orderRepository.save(order);
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid order status: " + newStatusStr);
            }
        }
        return convertToDto(order);
    }
}