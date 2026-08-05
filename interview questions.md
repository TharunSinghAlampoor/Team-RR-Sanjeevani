# Sanjeevani Healthcare E-Commerce Platform — Comprehensive Pin-to-Pin Interview Questions & Answers Guide

This document provides a detailed, **pin-to-pin technical interview guide** for the **Sanjeevani Healthcare E-Commerce Platform**. The guide is divided into separate, exhaustive sections covering **Backend Architecture**, **Frontend Architecture**, **Database Architecture**, and **End-to-End System Integrations**.

---

## SECTION 1: BACKEND ARCHITECTURE (Spring Boot 3, Java 17, Spring Security 6 & REST APIs)

### Q1: What is the overall backend architecture of the Sanjeevani platform, and how are responsibilities partitioned?
**Answer:**
The backend is built using **Java 17** and **Spring Boot 3.2.x**, structured around a layered **Controller-Service-Repository-Entity** architectural pattern:

1. **Controller Layer (`com.ecommerce.auth.controller`)**: Exposes RESTful HTTP endpoints, handles request mapping, extracts headers/tokens, and validates request DTO payloads using Jakarta Bean Validation.
2. **Service Layer (`com.ecommerce.auth.service`)**: Contains domain business logic (e.g., authentication workflows, payment verification, cart manipulation, stock reduction, reverse geocoding orchestration).
3. **Repository Layer (`com.ecommerce.auth.repository`)**: Inherits Spring Data JPA interfaces (`JpaRepository`), providing abstraction for SQL execution, parameterized queries, and custom lookup methods.
4. **Entity Layer (`com.ecommerce.auth.entity`)**: Defines database table mappings using JPA annotations (`@Entity`, `@Table`, `@Id`, `@Column`, `@ManyToOne`, `@OneToMany`).
5. **Security & Utility Layer (`com.ecommerce.auth.config`, `filter`, `util`)**: Manages stateless JWT authentication filters, CORS configuration, rate limiting, password encoders, and JWT utility helpers.

---

### Q2: How does Spring Security 6 handle stateless JWT-based authentication pin-to-pin in `SecurityConfig` and `JwtAuthenticationFilter`?
**Answer:**
Spring Security 6 handles authentication statelessly through the following pipeline:

1. **Stateless Session Configuration**: In `SecurityConfig.java`, session creation policy is set to `SessionCreationPolicy.STATELESS`. Spring Security will not construct server-side `HttpSession` objects.
   ```java
   http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
   ```
2. **Endpoint Permit Matching**: `.authorizeHttpRequests()` explicitly declares public routes vs authenticated routes. Servlet context paths (`/api`) strip path prefixes, requiring exact and wildcard matchers for public catalog browsing:
   ```java
   .requestMatchers(
       "/auth/register", "/auth/login", "/auth/forgot-password",
       "/auth/verify-otp", "/auth/reset-password",
       "/categories", "/categories/**", "/products", "/products/**"
   ).permitAll()
   .anyRequest().authenticated()
   ```
3. **Custom `JwtAuthenticationFilter` (`OncePerRequestFilter`)**:
   - Intercepts incoming requests.
   - Extracts the `Authorization` header and checks for the `Bearer ` prefix.
   - Calls `JwtService.extractEmail(token)` and verifies token validity using `Keys.hmacShaKeyFor(secretBytes)`.
   - Loads user details via `UserRepository` and creates a `UsernamePasswordAuthenticationToken`.
   - Populates `SecurityContextHolder.getContext().setAuthentication(authentication)` to grant access for downstream controllers.
   - Placed before Spring's default `UsernamePasswordAuthenticationFilter` via `.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`.

---

### Q3: Why is CORS configured centrally in `SecurityFilterChain` rather than relying only on `@CrossOrigin` annotations on Controllers?
**Answer:**
Spring Security filters run **BEFORE** Spring MVC dispatchers process `@CrossOrigin` controller annotations. When a browser initiates a cross-origin request (e.g., from Vite client `http://localhost:5173` to Spring Boot `http://localhost:8080`), it sends an HTTP `OPTIONS` preflight request.

If CORS is only handled via `@CrossOrigin` at the controller level:
1. The preflight `OPTIONS` request hits Spring Security first.
2. Spring Security rejects the unauthenticated preflight with an HTTP 401 or 403 status code.
3. The browser blocks the subsequent actual API call.

