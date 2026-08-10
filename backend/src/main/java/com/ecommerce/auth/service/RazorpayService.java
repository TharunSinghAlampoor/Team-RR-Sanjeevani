package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.OrderDto;
import com.ecommerce.auth.dto.PaymentDto;
import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RazorpayService {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final ProductService productService;
    private final RestTemplate restTemplate;

    public RazorpayService(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository,
            ProductService productService) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.productService = productService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a Razorpay order from the user's cart via REST API.
     * Does NOT create a database order — only a Razorpay order for the payment popup.
     */
    public PaymentDto createRazorpayOrder(Integer userId) {
        return createRazorpayOrder(userId, null);
    }

    @SuppressWarnings("unchecked")
    public PaymentDto createRazorpayOrder(Integer userId, BigDecimal customAmount) {
        if (userId == null) userId = 1;
        if (!userRepository.existsById(userId)) {
            throw new AuthException("User not found: " + userId);
        }

        List<CartItem> cartItems = cartItemRepository.findByUserUserId(userId);
        if (cartItems.isEmpty()) {
            throw new AuthException("Your shopping cart is empty.");
        }

        // Calculate total and validate stock
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) {
                throw new AuthException("Insufficient stock for product: " + p.getName());
            }
            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        if (customAmount != null && customAmount.compareTo(BigDecimal.ZERO) > 0) {
            totalAmount = customAmount;
        }

        // Razorpay expects amount in paise (smallest currency unit)
        int amountInPaise = totalAmount.multiply(BigDecimal.valueOf(100)).intValue();

        try {
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("amount", amountInPaise);
            requestBody.put("currency", "INR");
            requestBody.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0, 8));

            // Set Basic Auth header (key_id:key_secret)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(razorpayKeyId, razorpayKeySecret);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.razorpay.com/v1/orders",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null || !response.getStatusCode().is2xxSuccessful()) {
                throw new AuthException("Failed to create Razorpay order: empty response");
            }

            PaymentDto dto = new PaymentDto();
            dto.setOrderId((String) body.get("id"));
            dto.setAmount(totalAmount);
            dto.setCurrency("INR");
            dto.setKeyId(razorpayKeyId);
            return dto;

        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    /**
     * Verify the Razorpay payment signature, then create the order + payment records,
     * reduce inventory, and clear the cart. All in one transaction.
     */
    @Transactional
    public OrderDto verifyAndPlaceOrder(Integer userId, PaymentDto dto) {
        // 1. Verify HMAC-SHA256 signature
        String generatedSignature = hmacSha256(
                dto.getRazorpayOrderId() + "|" + dto.getRazorpayPaymentId(),
                razorpayKeySecret
        );

        if (!generatedSignature.equals(dto.getRazorpaySignature())) {
            throw new AuthException("Payment verification failed. Invalid signature.");
        }

        // 2. Load user and cart
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUserUserId(userId);
        if (cartItems.isEmpty()) {
            throw new AuthException("Your shopping cart is empty.");
        }

        // 3. Calculate total and validate stock again
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) {
                throw new AuthException("Insufficient stock for product: " + p.getName());
            }
            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        // 4. Create the database order
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
        if (dto.getShippingAddress() != null && !dto.getShippingAddress().trim().isEmpty()) {
            order.setShippingAddress(dto.getShippingAddress().trim());
        }
        Order savedOrder = orderRepository.save(order);

        // 5. Create order items & reduce stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);

            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            OrderItem oi = new OrderItem(savedOrder, p, ci.getQuantity(), p.getPrice(), lineTotal);
            orderItems.add(orderItemRepository.save(oi));
        }

        // 6. Save payment record
        Payment payment = new Payment(savedOrder, dto.getRazorpayOrderId(), totalAmount, "PAID");
        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        payment.setRazorpaySignature(dto.getRazorpaySignature());
        paymentRepository.save(payment);

        // 7. Clear cart
        cartItemRepository.deleteByUserUserId(userId);

        // 8. Return order DTO
        return convertToDto(savedOrder, orderItems);
    }

    /**
     * Create a Razorpay order for Buy Now (single product).
     */
    public PaymentDto createBuyNowRazorpayOrder(Integer userId, Integer productId, Integer quantity) {
        return createBuyNowRazorpayOrder(userId, productId, quantity, null);
    }

    @SuppressWarnings("unchecked")
    public PaymentDto createBuyNowRazorpayOrder(Integer userId, Integer productId, Integer quantity, BigDecimal customAmount) {
        if (userId == null) userId = 1;
        if (!userRepository.existsById(userId)) {
            throw new AuthException("User not found: " + userId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AuthException("Product not found: " + productId));

        int qty = (quantity != null && quantity > 0) ? quantity : 1;
        if (product.getStock() < qty) {
            throw new AuthException("Insufficient stock available for " + product.getName());
        }

        BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(qty));
        if (customAmount != null && customAmount.compareTo(BigDecimal.ZERO) > 0) {
            totalAmount = customAmount;
        }
        int amountInPaise = totalAmount.multiply(BigDecimal.valueOf(100)).intValue();

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("amount", amountInPaise);
            requestBody.put("currency", "INR");
            requestBody.put("receipt", "buy_" + UUID.randomUUID().toString().substring(0, 8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(razorpayKeyId, razorpayKeySecret);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.razorpay.com/v1/orders",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null || !response.getStatusCode().is2xxSuccessful()) {
                throw new AuthException("Failed to create Razorpay order: empty response");
            }

            PaymentDto dto = new PaymentDto();
            dto.setOrderId((String) body.get("id"));
            dto.setAmount(totalAmount);
            dto.setCurrency("INR");
            dto.setKeyId(razorpayKeyId);
            dto.setProductId(productId);
            dto.setQuantity(qty);
            return dto;

        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Failed to create Razorpay Buy Now order: " + e.getMessage());
        }
    }

    /**
     * Verify Razorpay payment and place Buy Now order.
     */
    @Transactional
    public OrderDto verifyAndPlaceBuyNowOrder(Integer userId, PaymentDto dto) {
        String generatedSignature = hmacSha256(
                dto.getRazorpayOrderId() + "|" + dto.getRazorpayPaymentId(),
                razorpayKeySecret
        );

        if (!generatedSignature.equals(dto.getRazorpaySignature())) {
            throw new AuthException("Payment verification failed. Invalid signature.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found: " + userId));

        if (dto.getProductId() == null) {
            throw new AuthException("Product ID is required for Buy Now payment verification.");
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new AuthException("Product not found: " + dto.getProductId()));

        int qty = (dto.getQuantity() != null && dto.getQuantity() > 0) ? dto.getQuantity() : 1;
        if (product.getStock() < qty) {
            throw new AuthException("Insufficient stock available for " + product.getName());
        }

        BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(qty));
        String orderId = "BUY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS);
        if (dto.getShippingAddress() != null && !dto.getShippingAddress().trim().isEmpty()) {
            order.setShippingAddress(dto.getShippingAddress().trim());
        }
        Order savedOrder = orderRepository.save(order);

        // Decrement stock
        product.setStock(product.getStock() - qty);
        productRepository.save(product);

        OrderItem oi = new OrderItem(savedOrder, product, qty, product.getPrice(), totalAmount);
        OrderItem savedOi = orderItemRepository.save(oi);

        // Save payment record
        Payment payment = new Payment(savedOrder, dto.getRazorpayOrderId(), totalAmount, "PAID");
        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        payment.setRazorpaySignature(dto.getRazorpaySignature());
        paymentRepository.save(payment);

        return convertToDto(savedOrder, List.of(savedOi));
    }

    /**
     * Record a failed or cancelled payment attempt in database (orders & payments tables).
     * Cart items remain intact and stock is NOT reduced.
     */
    @Transactional
    public void recordPaymentFailure(Integer userId, PaymentDto dto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        String orderId = "FAIL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal amount = dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO;

        Order order = new Order(orderId, user, amount, OrderStatus.FAILED);
        Order savedOrder = orderRepository.save(order);

        Payment payment = new Payment(savedOrder, dto.getRazorpayOrderId() != null ? dto.getRazorpayOrderId() : "N/A", amount, "FAILED");
        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        payment.setErrorDescription(dto.getErrorDescription() != null ? dto.getErrorDescription() : "Payment failed or cancelled by user");
        paymentRepository.save(payment);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new AuthException("Error generating HMAC signature: " + e.getMessage());
        }
    }

    private OrderDto convertToDto(Order order, List<OrderItem> items) {
        List<OrderDto.OrderItemDto> itemDtos = items.stream().map(item -> {
            String imgUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80";
            try {
                imgUrl = productService.convertToDto(item.getProduct()).getImageUrl();
            } catch (Exception ignored) {}

            return new OrderDto.OrderItemDto(
                    item.getId(),
                    item.getProduct().getProductId(),
                    item.getProduct().getName(),
                    imgUrl,
                    item.getQuantity(),
                    item.getPricePerUnit(),
                    item.getTotalPrice()
            );
        }).collect(Collectors.toList());

        OrderDto dto = new OrderDto(
                order.getOrderId(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                itemDtos
        );

        if (order.getUser() != null) {
            dto.setCustomerName(order.getUser().getFullName() != null ? order.getUser().getFullName() : order.getUser().getEmail());
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
}
