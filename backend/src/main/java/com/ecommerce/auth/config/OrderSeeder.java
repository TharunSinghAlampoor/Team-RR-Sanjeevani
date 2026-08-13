package com.ecommerce.auth.config;

import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@org.springframework.core.annotation.Order(2)
public class OrderSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(OrderSeeder.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public OrderSeeder(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("[ACTION PERFORMED] Initializing 31 Sanjeevani Medical Orders...");

        // Ensure default customer user exists
        User customer = userRepository.findByEmail("customer@sanjeevani.com").orElseGet(() -> {
            User u = new User("Sanjeevani User", "customer@sanjeevani.com", "+91 98765 43210", passwordEncoder.encode("Customer@123"), Role.CUSTOMER);
            u.setAccountStatus("ACTIVE");
            return userRepository.save(u);
        });

        if (!userRepository.existsByEmail("admin@sanjeevani.com")) {
            User u = new User("System Administrator", "admin@sanjeevani.com", "+91 99999 88888", passwordEncoder.encode("Admin@123"), Role.ADMIN);
            u.setAccountStatus("ACTIVE");
            userRepository.save(u);
        }

        User customerUser = customer;

        // Clean up any seed orders previously assigned to other users and reassign exclusively to customer@sanjeevani.com
        List<Order> existingOrders = orderRepository.findAll();
        for (Order o : existingOrders) {
            if (o.getOrderId() != null && (o.getOrderId().startsWith("ORD-849") || o.getOrderId().startsWith("ORD-000"))) {
                if (o.getUser() != null && !customerUser.getEmail().equalsIgnoreCase(o.getUser().getEmail())) {
                    o.setUser(customerUser);
                    orderRepository.save(o);
                }
            }
        }

        if (orderRepository.count() >= 31) {
            logger.info("Database contains {} orders assigned cleanly. OrderSeeder check complete.", orderRepository.count());
            return;
        }

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            logger.warn("No products found to build seed orders.");
            return;
        }

        OrderStatus[] statuses = {
            OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED, OrderStatus.PACKED,
            OrderStatus.PAID, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERED
        };

        String[] addresses = {
            "Flat 402, Block A, Jubilee Hills, Hyderabad - 500033",
            "H.No 12-4-88, Banjara Hills Road No 10, Hyderabad - 500034",
            "Plot 45, Tech Zone, Hitech City, Hyderabad - 500081",
            "Flat 201, Sunrise Apartments, Gachibowli, Hyderabad - 500032",
            "House #78, Greenfield Colony, Madhapur, Hyderabad - 500081"
        };

        String[] paymentMethods = {
            "Razorpay Online", "UPI / Razorpay", "Cash on Delivery", "Credit Card / Razorpay", "NetBanking"
        };

        int seededCount = 0;
        for (int i = 1; i <= 31; i++) {
            String orderId = String.format("ORD-%06d", 849200 + i);
            if (orderRepository.existsById(orderId)) {
                continue;
            }

            OrderStatus status = statuses[(i - 1) % statuses.length];
            String address = addresses[(i - 1) % addresses.length];
            String payMethod = paymentMethods[(i - 1) % paymentMethods.length];
            LocalDateTime orderTime = LocalDateTime.now().minusHours(i * 5).minusMinutes(i * 12);
            User assignedUser = customerUser;

            int p1Idx = (i - 1) % products.size();
            int p2Idx = (i + 3) % products.size();
            Product prod1 = products.get(p1Idx);
            Product prod2 = products.get(p2Idx);

            int qty1 = (i % 3) + 1;
            int qty2 = (i % 2) + 1;

            BigDecimal totalAmount = prod1.getPrice().multiply(BigDecimal.valueOf(qty1));
            if (i % 2 == 0) {
                totalAmount = totalAmount.add(prod2.getPrice().multiply(BigDecimal.valueOf(qty2)));
            }

            Order order = new Order(orderId, assignedUser, totalAmount, status);
            order.setShippingAddress(address);
            order.setPaymentMethod(payMethod);
            order.setCreatedAt(orderTime);
            order.setUpdatedAt(orderTime);

            Order savedOrder = orderRepository.save(order);

            OrderItem item1 = new OrderItem(savedOrder, prod1, qty1, prod1.getPrice(), prod1.getPrice().multiply(BigDecimal.valueOf(qty1)));
            orderItemRepository.save(item1);

            if (i % 2 == 0) {
                OrderItem item2 = new OrderItem(savedOrder, prod2, qty2, prod2.getPrice(), prod2.getPrice().multiply(BigDecimal.valueOf(qty2)));
                orderItemRepository.save(item2);
            }

            Payment payment = new Payment(savedOrder, "order_REF_" + orderId.replace("-", ""), totalAmount, "PAID");
            payment.setRazorpayPaymentId("pay_" + orderId.replace("-", ""));
            paymentRepository.save(payment);

            seededCount++;
        }

        logger.info("[ACTION PERFORMED] Successfully seeded {} demo orders into the database (Total Orders: {}).", seededCount, orderRepository.count());
    }
}