By centralizing CORS inside `SecurityFilterChain` via `.cors(cors -> cors.configurationSource(corsConfigurationSource()))`, preflight requests are caught at the security boundary and returned with HTTP 200 and appropriate headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`).

---

### Q4: Pin-to-pin, how does the user authentication & OTP reset workflow operate across `AuthService`, `OtpService`, and `EmailService`?
**Answer:**
1. **User Registration (`/auth/register`)**:
   - `AuthService.register()` checks if email already exists in `UserRepository`.
   - Encrypts raw password using `BCryptPasswordEncoder(12)`.
   - Saves new `User` entity with `ROLE_USER`. Returns registration confirmation.
2. **User Login (`/auth/login`)**:
   - Validates email existence and checks password match using `passwordEncoder.matches(rawPassword, encodedPassword)`.
   - Generates signed JWT token via `JwtService.generateToken(email)` with 24-hour expiration.
   - Returns JSON containing `token`, `name`, `email`, and `role`.
3. **Forgot Password & OTP (`/auth/forgot-password` & `/auth/verify-otp`)**:
   - Customer submits email. `OtpService` generates a 6-digit cryptographic numeric OTP.
   - Saves record to `otps` table with 10-minute expiry timestamp.
   - `EmailService` sends HTML email formatted with Sanjeevani branding.
   - `/auth/verify-otp` validates the OTP; upon success, `/auth/reset-password` updates the BCrypt hashed password in the `users` table and clears the OTP.

---

### Q5: How is multi-criteria product search, category filtering, and fallback resolution implemented in `ProductService`?
**Answer:**
- **Product Filtering & Search**: `ProductService.getProducts(categoryId, searchQuery)` queries `ProductRepository`. If `categoryId` is provided, it filters by category ID. If `searchQuery` is present, it uses JPA keyword queries searching `name` or `description` containing the search string (case-insensitive).
- **Category Fallback Resolver**: To prevent blank category tabs when categories are empty, `CategoryController`/`ProductService` automatically analyzes existing product entities, extracts distinct categories dynamically, and synthesizes fallback category objects if database seeds are missing.

---

### Q6: How are RESTful APIs structured for Cart, Wishlist/Favorites, and Orders?
**Answer:**
- **Cart API (`CartController`)**:
  - `GET /api/cart`: Fetches active cart items for current authenticated user.
  - `POST /api/cart`: Adds product to cart (or increments quantity if already exists).
  - `PUT /api/cart/{itemId}`: Updates item quantity.
  - `DELETE /api/cart/{itemId}`: Removes item.
  - `DELETE /api/cart/clear`: Purges user's cart after order placement.
- **Favorites API (`FavoriteController`)**:
  - `GET /api/favorites`: Lists favorited product IDs/details.
  - `POST /api/favorites/toggle`: Idempotent toggle adding or removing item from wishlist.
- **Order API (`OrderController`)**:
  - `GET /api/orders`: Retrieves user's order history sorted latest to oldest.
  - `POST /api/orders`: Receives order request DTO (shipping address, item list, total amount, payment method) and persists `Order` and `OrderItem` records.

---

### Q7: How does `RazorpayService` handle server-side order generation and HMAC SHA-256 signature verification?
**Answer:**
1. **Razorpay Order Creation (`/api/payments/razorpay-order`)**:
   - `RazorpayService` instantiates `com.razorpay.RazorpayClient(keyId, keySecret)`.
   - Prepares JSON payload with `amount` (converted to paise: `amountInRupees * 100`), `currency` (`INR`), and `receipt` (`txn_...`).
   - Calls `razorpayClient.orders.create(options)` and receives `razorpay_order_id` (e.g. `order_N123xyz`).
2. **HMAC SHA-256 Verification (`/api/payments/verify`)**:
   - Upon payment completion on client, backend receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - Backend constructs payload string: `razorpay_order_id + "|" + razorpay_payment_id`.
   - Computes HMAC SHA-256 signature using `keySecret`.
   - Compares generated signature with received `razorpay_signature`. If matching, updates `Order` status to `PAID` and inserts record into `payments` table.

---

### Q8: How does `@RestControllerAdvice` process global exceptions and input validation errors?
**Answer:**
A centralized global exception handler (`GlobalExceptionHandler.java`) annotated with `@RestControllerAdvice` catches runtime exceptions across all controllers:
1. **Validation Errors (`MethodArgumentNotValidException`)**: Intercepts failed `@NotNull`, `@NotBlank`, or `@Min` annotations on request DTOs, building a key-value map of field errors and returning HTTP 400 (Bad Request).
2. **Resource Not Found (`ResourceNotFoundException`)**: Returns HTTP 404 (Not Found) with structured JSON payload (`timestamp`, `message`, `status`).
3. **Unauthorized / Invalid Token (`UnauthorizedException`, `BadCredentialsException`)**: Returns HTTP 401 (Unauthorized).
4. **General Uncaught Exceptions (`Exception`)**: Logs error stack trace silently and returns HTTP 500 (Internal Server Error) with a generic, secure error message.

---

### Q9: How are Administrative controls, Audit Logging, and Rate Limiting managed in the backend?
**Answer:**
- **Admin Endpoints (`AdminController`)**: Guarded by `hasRole('ROLE_ADMIN')`. Exposes APIs for product creation/editing, inventory updates, user management, sales analytics, prescription uploads, and medical invoice administration.
- **Audit Logging (`AuditLog`)**: System actions (e.g., admin edits, status changes, user registration) create entries in `audit_logs` tracking `action`, `user_email`, `timestamp`, and `details`.
- **Rate Limiting (`RateLimitConfig`)**: Protects authentication endpoints from brute-force attacks by restricting requests per IP address within sliding time windows.

---

## SECTION 2: FRONTEND ARCHITECTURE (React 18, Vite, Hooks, Context & Geolocation)

### Q10: What is the React 18 component & folder architecture of the Sanjeevani frontend?
**Answer:**
The frontend application uses **React 18.2.0** built with **Vite 8**, structured cleanly into modular directories:

```
frontend/src/
├── api/          # Axios HTTP clients (authService, shopService, adminService)
├── assets/       # Static branding images, icons, and medical graphics
├── components/   # Reusable UI components (Navbar, Cards, Modals, Drawers)
├── context/      # React Context providers (AuthContext.jsx)
├── pages/        # Page views (LandingPage, Dashboard, AdminDashboard, CategoryProductsPage, TrackOrderPage)
├── utils/        # Utility helpers (locationUtils, brandUtils, razorpayUtils, cookieUtils)
├── App.jsx       # Root router & layout wrapper
├── main.jsx      # React DOM root entry point
└── index.css     # Global CSS variables, glassmorphic design tokens & animations
```

---

### Q11: How does `AuthContext.jsx` manage global state and session persistence?
**Answer:**
`AuthContext` provides authentication state across the application:
1. **State variables**: `user`, `token`, `loading`, and `isAuthenticated`.
2. **Persistence**: On application load, `AuthContext` initializes state from `localStorage.getItem('token')` and `localStorage.getItem('user')` (with cookie fallback via `cookieUtils.js`).
3. **Login Handler**: Updates state and syncs credentials to `localStorage` and HTTP headers upon successful login.
4. **Logout Handler**: Clears tokens from `localStorage`, cookies, resets Axios auth headers, and navigates user to `/login`.
5. **Protected Routes (`ProtectedRoute.jsx` & `AdminProtectedRoute.jsx`)**: Higher-Order Components that check `isAuthenticated` and user `role`. If unauthenticated or unauthorized, redirects to `/login` or `/dashboard`.

---

### Q12: How do Axios HTTP interceptors in `shopService.js` handle request headers and unauthenticated guest browsing?
**Answer:**
- **Request Interceptor**: Automatically intercepts every outgoing HTTP request and injects `Authorization: Bearer <token>` if a token exists in `localStorage`.
- **Response Interceptor & Guest Handling**: Intercepts HTTP 401 responses.
  - If user has no active token (guest user browsing public `/categories` or `/products`), 401 responses on non-essential sub-calls (like fetching user cart or wishlist) are caught silently and return default empty structures (`[]`).
  - This prevents guest users from experiencing broken UIs, sudden logout triggers, or infinite redirect loops while viewing catalog products.

---

### Q13: Pin-to-pin, how does GPS location auto-detection and OpenStreetMap reverse geocoding work in `locationUtils.js`?
**Answer:**
1. **Browser GPS Trigger**: `locationUtils.getCurrentLocation()` wraps `navigator.geolocation.getCurrentPosition()` in a JavaScript `Promise`.
2. **Coordinate Fetching**: Obtains browser latitude and longitude coordinates.
3. **Reverse Geocoding Call**: Makes an HTTP GET request to OpenStreetMap Nominatim API:
   `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
