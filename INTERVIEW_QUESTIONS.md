# Full-Stack E-Commerce Platform — Technical Interview Questions & Answers

This document contains 30 comprehensive, in-depth technical interview questions and answers covering Spring Boot 3, Spring Security 6, React.js 18, Razorpay Integration, RESTful API Design, and Database Architecture based on the **Sanjeevani E-Commerce Platform**.

---

## Section 1: Spring Boot & Spring Security 6

### Q1: How does Spring Security 6 handle stateless authentication with JWT tokens?
**Answer:**
Spring Security 6 handles stateless authentication by configuring `SessionCreationPolicy.STATELESS` in the `SecurityFilterChain`. A custom `JwtAuthenticationFilter` intercepts incoming HTTP requests, extracts the JWT token from the `Authorization: Bearer <token>` header (or custom request params), validates the cryptographic signature using a secret key, extracts user claims/email, and builds an `UsernamePasswordAuthenticationToken` object. This authentication object is then set into the `SecurityContextHolder.getContext().setAuthentication(auth)`, allowing Spring Security to authorize requests without creating server-side HTTP sessions.

---

### Q2: Why did Spring Security 6 replace `.authorizeRequests()` with `.authorizeHttpRequests()`, and how are path matchers like `/categories` handled?
**Answer:**
In Spring Security 6 (Spring Boot 3), `.authorizeRequests()` was deprecated in favor of `.authorizeHttpRequests()`, which uses `AuthorizationManager` instead of `AccessDecisionManager`. When matching Servlet path contexts (e.g. `server.servlet.context-path=/api`), path matchers evaluate paths post-servlet strip. Furthermore, `.requestMatchers("/categories/**")` matches subpaths (like `/categories/1`), but does NOT match the root path `/categories`. Therefore, both exact paths `/categories` and wildcard paths `/categories/**` must be explicitly declared in `.permitAll()`.

---

### Q3: Explain how CORS (Cross-Origin Resource Sharing) is configured in Spring Security 6 to support frontend clients running on Vite (`http://localhost:5173`).
**Answer:**
CORS must be enabled directly inside the `SecurityFilterChain` bean using `.cors(cors -> cors.configurationSource(corsConfigurationSource()))`. The injected `CorsConfigurationSource` creates a `CorsConfiguration` object with:
- `.allowedOriginPatterns(Arrays.asList("*"))` or explicit origins `http://localhost:5173`, `http://127.0.0.1:5173`.
- `.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"))`.
- `.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"))`.
- `.setAllowCredentials(true)`.

---

### Q4: What is the purpose of `@CrossOrigin(origins = "*")` vs central `CorsConfigurationSource` in Spring Boot?
**Answer:**
`@CrossOrigin` is a controller-level annotation handled by Spring MVC. However, Spring Security filters execute BEFORE Spring MVC controllers. If a request preflight (`OPTIONS`) hits Spring Security first and security CORS is not configured, Spring Security blocks the request with HTTP 403 / 401 before Spring MVC can process `@CrossOrigin`. Central `CorsConfigurationSource` registered in `SecurityFilterChain` guarantees that preflights and cross-origin headers are handled at the security boundary before any controller invocation.

---

### Q5: How do DTOs (Data Transfer Objects) improve API design and security in a Spring Boot e-commerce application?
**Answer:**
DTOs decouple internal JPA entity models from external API contracts. Advantages:
1. **Security**: Prevents over-posting/mass-assignment vulnerabilities by exposing only required fields (hiding sensitive entity attributes like BCrypt password hashes).
2. **Performance**: Avoids lazy loading exceptions (`LazyInitializationException`) and infinite circular serialization loops when converting JPA bi-directional relationships (e.g., User ↔ Orders) to JSON.
3. **Validation**: Allows clean Jakarta Bean Validation (`@NotNull`, `@NotBlank`, `@Min`) on request DTOs.

---

## Section 2: React 18, State Management & Geolocation

### Q6: How does the application handle guest users visiting `/dashboard` without triggering infinite 401 unauthenticated redirect loops?
**Answer:**
The `shopService.js` Axios response interceptor verifies whether an active authentication token exists in `localStorage` or `AuthContext` before triggering an automatic session logout/redirect on HTTP 401 errors. If an unauthenticated guest user views public endpoints (like `/categories` or `/products`), 401 responses on protected secondary calls (like `/cart` or `/favorites`) are caught gracefully and return empty arrays (`[]`), allowing guest users to browse products without crashing or wiping sessions.

---

