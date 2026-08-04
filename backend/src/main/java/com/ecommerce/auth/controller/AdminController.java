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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    public AdminController(
            UserRepository userRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    private void verifyAdmin(Integer userId) {
        if (userId == null) {
            throw new AuthException("Unauthorized. Admin authentication required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found."));
        if (user.getRole() != Role.ADMIN) {
            throw new AuthException("Access Denied. Administrator privileges are required.");
        }
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

        // Revenue calculations
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        BigDecimal yearlyRevenue = BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();

        int pendingOrders = 0;
        int deliveredOrders = 0;
        int cancelledOrders = 0;

        for (Order order : allOrders) {
            if (order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.FAILED) {
                BigDecimal amt = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                totalRevenue = totalRevenue.add(amt);

                if (order.getCreatedAt() != null) {
                    if (order.getCreatedAt().toLocalDate().isEqual(now.toLocalDate())) {
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
        }

        // Product stock metrics
        int outOfStock = 0;
        int lowStock = 0;

        for (Product p : allProducts) {
            if (p.getStock() == null || p.getStock() == 0) outOfStock++;
            else if (p.getStock() < 10) lowStock++;
        }

        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("yearlyRevenue", yearlyRevenue);

        stats.put("totalOrders", allOrders.size());
        stats.put("pendingOrders", pendingOrders);
        stats.put("deliveredOrders", deliveredOrders);
        stats.put("cancelledOrders", cancelledOrders);

        stats.put("totalUsers", allUsers.size());
        stats.put("totalMedicines", allProducts.size());
        stats.put("totalCategories", allCategories.size());
        stats.put("outOfStockMedicines", outOfStock);
        stats.put("lowStockMedicines", lowStock);
        stats.put("prescriptionMedicines", allProducts.size());
        stats.put("nonPrescriptionMedicines", 0);

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
    @PostMapping("/products")
    @Transactional
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @AuthenticationPrincipal Integer userId,
            @RequestBody Map<String, Object> payload) {
        verifyAdmin(userId);

        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Object priceObj = payload.get("price");
        Object stockObj = payload.get("stock");
        Object catIdObj = payload.get("categoryId");
        String imageUrl = (String) payload.get("imageUrl");

        if (name == null || name.trim().isEmpty()) {
            throw new AuthException("Medicine name is required.");
        }
        BigDecimal price = priceObj != null ? new BigDecimal(priceObj.toString()) : BigDecimal.ZERO;
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AuthException("Medicine price must be greater than 0.");
        }
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
        Product saved = productRepository.save(product);

        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            ProductImage pImg = new ProductImage(saved, imageUrl.trim());
            productImageRepository.save(pImg);
        }

        ProductDto dto = convertProductToDto(saved, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Medicine created successfully", dto));
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        verifyAdmin(userId);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AuthException("Medicine not found with ID: " + id));

        if (payload.containsKey("name")) product.setName(((String) payload.get("name")).trim());
        if (payload.containsKey("description")) product.setDescription((String) payload.get("description"));
        if (payload.containsKey("price")) product.setPrice(new BigDecimal(payload.get("price").toString()));
        if (payload.containsKey("stock")) product.setStock(Integer.parseInt(payload.get("stock").toString()));

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

        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", convertProductToDto(updated, finalImg)));
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        verifyAdmin(userId);

        if (!productRepository.existsById(id)) {
            throw new AuthException("Medicine not found with ID: " + id);
        }

        productImageRepository.deleteByProductProductId(id);
        productRepository.deleteById(id);

        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully", "Deleted"));
    }

    // ─── 3. Category CRUD ─────────────────────────────────────────────
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @AuthenticationPrincipal Integer userId,
            @RequestBody Map<String, String> payload) {
        verifyAdmin(userId);

        String categoryName = payload.get("categoryName");
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new AuthException("Category name is required.");
        }

        Category cat = new Category(categoryName.trim());
        Category saved = categoryRepository.save(cat);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", saved));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        verifyAdmin(userId);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AuthException("Category not found with ID: " + id));

        String categoryName = payload.get("categoryName");
        if (categoryName != null && !categoryName.trim().isEmpty()) {
            category.setCategoryName(categoryName.trim());
        }
        Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        verifyAdmin(userId);

        long count = productRepository.countByCategoryCategoryId(id);
        if (count > 0) {
            throw new AuthException("Cannot delete category containing " + count + " medicines. Remove or reassign medicines first.");
        }

        categoryRepository.deleteById(id);
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
            m.put("createdAt", u.getCreatedAt());
            m.put("status", "ACTIVE");
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users list retrieved successfully", result));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        verifyAdmin(userId);

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
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid role specified.");
            }
        }
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", targetUser.getRole().name()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer id) {
        verifyAdmin(userId);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("User not found with ID: " + id));

        if (targetUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new AuthException("Cannot delete the final admin account.");
            }
        }

        userRepository.deleteById(id);
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
            dto.setTotalAmount(o.getTotalAmount());
            dto.setStatus(o.getStatus().name());
            dto.setShippingAddress(o.getShippingAddress());
            dto.setCreatedAt(o.getCreatedAt());

            if (o.getUser() != null) {
                dto.setCustomerName(o.getUser().getFullName());
                dto.setCustomerEmail(o.getUser().getEmail());
                dto.setCustomerPhone(o.getUser().getPhoneNumber());
            }

            // Fetch order items
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
                        p != null ? p.getName() : "Product",
                        img,
                        item.getQuantity(),
                        item.getPricePerUnit(),
                        item.getTotalPrice()
                );
            }).collect(Collectors.toList());
            dto.setItems(itemDtos);

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("All system orders fetched successfully", dtos));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateOrderStatus(
            @AuthenticationPrincipal Integer userId,
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        verifyAdmin(userId);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AuthException("Order not found with ID: " + id));

        String newStatusStr = payload.get("status");
        if (newStatusStr != null) {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
                order.setStatus(newStatus);
                orderRepository.save(order);
            } catch (IllegalArgumentException e) {
                throw new AuthException("Invalid order status: " + newStatusStr);
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order.getStatus().name()));
    }

    // ─── 6. Reports & Export ──────────────────────────────────────────
    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(defaultValue = "sales") String type) {
        verifyAdmin(userId);

        StringBuilder csv = new StringBuilder();
        if ("inventory".equalsIgnoreCase(type)) {
            csv.append("Product ID,Name,Description,Price,Stock,Category\n");
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                csv.append(p.getProductId()).append(",")
                   .append("\"").append(p.getName() != null ? p.getName().replace("\"", "\"\"") : "").append("\",")
                   .append("\"").append(p.getDescription() != null ? p.getDescription().replace("\"", "\"\"") : "").append("\",")
                   .append(p.getPrice()).append(",")
                   .append(p.getStock()).append(",")
                   .append("\"").append(p.getCategory() != null ? p.getCategory().getCategoryName() : "").append("\"\n");
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

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Sanjeevani_" + type + "_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    private ProductDto convertProductToDto(Product p, String imageUrl) {
        ProductDto dto = new ProductDto();
        dto.setProductId(p.getProductId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getCategoryId());
            dto.setCategoryName(p.getCategory().getCategoryName());
        }
        dto.setImageUrl(imageUrl);
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