4. **Address Parsing**: Extracts address fields (`road`, `suburb`, `city`, `state`, `postcode`) and constructs a formatted address string (e.g., *"123 Healthcare Ave, Indiranagar, Bengaluru, Karnataka, 560038"*).
5. **Persistence**: Populates address field in `CheckoutModal.jsx` / `BuyNowModal.jsx` and saves to `localStorage.setItem('user_shipping_address', address)`.

---

### Q14: How does `razorpayUtils.js` integrate the Razorpay payment modal with the React UI?
**Answer:**
1. **Script Injection**: `razorpayUtils.loadRazorpayScript()` dynamically creates `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` tag and appends it to document head if not already loaded.
2. **Checkout Invocation (`CheckoutModal.jsx`)**:
   - Calls backend `/api/payments/razorpay-order` to fetch `razorpay_order_id`.
   - Constructs Razorpay options object:
     ```javascript
     const options = {
       key: "rzp_test_xxxxxx",
       amount: orderData.amount,
       currency: "INR",
       name: "Sanjeevani Healthcare",
       description: "Order Payment",
       order_id: orderData.razorpayOrderId,
       handler: async function (response) {
         // response contains razorpay_order_id, razorpay_payment_id, razorpay_signature
         await verifyPaymentWithBackend(response);
       },
       prefill: { name: user.name, email: user.email }
     };
     ```
   - Opens checkout window: `const rzp = new window.Razorpay(options); rzp.open();`.