### Q7: How is browser Geolocation and OpenStreetMap Nominatim reverse geocoding implemented in React?
**Answer:**
The `locationUtils.js` module wraps `navigator.geolocation.getCurrentPosition()` inside a JavaScript `Promise`. Upon user permission:
1. Obtains GPS coordinates (`latitude`, `longitude`).
2. Performs an HTTP GET request to `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`.
3. Extracts structured address components (`road`, `suburb`, `city`, `state`, `postcode`) and formats a human-readable delivery address string.
4. Auto-fills the address input and persists it in `localStorage.setItem('user_shipping_address', address)`.

---

### Q8: What design pattern is used to sort the order history list from Latest to Oldest in `OrdersModal.jsx`?
**Answer:**
Reverse chronological sorting is implemented on an immutable copy of the orders array before mapping:
```javascript
const sortedOrders = [...orders].sort((a, b) => {
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (timeA !== timeB) return timeB - timeA;

  const idA = Number(String(a.orderId || '').replace(/[^0-9]/g, '')) || 0;
  const idB = Number(String(b.orderId || '').replace(/[^0-9]/g, '')) || 0;
  return idB - idA;
});
```

---

### Q9: How does `OrderSuccessModal.jsx` ensure action buttons remain 100% visible across mobile and desktop screens?
**Answer:**
`OrderSuccessModal` uses Flexbox container layout with `display: flex; flexDirection: column; maxHeight: 90vh; overflow: hidden;`. The scrollable body has `flex: 1; overflowY: auto;` while the bottom action buttons (`Download Invoice`, `Track Order`, `Continue Shopping`) are placed inside a fixed footer with `flexShrink: 0` and top elevation shadow. This guarantees the buttons never get pushed off-screen regardless of content height.

---

### Q10: What is the purpose of React Error Boundaries in the application?
**Answer:**
Top-level `ErrorBoundary` components catch unhandled runtime JavaScript errors anywhere in the child component tree, preventing the entire React app from displaying a blank white screen. It renders a clean fallback UI displaying the error message and a **"Reset Session / Reload Dashboard"** button.

---

## Section 3: Razorpay Payment Gateway & System Design

### Q11: Explain the 3-step Razorpay payment workflow implemented in this application.
**Answer:**
1. **Order Creation (Server Side)**: Client requests order checkout. Spring Boot `RazorpayService` calls `RazorpayClient.orders.create()` with amount (in paise), currency (`INR`), and receipt ID. Razorpay returns `razorpay_order_id`.
2. **Payment Checkout (Client Side)**: Frontend dynamically loads `https://checkout.razorpay.com/v1/checkout.js` and opens the Razorpay payment modal passing `order_id`, `amount`, and user details.
3. **Verification & Fulfillment (Server Side)**: After user payment, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The client sends these to `/api/payments/verify`. Backend calculates HMAC SHA-256 hash using merchant secret and confirms signature match before marking order status as `PAID`.

---

### Q12: How are price calculations handled for orders with promotions and shipping fees?
**Answer:**
- **Items Subtotal**: `Σ (pricePerUnit × quantity)`
- **Shipping Fee**: ₹40.00 (or free above threshold)
- **COD Fee**: ₹8.80 if Cash on Delivery
- **Total Before Promo**: `Subtotal + Shipping + COD`
- **Promotion Applied**: -₹40.00
- **Grand Total**: `Math.max(0, TotalBeforePromo - Promo)`

---

### Q13: How is the printable PDF tax invoice generated without third-party PDF server dependencies?
**Answer:**
`downloadOrderInvoice` creates a dynamic browser print window via `window.open('', '_blank')`. It writes an HTML5 document containing high-legibility CSS typography, Sanjeevani company branding, itemized order tables, side-by-side **Payment Details** and **Order Summary** boxes, and triggers `window.print()` upon `onload`.

---

### Q14: How are database transactions managed when placing an order in Spring Boot?
**Answer:**
The order placement service method is annotated with `@Transactional`. If any step (cart retrieval, order record insertion, item stock reduction, or payment record creation) fails or throws an exception, Spring Data JPA automatically rolls back all database mutations to maintain data integrity.

---

### Q15: How does the app ensure high-contrast legibility and responsive UI design?
**Answer:**
The design system uses HSL/HEX color tokens (`#0f172a` slate headings, `#059669` emerald badges, `#f8fafc` card backgrounds), modern sans-serif typography (`Inter`), responsive CSS Grid/Flexbox layouts with media queries, and micro-interactions for buttons and inputs.
