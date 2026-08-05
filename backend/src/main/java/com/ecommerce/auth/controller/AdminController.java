package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.OrderDto;
import com.ecommerce.auth.dto.ProductDto;

import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public AdminController(
            UserRepository userRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PasswordEncoder passwordEncoder,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    private User verifyAdmin(Integer userId) {
        if (userId == null) {
            throw new AuthException("Unauthorized. Admin authentication required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found."));
        if (user.getRole() != Role.ADMIN) {
            throw new AuthException("Access Denied. Administrator privileges are required.");
        }
        return user;
    }

    private void logAdminAction(User admin, String action, String module, String details) {
        try {
            AuditLog log = new AuditLog(admin.getEmail(), action, module, details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }

    // ─── 1. Dashboard Analytics & Stats ───────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        Map<String, Object> stats = new LinkedHashMap<>();

        List<Order> allOrders = orderRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<Category> allCategories = categoryRepository.findAll();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        BigDecimal yearlyRevenue = BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        int pendingOrders = 0;
        int deliveredOrders = 0;
        int cancelledOrders = 0;
        int confirmedOrders = 0;

        for (Order order : allOrders) {
            if (order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.FAILED) {
                BigDecimal amt = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                totalRevenue = totalRevenue.add(amt);

                if (order.getCreatedAt() != null) {
                    if (order.getCreatedAt().toLocalDate().isEqual(today)) {
                        todayRevenue = todayRevenue.add(amt);
                    }
                    if (order.getCreatedAt().getMonth() == now.getMonth() && order.getCreatedAt().getYear() == now.getYear()) {
                        monthlyRevenue = monthlyRevenue.add(amt);
                    }
                    if (order.getCreatedAt().getYear() == now.getYear()) {
                        yearlyRevenue = yearlyRevenue.add(amt);
                    }
                }
            }

            if (order.getStatus() == OrderStatus.PENDING) pendingOrders++;
            else if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SUCCESS) deliveredOrders++;
            else if (order.getStatus() == OrderStatus.CANCELLED) cancelledOrders++;
            else if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PACKED || order.getStatus() == OrderStatus.SHIPPED) confirmedOrders++;
        }

        int outOfStock = 0;
        int lowStock = 0;
        int prescriptionCount = 0;
        int nonPrescriptionCount = 0;
        int expiredCount = 0;
        int expiringSoonCount = 0;

        for (Product p : allProducts) {
            if (p.getStock() == null || p.getStock() == 0) outOfStock++;
            else if (p.getStock() < 10) lowStock++;

            if (Boolean.TRUE.equals(p.getPrescriptionRequired())) prescriptionCount++;
            else nonPrescriptionCount++;

            if (p.getExpiryDate() != null) {
                if (p.getExpiryDate().isBefore(today)) expiredCount++;
                else if (p.getExpiryDate().isBefore(today.plusDays(30))) expiringSoonCount++;
            }
        }

        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("yearlyRevenue", yearlyRevenue);

        stats.put("totalOrders", allOrders.size());
        stats.put("pendingOrders", pendingOrders);
        stats.put("confirmedOrders", confirmedOrders);
        stats.put("deliveredOrders", deliveredOrders);
        stats.put("cancelledOrders", cancelledOrders);

        stats.put("totalUsers", allUsers.size());
        stats.put("totalMedicines", allProducts.size());
        stats.put("totalCategories", allCategories.size());

        stats.put("outOfStockMedicines", outOfStock);
        stats.put("lowStockMedicines", lowStock);
        stats.put("prescriptionMedicines", prescriptionCount);
        stats.put("nonPrescriptionMedicines", nonPrescriptionCount);
        stats.put("expiredMedicines", expiredCount);
        stats.put("expiringSoonMedicines", expiringSoonCount);

        // Recent orders (latest 5)
        List<Map<String, Object>> recentOrders = allOrders.stream()
                .filter(o -> o != null && o.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("orderId", o.getOrderId());
                    m.put("customerName", o.getUser() != null ? o.getUser().getFullName() : "Customer");
                    m.put("amount", o.getTotalAmount());
                    m.put("status", o.getStatus());
                    m.put("date", o.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("recentOrders", recentOrders);

        // Recent users (latest 5)
        List<Map<String, Object>> recentUsers = allUsers.stream()
                .filter(u -> u != null && u.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("userId", u.getUserId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("role", u.getRole());
                    m.put("date", u.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("recentUsers", recentUsers);

        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved successfully", stats));
    }

    // ─── 2. Medicine / Product CRUD ──────────────────────────────────
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<Product> products = productRepository.findAll();
        List<ProductDto> dtos = products.stream().map(p -> {
            List<ProductImage> imgs = productImageRepository.findByProductProductId(p.getProductId());
            String imgUrl = !imgs.isEmpty() ? imgs.get(0).getImageUrl() : null;
            return convertProductToDto(p, imgUrl);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Products fetched successfully", dtos));
    }

    @PostMapping("/products")
    @Transactional
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @AuthenticationPrincipal Integer userId,
            @RequestBody Map<String, Object> payload) {
        User admin = verifyAdmin(userId);

        String name = (String) payload.get("name");
        String genericName = (String) payload.get("genericName");
        String brand = (String) payload.get("brand");
        String manufacturer = (String) payload.get("manufacturer");
        String batchNumber = (String) payload.get("batchNumber");
        String description = (String) payload.get("description");

        Object priceObj = payload.get("price");
        Object discPriceObj = payload.get("discountPrice");
        Object stockObj = payload.get("stock");
        Object catIdObj = payload.get("categoryId");
        String imageUrl = (String) payload.get("imageUrl");
        String expiryDateStr = (String) payload.get("expiryDate");
        Boolean rxRequired = payload.containsKey("prescriptionRequired") ? Boolean.parseBoolean(payload.get("prescriptionRequired").toString()) : false;
        String status = payload.containsKey("status") ? (String) payload.get("status") : "ACTIVE";

        if (name == null || name.trim().isEmpty()) {
            throw new AuthException("Medicine name is required.");
        }
        BigDecimal price = priceObj != null ? new BigDecimal(priceObj.toString()) : BigDecimal.ZERO;
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AuthException("Medicine price must be greater than 0.");
        }
        BigDecimal discountPrice = discPriceObj != null && !discPriceObj.toString().isEmpty() ? new BigDecimal(discPriceObj.toString()) : null;

        Integer stock = stockObj != null ? Integer.parseInt(stockObj.toString()) : 0;
        if (stock < 0) {
            throw new AuthException("Stock quantity cannot be negative.");
        }

        Category category = null;
        if (catIdObj != null) {
            Integer catId = Integer.parseInt(catIdObj.toString());
            category = categoryRepository.findById(catId)
                    .orElseThrow(() -> new AuthException("Invalid category ID: " + catId));
        } else {
            category = categoryRepository.findAll().stream().findFirst().orElse(null);
        }

        Product product = new Product(name.trim(), description, price, stock, category);
        product.setGenericName(genericName);
        product.setBrand(brand);
        product.setManufacturer(manufacturer);
        product.setBatchNumber(batchNumber);
        product.setDiscountPrice(discountPrice);
        product.setPrescriptionRequired(rxRequired);
        product.setStatus(status);

        if (expiryDateStr != null && !expiryDateStr.trim().isEmpty()) {
            try {
                product.setExpiryDate(LocalDate.parse(expiryDateStr.trim()));
            } catch (Exception ignored) {}
        }

        Product saved = productRepository.save(product);

        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            ProductImage pImg = new ProductImage(saved, imageUrl.trim());
            productImageRepository.save(pImg);
        }

        logAdminAction(admin, "CREATE_PRODUCT", "PRODUCT", "Created medicine: " + name);

        ProductDto dto = convertProductToDto(saved, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Medicine created successfully", dto));
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        User admin = verifyAdmin(userId);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AuthException("Medicine not found with ID: " + id));

        if (payload.containsKey("name")) product.setName(((String) payload.get("name")).trim());
        if (payload.containsKey("genericName")) product.setGenericName((String) payload.get("genericName"));
        if (payload.containsKey("brand")) product.setBrand((String) payload.get("brand"));
        if (payload.containsKey("manufacturer")) product.setManufacturer((String) payload.get("manufacturer"));
        if (payload.containsKey("batchNumber")) product.setBatchNumber((String) payload.get("batchNumber"));
        if (payload.containsKey("description")) product.setDescription((String) payload.get("description"));

        if (payload.containsKey("price")) {
            BigDecimal p = new BigDecimal(payload.get("price").toString());
            if (p.compareTo(BigDecimal.ZERO) <= 0) throw new AuthException("Price must be greater than 0.");
            product.setPrice(p);
        }
        if (payload.containsKey("discountPrice")) {
            Object dp = payload.get("discountPrice");
            product.setDiscountPrice(dp != null && !dp.toString().isEmpty() ? new BigDecimal(dp.toString()) : null);
        }
        if (payload.containsKey("stock")) {
            int s = Integer.parseInt(payload.get("stock").toString());
            if (s < 0) throw new AuthException("Stock cannot be negative.");
            product.setStock(s);
        }
        if (payload.containsKey("prescriptionRequired")) {
            product.setPrescriptionRequired(Boolean.parseBoolean(payload.get("prescriptionRequired").toString()));
        }
        if (payload.containsKey("status")) {
            product.setStatus((String) payload.get("status"));
        }
        if (payload.containsKey("expiryDate") && payload.get("expiryDate") != null) {
            try {
                product.setExpiryDate(LocalDate.parse(payload.get("expiryDate").toString()));
            } catch (Exception ignored) {}
        }

        if (payload.containsKey("categoryId") && payload.get("categoryId") != null) {
            Integer catId = Integer.parseInt(payload.get("categoryId").toString());
            Category category = categoryRepository.findById(catId)
                    .orElseThrow(() -> new AuthException("Invalid category ID: " + catId));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);

        if (payload.containsKey("imageUrl")) {
            String newImg = (String) payload.get("imageUrl");
            List<ProductImage> imgs = productImageRepository.findByProductProductId(id);
            if (!imgs.isEmpty()) {
                ProductImage img = imgs.get(0);
                img.setImageUrl(newImg);
                productImageRepository.save(img);
            } else if (newImg != null && !newImg.trim().isEmpty()) {
                productImageRepository.save(new ProductImage(updated, newImg.trim()));
            }
        }

        List<ProductImage> imgs = productImageRepository.findByProductProductId(id);
        String finalImg = !imgs.isEmpty() ? imgs.get(0).getImageUrl() : null;

        logAdminAction(admin, "UPDATE_PRODUCT", "PRODUCT", "Updated medicine ID: " + id + " (" + updated.getName() + ")");

        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", convertProductToDto(updated, finalImg)));
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        User admin = verifyAdmin(userId);

        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AuthException("Medicine not found with ID: " + id));

        productImageRepository.deleteByProductProductId(id);
        productRepository.deleteById(id);

        logAdminAction(admin, "DELETE_PRODUCT", "PRODUCT", "Deleted medicine: " + p.getName() + " (ID: " + id + ")");

        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully", "Deleted"));
    }

    // ─── 3. Category CRUD ─────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCategories(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> result = categories.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("categoryId", c.getCategoryId());
            m.put("categoryName", c.getCategoryName());
            m.put("productCount", productRepository.countByCategoryCategoryId(c.getCategoryId()));
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", result));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @AuthenticationPrincipal Integer userId,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        String categoryName = payload.get("categoryName");
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new AuthException("Category name is required.");
        }

        Category cat = new Category(categoryName.trim());
        Category saved = categoryRepository.save(cat);

        logAdminAction(admin, "CREATE_CATEGORY", "CATEGORY", "Created category: " + categoryName);

        return ResponseEntity.ok(ApiResponse.success("Category created successfully", saved));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AuthException("Category not found with ID: " + id));

        String categoryName = payload.get("categoryName");
        if (categoryName != null && !categoryName.trim().isEmpty()) {
            category.setCategoryName(categoryName.trim());
        }
        Category updated = categoryRepository.save(category);

        logAdminAction(admin, "UPDATE_CATEGORY", "CATEGORY", "Updated category ID: " + id);

        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        User admin = verifyAdmin(userId);

        long count = productRepository.countByCategoryCategoryId(id);
        if (count > 0) {
            throw new AuthException("Cannot delete category containing " + count + " medicines. Remove or reassign medicines first.");
        }

        categoryRepository.deleteById(id);

        logAdminAction(admin, "DELETE_CATEGORY", "CATEGORY", "Deleted category ID: " + id);

        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", "Deleted"));
    }

    // ─── 4. User Management ───────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", u.getUserId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("phoneNumber", u.getPhoneNumber());
            m.put("role", u.getRole());
            m.put("status", u.getAccountStatus());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users list retrieved successfully", result));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("User not found with ID: " + id));

        String newRoleStr = payload.get("role");
        if (newRoleStr != null) {
            try {
                Role newRole = Role.valueOf(newRoleStr.toUpperCase());
                if (targetUser.getRole() == Role.ADMIN && newRole == Role.CUSTOMER) {
                    long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
                    if (adminCount <= 1) {
                        throw new AuthException("Cannot demote the last administrator account.");
                    }
                }
                targetUser.setRole(newRole);
                userRepository.save(targetUser);
                logAdminAction(admin, "UPDATE_USER_ROLE", "USER", "Updated role of user " + targetUser.getEmail() + " to " + newRole);
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid role specified.");
            }
        }
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", targetUser.getRole().name()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("User not found with ID: " + id));

        String status = payload.get("status");
        if (status != null) {
            targetUser.setAccountStatus(status.toUpperCase());
            userRepository.save(targetUser);
            logAdminAction(admin, "UPDATE_USER_STATUS", "USER", "Updated status of user " + targetUser.getEmail() + " to " + status);
        }

        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", targetUser.getAccountStatus()));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<ApiResponse<String>> updateUserPassword(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("User not found with ID: " + id));

        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new AuthException("Password must be at least 6 characters.");
        }

        targetUser.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(targetUser);

        logAdminAction(admin, "RESET_USER_PASSWORD", "USER", "Reset password for user " + targetUser.getEmail());

        return ResponseEntity.ok(ApiResponse.success("User password reset successfully", "Updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        User admin = verifyAdmin(userId);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("User not found with ID: " + id));

        if (targetUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new AuthException("Cannot delete the final admin account.");
            }
        }

        userRepository.deleteById(id);
        logAdminAction(admin, "DELETE_USER", "USER", "Deleted user: " + targetUser.getEmail());

        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "Deleted"));
    }

    // ─── 5. Order Management ──────────────────────────────────────────
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<Order> orders = orderRepository.findAll();
        List<OrderDto> dtos = orders.stream().map(o -> {
            OrderDto dto = new OrderDto();
            dto.setOrderId(o.getOrderId());
            dto.setTotalAmount(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);
            dto.setStatus(o.getStatus() != null ? o.getStatus().name() : "PENDING");
            dto.setShippingAddress(o.getShippingAddress() != null ? o.getShippingAddress() : "Standard Express Pharmacy Delivery");
            dto.setCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt() : LocalDateTime.now());

            if (o.getUser() != null) {
                try {
                    dto.setCustomerName(o.getUser().getFullName() != null ? o.getUser().getFullName() : "Customer");
                    dto.setCustomerEmail(o.getUser().getEmail() != null ? o.getUser().getEmail() : "N/A");
                    dto.setCustomerPhone(o.getUser().getPhoneNumber() != null ? o.getUser().getPhoneNumber() : "N/A");
                } catch (Exception e) {
                    dto.setCustomerName("Registered Customer");
                    dto.setCustomerEmail("customer@sanjeevani.com");
                }
            } else {
                dto.setCustomerName("Registered Customer");
                dto.setCustomerEmail("customer@sanjeevani.com");
            }

            try {
                List<OrderItem> items = orderItemRepository.findByOrderOrderId(o.getOrderId());
                List<OrderDto.OrderItemDto> itemDtos = items.stream().map(item -> {
                    Product p = item.getProduct();
                    String img = null;
                    if (p != null) {
                        List<ProductImage> imgs = productImageRepository.findByProductProductId(p.getProductId());
                        if (!imgs.isEmpty()) img = imgs.get(0).getImageUrl();
                    }
                    return new OrderDto.OrderItemDto(
                            item.getId(),
                            p != null ? p.getProductId() : null,
                            p != null ? p.getName() : "Medicine Product",
                            img,
                            item.getQuantity() != null ? item.getQuantity() : 1,
                            item.getPricePerUnit() != null ? item.getPricePerUnit() : BigDecimal.ZERO,
                            item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO
                    );
                }).collect(Collectors.toList());
                dto.setItems(itemDtos);
            } catch (Exception e) {
                dto.setItems(new ArrayList<>());
            }

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("All system orders fetched successfully", dtos));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateOrderStatus(
            @AuthenticationPrincipal Integer userId,
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        User admin = verifyAdmin(userId);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AuthException("Order not found with ID: " + id));

        String newStatusStr = payload != null ? payload.get("status") : null;
        if (newStatusStr != null && !newStatusStr.trim().isEmpty()) {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.trim().toUpperCase());
                order.setStatus(newStatus);
                orderRepository.save(order);

                logAdminAction(admin, "UPDATE_ORDER_STATUS", "ORDER", "Updated order " + id + " status to " + newStatus);
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid order status: " + newStatusStr);
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order.getStatus() != null ? order.getStatus().name() : "PENDING"));
    }

    // ─── 6. Inventory Management ─────────────────────────────────────
    @GetMapping("/inventory/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventorySummary(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<Product> products = productRepository.findAll();
        LocalDate today = LocalDate.now();

        int available = 0;
        int lowStock = 0;
        int outOfStock = 0;
        int expired = 0;
        int expiringSoon = 0;

        for (Product p : products) {
            int stock = p.getStock() != null ? p.getStock() : 0;
            if (stock > 10) available++;
            else if (stock > 0) lowStock++;
            else outOfStock++;

            if (p.getExpiryDate() != null) {
                if (p.getExpiryDate().isBefore(today)) expired++;
                else if (p.getExpiryDate().isBefore(today.plusDays(30))) expiringSoon++;
            }
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("totalMedicines", products.size());
        map.put("availableStock", available);
        map.put("lowStock", lowStock);
        map.put("outOfStock", outOfStock);
        map.put("expiredMedicines", expired);
        map.put("expiringSoon", expiringSoon);

        return ResponseEntity.ok(ApiResponse.success("Inventory summary fetched", map));
    }

    @PutMapping("/inventory/{id}/stock")
    public ResponseEntity<ApiResponse<ProductDto>> quickUpdateStock(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        User admin = verifyAdmin(userId);

        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AuthException("Medicine not found with ID: " + id));

        Integer stock = Integer.parseInt(payload.get("stock").toString());
        if (stock < 0) throw new AuthException("Stock quantity cannot be negative.");

        p.setStock(stock);
        Product saved = productRepository.save(p);

        List<ProductImage> imgs = productImageRepository.findByProductProductId(id);
        String img = !imgs.isEmpty() ? imgs.get(0).getImageUrl() : null;

        logAdminAction(admin, "QUICK_UPDATE_STOCK", "INVENTORY", "Updated stock for " + p.getName() + " to " + stock);

        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", convertProductToDto(saved, img)));
    }

    // ─── 7. Analytics & Reports ──────────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalyticsData(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);

        List<Order> orders = orderRepository.findAll();
        List<Product> products = productRepository.findAll();

        Map<String, Object> data = new LinkedHashMap<>();

        // Group monthly revenue
        Map<String, BigDecimal> monthlySales = new LinkedHashMap<>();
        for (Order o : orders) {
            if (o.getStatus() != OrderStatus.CANCELLED && o.getCreatedAt() != null) {
                String monthKey = o.getCreatedAt().getMonth().name() + " " + o.getCreatedAt().getYear();
                BigDecimal val = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                monthlySales.merge(monthKey, val, (a, b) -> a.add(b));
            }
        }
        data.put("monthlyRevenue", monthlySales);

        // Orders by Status
        Map<String, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));
        data.put("ordersByStatus", statusCounts);

        // Category distribution
        Map<String, Long> categoryCounts = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(p -> p.getCategory().getCategoryName(), Collectors.counting()));
        data.put("categoryDistribution", categoryCounts);

        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", data));
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(defaultValue = "sales") String type) {
        User admin = verifyAdmin(userId);

        StringBuilder csv = new StringBuilder();
        if ("inventory".equalsIgnoreCase(type)) {
            csv.append("Product ID,Medicine Name,Generic Name,Brand,Category,Price,Discount Price,Stock,Expiry Date,Status\n");
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                csv.append(p.getProductId()).append(",")
                   .append("\"").append(p.getName() != null ? p.getName().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(p.getGenericName() != null ? p.getGenericName().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(p.getBrand() != null ? p.getBrand().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(p.getCategory() != null ? p.getCategory().getCategoryName() : "").append("\",")
                   .append(p.getPrice()).append(",")
                   .append(p.getDiscountPrice() != null ? p.getDiscountPrice() : "").append(",")
                   .append(p.getStock()).append(",")
                   .append(p.getExpiryDate() != null ? p.getExpiryDate() : "").append(",")
                   .append(p.getStatus()).append("\n");
            }
        } else if ("user".equalsIgnoreCase(type) || "customer".equalsIgnoreCase(type)) {
            csv.append("User ID,Full Name,Email,Phone Number,Role,Status,Registered Date\n");
            List<User> users = userRepository.findAll();
            for (User u : users) {
                csv.append(u.getUserId()).append(",")
                   .append("\"").append(u.getFullName() != null ? u.getFullName().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(u.getEmail() != null ? u.getEmail().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(u.getPhoneNumber() != null ? u.getPhoneNumber() : "").append("\",")
                   .append(u.getRole()).append(",")
                   .append(u.getAccountStatus()).append(",")
                   .append(u.getCreatedAt()).append("\n");
            }
        } else {
            csv.append("Order ID,Customer Name,Customer Email,Total Amount,Status,Date\n");
            List<Order> orders = orderRepository.findAll();
            for (Order o : orders) {
                csv.append(o.getOrderId()).append(",")
                   .append("\"").append(o.getUser() != null ? o.getUser().getFullName() : "").append("\",")
                   .append("\"").append(o.getUser() != null ? o.getUser().getEmail() : "").append("\",")
                   .append(o.getTotalAmount()).append(",")
                   .append(o.getStatus()).append(",")
                   .append(o.getCreatedAt()).append("\n");
            }
        }

        logAdminAction(admin, "EXPORT_REPORT", "REPORT", "Exported " + type + " report");

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Sanjeevani_" + type + "_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(@AuthenticationPrincipal Integer userId) {
        verifyAdmin(userId);
        List<AuditLog> logs = auditLogRepository.findTop50ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    private ProductDto convertProductToDto(Product p, String imageUrl) {
        ProductDto dto = new ProductDto();
        dto.setProductId(p.getProductId());
        dto.setName(p.getName());
        dto.setGenericName(p.getGenericName());
        dto.setBrand(p.getBrand());
        dto.setManufacturer(p.getManufacturer());
        dto.setBatchNumber(p.getBatchNumber());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setDiscountPrice(p.getDiscountPrice());
        dto.setStock(p.getStock());
        dto.setExpiryDate(p.getExpiryDate());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getCategoryId());
            dto.setCategoryName(p.getCategory().getCategoryName());
        }
        dto.setImageUrl(imageUrl);
        dto.setPrescriptionRequired(p.getPrescriptionRequired());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