---

### Q15: How does `OrdersModal.jsx` handle reverse-chronological order sorting and responsive UI layout?
**Answer:**
- **Immutable Reverse Sorting**:
  ```javascript
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });
  ```
- **Mobile Responsive Layout**: Uses Flexbox container with `maxHeight: 90vh; overflow: hidden;`. The order list container scrolls vertically (`overflowY: auto`), while headers and modal action buttons remain pinned with `flexShrink: 0`.

---

### Q16: How is the client-side printable PDF GST tax invoice generated without external server PDF dependencies?
**Answer:**
In `downloadOrderInvoice` / `MedicalInvoiceModal.jsx`:
1. Opens a new hidden/popup browser window: `const printWindow = window.open('', '_blank')`.
2. Injects a fully styled HTML5 document containing:
   - Sanjeevani brand header, GST registration, and customer delivery address.
   - Itemized table listing products, quantities, unit prices, subtotal, shipping fee, discounts, and total GST amount.
   - High-contrast, clean typography (`Inter`, `sans-serif`) optimized for paper printing `@media print`.
3. Executes `printWindow.document.close()`, wait for image/asset load, and calls `printWindow.print()`.

---

### Q17: What styling strategies and design tokens are implemented in `index.css`?
**Answer:**
- **Vanilla CSS3 & Custom Variables**: Uses CSS variables for color palettes (`--primary: #059669`, `--dark-slate: #0f172a`, `--bg-card: #ffffff`).
- **Glassmorphism**: Backdrop blur filters (`backdrop-filter: blur(12px)`), subtle translucent borders, and depth elevation shadows (`box-shadow: 0 10px 30px rgba(0,0,0,0.08)`).
- **Icons & Animations**: Uses `lucide-react` icons and Framer Motion micro-animations for card hovers, modal overlays, drawer slides, and smooth transitions.

---

## SECTION 3: DATABASE ARCHITECTURE, JPA & MYSQL SCHEMAS

### Q18: How is Spring Data JPA & Hibernate configured for MySQL 8.0 and H2 in-memory databases?
**Answer:**
- **`application.properties` / Spring Profiles**:
  - **Production (MySQL 8.0)**:
    - Driver: `com.mysql.cj.jdbc.Driver`
    - Dialect: `org.hibernate.dialect.MySQLDialect` or `MySQL8Dialect`
    - URL: `jdbc:mysql://localhost:3306/ecommerce_db?useSSL=false&serverTimezone=UTC`
  - **Development / Testing (H2 In-Memory)**:
    - URL: `jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`
    - H2 Console enabled at `/h2-console`.
- **Hibernate DDL Auto**: `spring.jpa.hibernate.ddl-auto=update` automatically syncs JPA entity changes with database schemas.

---

### Q19: What are the exact table schemas, columns, constraints, and relationships for all 16 database entities pin-to-pin?
**Answer:**

#### 1. `users` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | Customer full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email address |
| `password` | VARCHAR(255) | NOT NULL | BCrypt encrypted password hash |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'ROLE_USER' | Access authority (`ROLE_USER`, `ROLE_ADMIN`) |
| `phone` | VARCHAR(20) | NULL | Customer contact phone number |
| `address` | TEXT | NULL | Default saved shipping address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

#### 2. `categories` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique category identifier |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Category name (e.g. Wellness, Devices) |
| `description` | TEXT | NULL | Category overview |
| `icon` | VARCHAR(100) | NULL | Icon class identifier |
| `image_url` | VARCHAR(500) | NULL | Category display image link |

#### 3. `products` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| `name` | VARCHAR(255) | NOT NULL | Product title |
| `description` | TEXT | NULL | Detailed product description |
| `price` | DECIMAL(10,2) | NOT NULL | Product price in INR |
| `category_id` | BIGINT | FOREIGN KEY (`categories.id`) | Relational link to category |
| `image_url` | VARCHAR(500) | NULL | Main product thumbnail image |
| `stock_quantity` | INT | NOT NULL, DEFAULT 100 | Inventory count available |
| `rating` | DECIMAL(3,2) | DEFAULT 4.5 | Customer review rating |

#### 4. `product_images` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Image ID |
| `product_id` | BIGINT | FOREIGN KEY (`products.id`) | Relational link to product |
| `image_url` | VARCHAR(500) | NOT NULL | Secondary product image URL |

#### 5. `orders` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Internal primary key |
| `order_id` | VARCHAR(100) | UNIQUE, NOT NULL | Display business Order Ref (e.g., ORD-98123) |
| `user_id` | BIGINT | FOREIGN KEY (`users.id`) | Relational link to customer |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Order total charge |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'PAID' | Status (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `payment_method` | VARCHAR(100) | NOT NULL | Method (`RAZORPAY`, `COD`) |
| `razorpay_order_id` | VARCHAR(255) | NULL | Gateway Order ID |
| `razorpay_payment_id`| VARCHAR(255) | NULL | Gateway Payment ID |
| `shipping_address` | TEXT | NOT NULL | Delivery address string |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order placement timestamp |

#### 6. `order_items` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Order item ID |
| `order_id` | BIGINT | FOREIGN KEY (`orders.id`) | Relational link to parent order |
| `product_id` | BIGINT | FOREIGN KEY (`products.id`) | Purchased product reference |
| `quantity` | INT | NOT NULL | Purchased quantity |
| `price_per_unit` | DECIMAL(10,2) | NOT NULL | Historical price at time of purchase |

#### 7. `payments` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Payment transaction ID |
| `order_id` | BIGINT | FOREIGN KEY (`orders.id`) | Associated order |
| `payment_id` | VARCHAR(255) | UNIQUE, NOT NULL | Razorpay payment ID |
| `razorpay_signature`| VARCHAR(255) | NOT NULL | Gateway verification signature |
| `status` | VARCHAR(50) | NOT NULL | Payment status (`SUCCESS`, `FAILED`) |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `payment_mode` | VARCHAR(50) | DEFAULT 'CARD' | Mode (CARD, UPI, NETBANKING, COD) |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |

#### 8. `cart_items` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Cart entry ID |
| `user_id` | BIGINT | FOREIGN KEY (`users.id`) | Cart owner |
| `product_id` | BIGINT | FOREIGN KEY (`products.id`) | Added product |
| `quantity` | INT | NOT NULL, DEFAULT 1 | Item quantity in cart |

#### 9. `favorites` / `wishlist_items` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Favorite entry ID |
| `user_id` | BIGINT | FOREIGN KEY (`users.id`) | User reference |
| `product_id` | BIGINT | FOREIGN KEY (`products.id`) | Favorited product reference |

#### 10. `otps` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | OTP record ID |
| `email` | VARCHAR(255) | NOT NULL | Recipient email |
| `otp_code` | VARCHAR(10) | NOT NULL | Generated numeric OTP |
| `expiry_time` | TIMESTAMP | NOT NULL | OTP expiration timestamp |

#### 11. `audit_logs` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Log ID |
| `action` | VARCHAR(255) | NOT NULL | Executed system action |
| `user_email` | VARCHAR(255) | NOT NULL | Performing user email |
| `details` | TEXT | NULL | Extended log payload |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Execution timestamp |

---

### Q20: How are JPA Entity relationships (`@ManyToOne`, `@OneToMany`) structured, and how are fetch types chosen?
**Answer:**
- **Product ↔ Category**: `@ManyToOne(fetch = FetchType.LAZY)` on `Product` with `@JoinColumn(name = "category_id")`. Lazy loading prevents fetching category records when querying individual products.
- **Order ↔ OrderItem**: `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)` on `Order`. When an `Order` is persisted or deleted, associated `OrderItem` entities are automatically persisted or removed.
- **User ↔ CartItem / Favorites**: `@OneToMany` with `FetchType.LAZY` to maintain data modularity without heavy object tree overhead.

---

### Q21: How does the backend prevent `LazyInitializationException` and cyclic JSON serialization loops?
**Answer:**
1. **Preventing Cyclic Loops**: Bi-directional JPA relationships (e.g. `Order` referencing `OrderItem`, which references back to `Order`) cause infinite JSON recursion during Jackson serialization. Solved using DTO mapping (`OrderResponseDTO`) or `@JsonIgnore` / `@JsonManagedReference` & `@JsonBackReference`.
2. **Preventing `LazyInitializationException`**: Occurs when serializing lazy-loaded proxies outside active transactional sessions. Solved by mapping entity instances into decoupled DTO objects inside `@Transactional` service methods before returning to controllers.

---

### Q22: How does `@Transactional` guarantee ACID compliance during checkout?
**Answer:**
In `OrderService.createOrder()`:
- The method is annotated with `@Transactional`.
- Operations executed:
  1. Validates product availability and decreases `stock_quantity` in `products`.
  2. Creates and saves `Order` entity.
  3. Creates and saves `OrderItem` list.
  4. Deletes items from `cart_items` table.
- **Atomicity**: If stock reduction fails or payment verification throws an exception midway, Spring Data JPA rolls back **ALL** database operations executed within the transaction scope, ensuring inventory is never depleted without an order.

---

### Q23: What database indexing strategies are employed for performance optimization?
**Answer:**
1. **Unique Indexes**:
   - `users(email)`: Speeds up user authentication lookup and prevents duplicate accounts.
   - `orders(order_id)`: Accelerates order tracking and invoice queries.
   - `payments(payment_id)`: Prevents duplicate payment verification callbacks.
2. **Foreign Key Indexes**:
   - `products(category_id)`: Optimizes catalog category filtering.
   - `order_items(order_id)`: Accelerates fetching items for order summary views.
   - `cart_items(user_id)`: Optimizes cart retrieval for active user sessions.

---

## SECTION 4: END-TO-END SYSTEM INTEGRATIONS & WORKFLOWS

### Q24: Pin-to-pin, trace a user's journey from landing on Sanjeevani to receiving their order confirmation and invoice.
**Answer:**
1. **Browsing**: Unauthenticated guest arrives at Vite client (`/`). Frontend calls `GET /categories` and `GET /products`. Axios intercepts 401s on secondary user checks, rendering catalog smoothly.
2. **Authentication**: User logs in at `/login`. Backend validates password via BCrypt, returning a signed JWT token. `AuthContext` saves token to `localStorage` and Axios default headers.
3. **Cart & Geolocation**: User adds items to cart (`POST /api/cart`). Opens checkout modal, clicks "Detect My Location". Browser geolocation coordinates are reverse-geocoded via OpenStreetMap Nominatim into a shipping address string.
4. **Razorpay Order Creation**: User clicks "Proceed to Payment". Client calls `POST /api/payments/razorpay-order`. Backend calls Razorpay API to generate `razorpay_order_id`.
5. **Payment Execution**: Razorpay checkout JS modal opens. User completes payment via UPI/Card. Razorpay returns signature.
6. **Signature Verification & Persistence**: Client sends signature to `POST /api/payments/verify`. Backend verifies HMAC SHA-256 hash, updates order status to `PAID`, reduces inventory stock under `@Transactional`, and clears cart.
7. **Order History & Invoice**: User views `/api/orders` (sorted newest first), tracks status stepper (Ordered -> Paid -> Packed -> Out for Delivery), and clicks "Download PDF Invoice" to launch browser-native printable GST invoice window.

---

### Q25: How does the architecture protect against top web security vulnerabilities (OWASP Top 10)?
**Answer:**
1. **SQL Injection**: Handled by Spring Data JPA / Hibernate parameterized queries and criteria builders. No raw SQL concatenation.
2. **XSS (Cross-Site Scripting)**: React automatically escapes variables in JSX rendering. Input fields sanitize strings.
3. **Broken Authentication**: Password storage uses BCrypt (cost factor 12). JWT tokens signed with HMAC SHA-256 secret keys and expire after 24 hours.
4. **CSRF (Cross-Site Request Forgery)**: CSRF protection disabled in Spring Security because session state is stateless JWT stored in headers, not vulnerable cookie sessions.
5. **CORS Misconfiguration**: Security filter chain enforces explicit allowed origins, methods, and preflight headers.
