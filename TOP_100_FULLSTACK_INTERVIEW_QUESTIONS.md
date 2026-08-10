# Sanjeevani Healthcare Platform — Master 100 Full-Stack Technical Interview Questions & Answers

This document contains **100 Core Theoretical & Production Technical Interview Questions and Answers** (50 Frontend + 50 Backend) based on the production codebase of the **Sanjeevani Healthcare E-Commerce Platform** (JavaScript ES6+, React 18, Vite 8, Java 17, Spring Boot 3.2, Spring Security 6, Spring Data JPA, Hibernate 6, MySQL 8.0, and Razorpay Java SDK).

---

# 🎨 PART 1: TOP 50 FRONTEND TECHNICAL INTERVIEW QUESTIONS & ANSWERS

## 1. REACT 18 & FRONTEND ARCHITECTURE

### Q1: What is the overall frontend project architecture and folder structure of Sanjeevani?
**Answer:**
The frontend application uses **React 18.2** built with **Vite 8**, structured into modular directories:
- `src/api/`: Axios HTTP service modules (`authService.js`, `shopService.js`, `adminService.js`).
- `src/components/`: Reusable UI components (`Navbar`, `ProductCard`, `CartDrawer`, `OrdersModal`, `MedicalInvoiceModal`, `ToastNotification`).
- `src/context/`: React Context state providers (`AuthContext.jsx`).
- `src/pages/`: Main page views (`LandingPage`, `Dashboard`, `CategoryProductsPage`, `TrackOrderPage`, `AdminDashboard`).
- `src/utils/`: Utility functions (`locationUtils.js`, `brandUtils.js`, `razorpayUtils.js`, `cookieUtils.js`).
- `src/index.css`: Global CSS custom properties, glassmorphism tokens, and keyframe animations.

---

### Q2: Why was Vite 8 chosen over Create React App (CRA) for building this application?
**Answer:**
1. **Speed**: Vite uses **ESBuild** (written in Go) for pre-bundling dependencies, starting dev servers in milliseconds compared to CRA's Webpack.
2. **Instant HMR**: Native ES modules (ESM) provide instant Hot Module Replacement without re-compiling full bundle trees.
3. **Build Optimization**: Uses **Rollup** for production builds, producing smaller, code-split JS bundles.

---

### Q3: How does `AuthContext.jsx` manage global state and session persistence?
**Answer:**
`AuthContext` provides `user`, `token`, `loading`, and `isAuthenticated` state across the application:
1. **Initialization**: On mount, `useEffect` reads stored tokens and user objects from `localStorage` (with cookie fallback via `cookieUtils.js`).
2. **Login Handler**: Updates state, persists credentials to `localStorage`, and sets default Axios `Authorization Bearer` headers.
3. **Logout Handler**: Clears `localStorage` and cookies, resets Axios auth headers, resets state to `null`, and redirects to `/login`.

---

### Q4: How do `ProtectedRoute.jsx` and `AdminProtectedRoute.jsx` guard client-side routes?
**Answer:**
Higher-Order Wrapper Components checking user access permissions:
- `ProtectedRoute`: Checks `isAuthenticated` from `AuthContext`. If false, renders `<Navigate to="/login" replace />`.
- `AdminProtectedRoute`: Checks `isAuthenticated` AND asserts `user.role === 'ADMIN'`. If unauthenticated or user is a customer, redirects to `/admin/login` or `/dashboard`.

---

### Q5: How are Axios request interceptors configured in `shopService.js` and `authService.js`?
**Answer:**
Axios instances configure request interceptors to auto-inject JWT tokens:
```javascript
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```
Every outgoing API call automatically attaches `Authorization: Bearer <token>` without repeating code.

---

## 2. GUEST BROWSING & HTTP INTERCEPTORS

### Q6: Pin-to-pin, how does `shopService.js` handle HTTP 401 errors for unauthenticated guest browsing?
**Answer:**
When unauthenticated guests view public routes (`/categories`, `/products`), secondary component calls (fetching cart or wishlist) return HTTP 401 Unauthorized.
The Axios response interceptor catches 401 errors:
1. Verifies if `localStorage` contains an active token.
2. If **NO** token exists (guest user), catches error silently and resolves default empty arrays (`[]`).
3. If an active token **WAS** present (expired session), clears credentials and triggers logout.

This prevents guest catalog browsing from crashing UIs or causing infinite redirect loops.

---

### Q7: How does `shopService.js` centralize API calls for products, cart, and orders?
**Answer:**
Encapsulates REST endpoints into service methods:
- `getProducts(categoryId, searchQuery)`: Calls `GET /products`.
- `getCart()`: Calls `GET /api/cart`.
- `addToCart(productId, quantity)`: Calls `POST /api/cart`.
- `getUserOrders()`: Calls `GET /api/orders`.
Components call these clean Promise-based methods instead of raw `fetch()` calls.

---

### Q8: How is global error handling implemented for Axios network failures?
**Answer:**
Response interceptors handle global HTTP errors (400, 401, 403, 404, 500):
- If `error.response` exists: parses error payload (`response.data.message`).
- If `error.request` exists (network down): returns "Server unreachable. Please check your internet connection."
- Rejects Promise with standardized error objects passed to UI toast notifications.

---

### Q9: How does `adminService.js` manage admin-specific API calls?
**Answer:**
Provides methods for administrative operations: `getAdminStats()`, `getAllMedicines()`, `createMedicine()`, `updateMedicine()`, `deleteMedicine()`, `getAllUsers()`, `updateUserRole()`, `updateUserStatus()`, and `exportReport(type)`. Uses authenticated Axios instance with admin bearer headers.

---

### Q10: How does `cookieUtils.js` provide fallback storage when `localStorage` is disabled?
**Answer:**
`cookieUtils.js` provides helper functions:
- `setCookie(name, value, days)`: Encodes and writes cookie with `SameSite=Lax` and `Secure`.
- `getCookie(name)`: Parses `document.cookie` string.
- `eraseCookie(name)`: Expires cookie.
If `localStorage` is blocked by browser privacy modes, `AuthContext` falls back to `cookieUtils` to maintain session persistence.

---

## 3. GEOLOCATION & EXTERNAL APIS

### Q11: Pin-to-pin, how does `locationUtils.js` implement browser GPS auto-detection and OpenStreetMap reverse geocoding?
**Answer:**
1. **Browser GPS**: `locationUtils.getCurrentLocation()` wraps `navigator.geolocation.getCurrentPosition()` inside a JavaScript `Promise`.
2. **Coordinates**: Obtains `latitude` and `longitude`.
3. **Reverse Geocoding**: Calls OpenStreetMap Nominatim API:
   `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
4. **Address Parsing**: Extracts `road`, `suburb`, `city`, `state`, `postcode` and constructs delivery address string.
5. **Auto-Fill**: Populates inputs in `CheckoutModal` and saves to `localStorage.setItem('user_shipping_address', address)`.

---

### Q12: How does `locationUtils.js` handle location permission denials by users?
**Answer:**
`navigator.geolocation.getCurrentPosition` receives error callback. If user denies location permission (`error.PERMISSION_DENIED`), Promise rejects with human-readable error: *"Location permission denied. Please enter delivery address manually."* UI catches error and focuses text area for manual typing.

---

### Q13: How does `razorpayUtils.js` dynamically load the Razorpay checkout SDK script?
**Answer:**
```javascript
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```
Dynamically appends `<script>` tag to document body if not already present.

---

### Q14: How does `CheckoutModal.jsx` handle the Razorpay payment flow?
**Answer:**
1. Calls backend `/api/payments/razorpay-order` to get `razorpay_order_id`.
2. Constructs options object with `key`, `amount`, `currency`, `order_id`, and `handler` callback.
3. Opens payment modal: `const rzp = new window.Razorpay(options); rzp.open();`.
4. `handler` receives payment response and calls backend `/api/payments/verify` to confirm signature.

---

### Q15: How does the application handle Razorpay payment modal cancellation by user?
**Answer:**
Razorpay options object includes `modal.ondismiss` callback function. If user closes Razorpay modal without paying, `ondismiss` triggers, notifying user *"Payment cancelled"*, restoring order summary, and keeping cart intact.

---

## 4. UI COMPONENTS & STATE MANAGEMENT

### Q16: How does `OrdersModal.jsx` implement immutable reverse chronological order sorting?
**Answer:**
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
Creates array shallow copy `[...orders]` before calling `.sort()`, preserving original state immutability.

---

### Q17: How does `OrderSuccessModal` maintain 100% visible action buttons across viewports?
**Answer:**
Uses Flexbox column container with `maxHeight: 90vh` and `overflow: hidden`. Scrollable order summary content uses `flex: 1; overflowY: auto`, while bottom action buttons (*Download Invoice*, *Track Order*) are pinned inside fixed footer with `flexShrink: 0`.

---

### Q18: Pin-to-pin, how is client-side printable PDF GST tax invoice generated in `downloadOrderInvoice`?
**Answer:**
1. Opens popup window: `const printWindow = window.open('', '_blank')`.
2. Writes HTML5 document with Sanjeevani brand header, GST registration, delivery address, itemized pricing table, and `@media print` CSS.
3. Executes `printWindow.document.close()`, waits for image load, and calls `printWindow.print()`.

---

### Q19: What is the operational difference between Cart Checkout and instant "Buy Now" flow?
**Answer:**
- **Cart Checkout**: User adds items to cart (`cart_items`), opens `CartDrawer`, and checks out multi-item orders.
- **Buy Now Flow**: User clicks "Buy Now" on `ProductCard`. Instantiates `BuyNowModal.jsx` bypassing cart storage, allowing immediate location detection and Razorpay payment checkout for that single item.

---

### Q20: How is Favorites/Wishlist state synchronized across components?
**Answer:**
`Navbar.jsx`, `ProductCard.jsx`, and `FavoritesDrawer.jsx` share wishlist state. Toggling heart icon calls `shopService.toggleFavorite(productId)`. Upon response, updates local state array and recalculates badge count in `Navbar`.

---

### Q21: How does `ToastNotification.jsx` render auto-dismissing toast alerts?
**Answer:**
Receives `toast` prop (`{ type, title, message }`). Mounted `useEffect` sets a 4-second `setTimeout` calling `onClose()`. Displays fixed top-right alert box with CSS slide-in keyframe animations.

---

### Q22: How does `ProductImage.jsx` handle broken image URLs gracefully?
**Answer:**
Wraps standard `<img>` with `onError` event handler:
```javascript
const [imageError, setImageError] = useState(false);
if (imageError || !src) return <DefaultMedicalSvgPlaceholder />;
return <img src={src} onError={() => setImageError(true)} alt={alt} />;
```
If image fails to load, renders styled medical SVG placeholder.

---

### Q23: How does `CategoryProductsPage.jsx` handle dynamic route params?
**Answer:**
Uses React Router `useParams()` to extract category ID (`/category/:id`). `useEffect` triggers `shopService.getProductsByCategory(id)` whenever `id` changes, updating catalog state and page titles dynamically.

---

### Q24: How is real-time catalog search implemented in `Navbar.jsx` and `ProductGrid.jsx`?
**Answer:**
`Navbar` maintains search query state. As user types, updates query param (`?search=term`). `ProductGrid` filters products using `Array.prototype.filter()` matching `name` or `description` containing query string.

---

### Q25: How does `PdfUploadModal.jsx` handle medical prescription uploads?
**Answer:**
Opens when prescription-required medicines are ordered. Uses HTML5 `FileReader` API validating file extensions (`.pdf`, `.jpg`, `.png`) and max size (5MB). Encodes file preview and attaches payload before order completion.

---

## 5. DESIGN SYSTEM, STYLING & ANIMATIONS

### Q26: What CSS custom properties (variables) define the design system in `index.css`?
**Answer:**
```css
:root {
  --primary: #059669;        /* Emerald Green */
  --primary-hover: #047857;
  --dark-slate: #0f172a;     /* Slate Heading */
  --bg-card: #ffffff;
  --text-muted: #64748b;
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```
Centralizes color tokens across light/dark themes.

---

### Q27: How is Glassmorphism implemented in CSS?
**Answer:**
```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}
```
Combines backdrop blur, translucent background, subtle border, and depth elevation shadows.

---

### Q28: How are Lucide React vector icons integrated across components?
**Answer:**
Imports named icons (`Pill`, `Stethoscope`, `ShoppingBag`, `ShieldCheck`, `Truck`, `MapPin`, `Search`, `Heart`) from `lucide-react`. Renders icons as dynamic SVGs with customized `size`, `color`, and `strokeWidth` props.

---

### Q29: How does Framer Motion enhance UI micro-interactions?
**Answer:**
Wraps modals and cards in `<motion.div>`:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
>
```
Provides smooth spring animations for modal overlays, drawer slides, and button hovers.

---

### Q30: How are CSS Keyframe animations used in `index.css`?
**Answer:**
Defines keyframe animations:
- `@keyframes pulseGlow`: Pulsing indicator lights for live order tracking.
- `@keyframes shimmer`: Loading skeleton animations for product grids.
- `@keyframes slideInRight`: Smooth entrance for `CartDrawer` and `ToastNotification`.

---

## 6. ADMIN DASHBOARD & ADVANCED UI

### Q31: How is the Admin Dashboard UI (`AdminDashboard.jsx`) structured?
**Answer:**
Renders fixed left sidebar navigation and dynamic content panel:
- **Sidebar Tabs**: Overview Stats, Medicines/Products, Categories, Users, Orders, Inventory, Reports, Audit Logs.
- **Analytics Cards**: Key performance indicators (Revenue, Order counts, User counts, Low stock alerts).
- **Data Tables**: Paginated administrative tables with action buttons (Edit, Delete, Role Toggle, Status Switch).

---

### Q32: How does `AdminProducts.jsx` manage medicine creation and updates?
**Answer:**
Renders product table and modal form (`ProductModal`). Form handles inputs (Name, Generic Name, Brand, Price, Discount Price, Stock, Expiry Date, Prescription Checkbox, Image URL). Sends payload to `adminService.createMedicine()` or `updateMedicine()`.

---

### Q33: How does `AdminUsers.jsx` manage user roles and status toggles?
**Answer:**
Lists users in data table. Renders dropdown selectors for Role (`CUSTOMER` / `ADMIN`) and Status (`ACTIVE` / `INACTIVE` / `BLOCKED`). Selecting a new value triggers `adminService.updateUserRole()` or `updateUserStatus()`.

---

### Q34: How does `AdminOrders.jsx` handle status updates for customer orders?
**Answer:**
Displays orders with current status badges. Provides status dropdown (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). Selecting a status calls `adminService.updateOrderStatus()`, updating backend DB and customer order tracking in real time.

---

### Q35: How does `TrackOrderPage.jsx` render the customer visual order tracking stepper?
**Answer:**
Calculates active step index based on order status:
1. `ORDERED` (Step 1) $\rightarrow$ 2. `PAID`/`CONFIRMED` (Step 2) $\rightarrow$ 3. `PACKED` (Step 3) $\rightarrow$ 4. `OUT_FOR_DELIVERY` (Step 4) $\rightarrow$ 5. `DELIVERED` (Step 5).
Renders progress line bar and step icons, coloring active steps in emerald green.

---

### Q36: How does `AdminReports.jsx` handle CSV report downloads?
**Answer:**
Renders export report buttons (Sales Report, Inventory Report, User Report). Clicking button invokes `adminService.exportReport(type)`, receiving blob binary data, creating temporary URL (`URL.createObjectURL(blob)`), and triggering browser file download.

---

### Q37: How does `AdminDashboard.jsx` display audit logs?
**Answer:**
Calls `adminService.getAuditLogs()`. Renders top 50 audit logs table showing Timestamp, Performing Admin Email, Action Type, Module, and Description.

---

### Q38: How does `AdminLogin.jsx` enforce administrator access checks on login?
**Answer:**
After successful `/api/auth/login` call, parses returned user profile. Asserts `userProfile.role === 'ADMIN'`. If non-admin, displays error *"Access Denied. Administrator privileges required"* and prevents dashboard redirect.

---

### Q39: How does `ChangePassword.jsx` manage password updates?
**Answer:**
Renders form for `currentPassword`, `newPassword`, `confirmPassword`. Validates `newPassword === confirmPassword` and length $\ge 6$. Submits payload to `/api/auth/change-password` with Bearer auth header.

---

### Q40: How does `ForgotPassword.jsx` handle multi-step password recovery?
**Answer:**
Multi-step state wizard:
- **Step 1**: Submits email to get 6-digit OTP via email.
- **Step 2**: Enters 6-digit OTP to verify code.
- **Step 3**: Enters new password to complete reset.

---

## 7. FORM HANDLING, PERFORMANCE & BEST PRACTICES

### Q41: How are controlled form inputs managed in React?
**Answer:**
Form inputs bind `value` to state and update via `onChange`:
```jsx
const [email, setEmail] = useState('');
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
```
Ensures React state remains single source of truth.

---

### Q42: How are React Error Boundaries implemented to catch runtime crashes?
**Answer:**
Class component implementing `componentDidCatch(error, errorInfo)` and `static getDerivedStateFromError()`. Catches unhandled JS errors in child component trees and renders fallback recovery UI instead of blank white screen.

---

### Q43: What code-splitting techniques optimize bundle sizes in Vite?
**Answer:**
Uses React `lazy()` and `Suspense`:
```javascript
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
<Suspense fallback={<BrandLoader />}>
  <AdminDashboard />
</Suspense>
```
Splits admin code into separate JS chunks loaded only when accessing admin routes.

---

### Q44: How are `useCallback` and `useMemo` used for performance tuning?
**Answer:**
- `useCallback`: Memoizes handler functions passed to child components to prevent unnecessary re-renders.
- `useMemo`: Memoizes expensive computations (e.g. total cart price calculations, filtered product lists).

---

### Q45: How does `useEffect` cleanup prevent memory leaks?
**Answer:**
Returns cleanup function inside `useEffect`:
```javascript
useEffect(() => {
  const timer = setTimeout(() => setToast(null), 4000);
  return () => clearTimeout(timer); // Cleans up timer on unmount
}, []);
```
Cancels pending timers, subscriptions, and event listeners when components unmount.

---

### Q46: How are accessibility (a11y) standards enforced?
**Answer:**
Uses semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), `aria-label` attributes on icon buttons, form `<label>` associations, and high-contrast color text tokens.

---

### Q47: How is responsive web design achieved across desktop, tablet, and mobile viewports?
**Answer:**
Uses CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`), Flexbox responsive wrapping, and CSS `@media (max-width: 768px)` queries adjusting drawer widths and navigation layouts.

---

### Q48: How does `Navbar.jsx` manage badge counters for cart and wishlist items?
**Answer:**
Reads `cartItems` and `favorites` array state. Renders absolute-positioned badge counter badges over cart and wishlist icons if array length $> 0$.

---

### Q49: How are page title tags updated dynamically across routes?
**Answer:**
`useEffect` updates `document.title` on route changes:
```javascript
useEffect(() => {
  document.title = "Sanjeevani - Healthcare & Medical E-Commerce";
}, []);
```

---

### Q50: How is the application prepared for production deployment?
**Answer:**
1. Runs `npm run build` triggering Vite Rollup minification.
2. Generates optimized, code-split static assets in `dist/` directory.
3. Serves `dist/` assets via Nginx or Vercel with single-page app fallback routing (`try_files $uri /index.html`).

---

# ⚙️ PART 2: TOP 50 BACKEND TECHNICAL INTERVIEW QUESTIONS & ANSWERS

## 1. SPRING BOOT & ARCHITECTURE

### Q1: What is the overall backend architecture of the Sanjeevani platform, and how are responsibilities partitioned across layers?
**Answer:**
The backend uses **Java 17** and **Spring Boot 3.2.x**, structured in a **Controller-Service-Repository-Entity-DTO** architectural pattern:
1. **Controller Layer (`com.ecommerce.auth.controller`)**: Exposes RESTful HTTP endpoints, extracts request parameters, validates DTO payloads, and delegates business operations to services.
2. **Service Layer (`com.ecommerce.auth.service`)**: Contains business domain logic (authentication, payment signature verification, stock management, reverse geocoding, order tracking).
3. **Repository Layer (`com.ecommerce.auth.repository`)**: Inherits `JpaRepository`, abstracting SQL execution with parameterized JPA queries.
4. **Entity Layer (`com.ecommerce.auth.entity`)**: Defines relational database table mappings (`User`, `Product`, `Order`, `Payment`, `AuditLog`).
5. **Security & Config Layer (`com.ecommerce.auth.config`, `filter`)**: Manages stateless JWT filters, CORS rules, rate limiting, and password hashing.

---

### Q2: How does Spring Security 6 handle stateless JWT-based authentication in `SecurityConfig`?
**Answer:**
Spring Security 6 enforces stateless authentication by configuring `SessionCreationPolicy.STATELESS` inside `SecurityFilterChain`:
```java
http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
```
Spring Security does not construct server-side `HttpSession` objects. A custom `JwtAuthenticationFilter` intercepts incoming HTTP requests, extracts the JWT from the `Authorization: Bearer <token>` header, parses claims, verifies cryptographic signatures via `Keys.hmacShaKeyFor(secretBytes)`, and populates `SecurityContextHolder.getContext().setAuthentication(auth)` statelessly for downstream controllers.

---

### Q3: How is Servlet context path stripping handled when `server.servlet.context-path=/api` is configured?
**Answer:**
When `server.servlet.context-path=/api` is specified in `application.properties`, the servlet container strips `/api` before passing the URI path to Spring Security filters. Request matchers in `SecurityFilterChain` must be declared relative to the stripped root context:
```java
.requestMatchers("/auth/login", "/auth/register", "/categories", "/products").permitAll()
```
While clients send HTTP requests to `http://localhost:8080/api/auth/login`, Spring Security evaluates `/auth/login`.

---

### Q4: Why did Spring Security 6 replace `.authorizeRequests()` with `.authorizeHttpRequests()`, and how are path matchers evaluated?
**Answer:**
Spring Security 6 deprecated `.authorizeRequests()` in favor of `.authorizeHttpRequests()`, which uses `AuthorizationManager` rather than `AccessDecisionManager`. Request matchers evaluate wildcards strictly: `.requestMatchers("/categories/**")` matches subpaths (`/categories/1`), but does **NOT** match root path `/categories`. Both exact paths (`/categories`) and wildcard paths (`/categories/**`) must be explicitly declared in `.permitAll()`.

---

### Q5: Why is CORS configured centrally in `SecurityFilterChain` rather than relying solely on `@CrossOrigin` controller annotations?
**Answer:**
Spring Security filters execute **BEFORE** Spring MVC dispatches requests to `@CrossOrigin` controllers. Browser cross-origin preflight `OPTIONS` requests hit Spring Security first. If security CORS is omitted, Spring Security rejects preflights with HTTP 401/403 before Spring MVC evaluates `@CrossOrigin`. Registering central `CorsConfigurationSource` in `SecurityFilterChain` guarantees preflights return HTTP 200 with appropriate CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`).

---

## 2. AUTHENTICATION, SECURITY & JWT

### Q6: Trace the step-by-step filter execution inside `JwtAuthenticationFilter` (`OncePerRequestFilter`).
**Answer:**
1. Intercepts request via `doFilterInternal(request, response, filterChain)`.
2. Checks for `Authorization` header starting with `Bearer `.
3. Extracts token string and parses claims using `JwtService.extractEmail(token)`.
4. Verifies `SecurityContextHolder.getContext().getAuthentication()` is null.
5. Loads `User` from `UserRepository` and asserts account status is `ACTIVE`.
6. Constructs `UsernamePasswordAuthenticationToken` with authorities (`ROLE_USER` / `ROLE_ADMIN`).
7. Stores token in `SecurityContextHolder` and calls `filterChain.doFilter(request, response)`.

---

### Q7: How does `BCryptPasswordEncoder(12)` secure user passwords against rainbow table and brute-force attacks?
**Answer:**
`BCryptPasswordEncoder` uses Blowfish adaptive hashing with a 128-bit random salt and cost factor 12 ($2^{12} = 4,096$ hashing rounds). The random salt ensures identical passwords yield unique hashes, eliminating rainbow table lookups. Cost factor 12 slows brute-force cracking attempts while maintaining low verification latency (<100ms) for legitimate logins.

---

### Q8: How is the JWT token lifecycle (generation, signing, expiration) managed in `JwtService`?
**Answer:**
`JwtService` generates tokens using `io.jsonwebtoken` (JJWT 0.11.5):
1. **Signing**: Tokens are signed with HMAC SHA-256 using `Keys.hmacShaKeyFor(secretBytes)`.
2. **Claims**: Encapsulates `subject` (user email), `issuedAt`, `expiration` (24 hours), and custom claims (`role`, `userId`).
3. **Validation**: Checks token signature against secret key and asserts `expiration` timestamp is after `new Date()`.

---

### Q9: How does `RateLimitConfig` prevent brute-force attacks on authentication endpoints?
**Answer:**
`RateLimitConfig` implements an in-memory sliding window rate limiter tracking request timestamps per client IP address (`request.getRemoteAddr()`):
- **Login Rate Limit**: Max 10 attempts per 15 minutes per IP.
- **OTP Rate Limit**: Max 3 requests per 10 minutes per IP.
If limits are exceeded, it throws `AuthException`, returning HTTP 429 Too Many Requests.

---

### Q10: How does the application protect against OWASP Top 10 vulnerabilities?
**Answer:**
1. **SQL Injection**: Prevented by Spring Data JPA / Hibernate parameterized queries.
2. **Broken Authentication**: Secured via BCrypt hashing and signed 24-hour JWT tokens.
3. **XSS**: Inputs are sanitized, and React automatically escapes JSX variables.
4. **CSRF**: Disabled because authentication is stateless JWT in headers rather than session cookies.
5. **CORS Misconfiguration**: Enforced centrally in `SecurityFilterChain` with explicit origin patterns.

---

## 3. CONTROLLER, SERVICES & BUSINESS LOGIC

### Q11: Trace the execution flow of user registration (`POST /api/auth/register`).
**Answer:**
1. Client POSTs DTO payload (`name`, `email`, `password`, `phoneNumber`).
2. Controller triggers `@Valid` Jakarta Bean Validation.
3. `AuthService.register()` queries `UserRepository.findByEmail()`; throws exception if email exists.
4. Encrypts password using `passwordEncoder.encode(rawPassword)`.
5. Saves new `User` entity with `Role.CUSTOMER` and `accountStatus = "ACTIVE"`.
6. Returns `ApiResponse.success("User registered successfully")`.

---

### Q12: Trace the execution flow of user login (`POST /api/auth/login`).
**Answer:**
1. Client POSTs `email` and `password`.
2. `RateLimitConfig` validates IP rate limit.
3. `AuthService.login()` fetches `User` by email; throws `AuthException` if missing.
4. Asserts `passwordEncoder.matches(rawPassword, user.getPassword())`.
5. Asserts `accountStatus.equals("ACTIVE")`.
6. Generates JWT token via `JwtService.generateToken()`.
7. Returns `LoginResponse` containing token and `UserProfile` DTO.

---

### Q13: How does the OTP password reset workflow operate across `OtpService` and `EmailService`?
**Answer:**
1. User submits email (`/auth/forgot-password`).
2. `OtpService` generates 6-digit numeric code via `SecureRandom`.
3. Saves `Otp` entity with email, code, and 10-minute expiry timestamp.
4. `EmailService` sends formatted HTML email.
5. User verifies code (`/auth/verify-otp`); backend checks code and expiration.
6. User resets password (`/auth/reset-password`); updates BCrypt hash and purges OTP.

---

### Q14: How is multi-criteria product search and category filtering implemented in `ProductService`?
**Answer:**
`ProductService.getProducts(categoryId, searchQuery)` queries `ProductRepository`:
- If `categoryId` is present: executes `findByCategoryCategoryId(categoryId)`.
- If `searchQuery` is present: executes `findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query)`.
- Combines criteria to return filtered product catalogs.

---

### Q15: How does the Category Fallback Resolver work in `CategoryController`?
**Answer:**
If database category tables are unseeded or empty, `CategoryController` scans existing `Product` entities, extracts distinct category names, and synthesizes fallback `Category` DTO objects dynamically. This prevents blank navigation tabs on the frontend client.

---

### Q16: How is prescription compliance managed for prescription-required medical products?
**Answer:**
`Product` entity contains `Boolean prescriptionRequired`. When customers order prescription medicines:
1. `OrderService` verifies if items require a prescription.
2. Asserts prescription attachment presence.
3. If missing, throws `AuthException` blocking order checkout until verified.

---

### Q17: How is administrative authorization enforced in `AdminController`?
**Answer:**
Every admin endpoint calls `verifyAdmin(userId)`:
```java
private User verifyAdmin(Integer userId) {
    if (userId == null) throw new AuthException("Unauthorized.");
    User user = userRepository.findById(userId).orElseThrow(...);
    if (user.getRole() != Role.ADMIN) throw new AuthException("Access Denied.");
    return user;
}
```
If `user.getRole()` is not `ADMIN`, it throws `AuthException` returning HTTP 401/403.

---

### Q18: How does `logAdminAction()` track administrative mutations in `audit_logs`?
**Answer:**
When an admin creates/edits a product, updates user roles, or modifies order statuses, `AdminController` invokes:
```java
logAdminAction(adminUser, "UPDATE_ORDER_STATUS", "ORDER", "Updated order " + id + " to " + status);
```
This saves an `AuditLog` entity recording performing admin email, action type, module, details, and current timestamp.

---

### Q19: How does `AdminController.exportReport()` stream dynamic CSV reports?
**Answer:**
1. Accepts `type` parameter (`sales`, `inventory`, `user`).
2. Constructs CSV text in a `StringBuilder` with headers and escaped values (`"` $\rightarrow$ `""`).
3. Converts string to `byte[]` array.
4. Returns `ResponseEntity<byte[]>` with headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename=Sanjeevani_report.csv`.

---

### Q20: How does `AdminController` prevent accidental lockout of all admin accounts?
**Answer:**
When demoting or deleting an admin user, `AdminController` executes a safety check:
```java
long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
if (adminCount <= 1) {
    throw new AuthException("Cannot demote or delete the last administrator account.");
}
```
This guarantees at least one active admin account always remains in the system.

---

## 4. DTOs, VALIDATION & EXCEPTION HANDLING

### Q21: Why are DTOs used instead of directly exposing JPA Entities in API contracts?
**Answer:**
1. **Security**: Hides internal database IDs and password hashes.
2. **Performance**: Prevents lazy loading exceptions and circular serialization loops.
3. **Decoupling**: Decouples API schemas from internal database tables.
4. **Validation**: Applies Jakarta Bean Validation annotations directly on input payloads.

---

### Q22: How does `@RestControllerAdvice` in `GlobalExceptionHandler` format validation errors?
**Answer:**
When DTO validation fails, Spring throws `MethodArgumentNotValidException`. `GlobalExceptionHandler` intercepts it:
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Validation failed", errors));
}
```
Returns HTTP 400 Bad Request with field-by-field validation error messages.

---

### Q23: How are custom exceptions (`AuthException`, `ResourceNotFoundException`) mapped to HTTP statuses?
**Answer:**
- `AuthException`: Mapped to HTTP 401 Unauthorized or HTTP 403 Forbidden with `ApiResponse.error(ex.getMessage())`.
- `ResourceNotFoundException`: Mapped to HTTP 404 Not Found.
- `Exception`: Mapped to HTTP 500 Internal Server Error while logging full trace server-side.

---

### Q24: How does the application handle bi-directional JSON circular references?
**Answer:**
Prevented by:
1. Converting Entities to DTOs where child DTOs do not reference parent objects.
2. Annotating entity fields with `@JsonIgnore`.
3. Using `@JsonManagedReference` on parent and `@JsonBackReference` on child.

---

### Q25: How does the backend prevent `LazyInitializationException` outside transactions?
**Answer:**
Maps entity instances to DTOs inside `@Transactional` service methods while Hibernate database session is open, returning fully populated DTOs to controllers.

---

## 5. PAYMENT GATEWAY (RAZORPAY INTEGRATION)

### Q26: Trace the 3-step Razorpay payment workflow in Sanjeevani.
**Answer:**
1. **Order Creation (Server)**: Client requests order checkout. `RazorpayService` calls `RazorpayClient.orders.create()` returning `razorpay_order_id`.
2. **Client Checkout (Frontend)**: React client opens Razorpay checkout JS modal with `order_id` and amount.
3. **Signature Verification (Server)**: Client sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/verify`. Backend verifies HMAC SHA-256 signature before marking order `PAID`.

---

### Q27: How does `RazorpayService.createOrder()` calculate amounts for Razorpay?
**Answer:**
Razorpay expects amounts in minimum currency subunits (paise for INR):
```java
BigDecimal amountInRupees = order.getTotalAmount();
long amountInPaise = amountInRupees.multiply(new BigDecimal("100")).longValue();
```
Sets `amount` in Razorpay JSON request to `amountInPaise`.

---

### Q28: How is HMAC SHA-256 signature verification executed pin-to-pin?
**Answer:**
1. Constructs string: `razorpay_order_id + "|" + razorpay_payment_id`.
2. Computes HMAC SHA-256 signature using API Key Secret.
3. Compares calculated hex string against received `razorpay_signature` using `MessageDigest.isEqual()`.
4. Updates order status to `PAID` upon match.

---

### Q29: What happens if Razorpay signature verification fails?
**Answer:**
If signatures do not match, `PaymentController` throws `AuthException("Payment verification failed. Invalid signature.")`, marks order status `FAILED`, and logs security alert.

---

### Q30: How are Cash on Delivery (COD) orders processed differently from Razorpay orders?
**Answer:**
For COD orders, server bypasses Razorpay SDK calls, sets `paymentMethod = "COD"`, marks status `CONFIRMED`, creates order record, and clears cart immediately.

---

## 6. DATABASE, JPA & TRANSACTIONS

### Q31: How is Spring Data JPA configured for MySQL 8.0 in production vs H2 for dev/testing?
**Answer:**
Configured via Spring profiles in `application.properties`:
- **MySQL 8.0**: Driver `com.mysql.cj.jdbc.Driver`, Dialect `MySQL8Dialect`, URL `jdbc:mysql://localhost:3306/ecommerce_db`.
- **H2 In-Memory**: Driver `org.h2.Driver`, URL `jdbc:h2:mem:testdb`, Console enabled at `/h2-console`.

---

### Q32: Detail the column schema and constraints of the `users` table.
**Answer:**
- `userId` / `id`: `BIGINT`, Primary Key, Auto Increment.
- `fullName`: `VARCHAR(255)`, Not Null.
- `email`: `VARCHAR(255)`, Unique, Not Null.
- `password`: `VARCHAR(255)`, Not Null (BCrypt hash).
- `phoneNumber`: `VARCHAR(20)`.
- `role`: `VARCHAR(50)`, Default `'ROLE_USER'`.
- `accountStatus`: `VARCHAR(50)`, Default `'ACTIVE'`.
- `createdAt`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.

---

### Q33: Detail the column schema and constraints of the `products` table.
**Answer:**
- `productId` / `id`: `BIGINT`, Primary Key, Auto Increment.
- `name`: `VARCHAR(255)`, Not Null.
- `genericName`: `VARCHAR(255)`.
- `brand`: `VARCHAR(255)`.
- `description`: `TEXT`.
- `price`: `DECIMAL(10,2)`, Not Null.
- `stock`: `INT`, Default 100.
- `categoryId`: `BIGINT`, Foreign Key (`categories.categoryId`).
- `prescriptionRequired`: `BOOLEAN`, Default `false`.

---

### Q34: Detail the column schema of `orders` and `order_items` tables.
**Answer:**
- `orders`: `order_id` (PK String), `user_id` (FK), `total_amount`, `status` (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `shipping_address`, `created_at`.
- `order_items`: `id` (PK), `order_id` (FK), `product_id` (FK), `quantity`, `price_per_unit`, `total_price`.

---

### Q35: How does `@Transactional` guarantee ACID compliance in `OrderService.createOrder()`?
**Answer:**
Annotated with `@Transactional`. If stock reduction, order insertion, item creation, or cart purging fails midway, Spring Data JPA automatically rolls back all executed SQL statements, keeping inventory and database state atomic.

---

### Q36: What database indexing strategies are used in MySQL for search optimization?
**Answer:**
1. **Clustered Indexes**: Automatic B-Tree indexes on Primary Keys.
2. **Unique Indexes**: `users(email)` (fast authentication lookup) and `orders(order_id)` (fast tracking lookup).
3. **Foreign Key Indexes**: `products(category_id)`, `order_items(order_id)`, and `cart_items(user_id)` to optimize JOIN queries.

---

### Q37: How do `FetchType.LAZY` and `FetchType.EAGER` differ in JPA?
**Answer:**
- `FetchType.LAZY`: Defers loading related entity collections until explicitly accessed. Prevents heavy N+1 queries.
- `FetchType.EAGER`: Immediately joins and loads associated entities upon parent query. Used for single mandatory relationships.

---

### Q38: How does `CascadeType.ALL` with `orphanRemoval = true` work on `Order.items`?
**Answer:**
- `CascadeType.ALL`: Propagates operations (`PERSIST`, `MERGE`, `REMOVE`) from `Order` to `OrderItem`. Saving an order automatically saves its items.
- `orphanRemoval = true`: Deleting an item from `order.getItems()` collection automatically issues a SQL `DELETE` for that `OrderItem` row in database.

---

### Q39: How does `ProductSeeder` initialize database records on startup?
**Answer:**
Implements `CommandLineRunner`. Checks if `categoryRepository.count() == 0` and `productRepository.count() == 0`. If empty, inserts initial healthcare categories and products; if data exists, skips seeding to preserve modifications.

---

### Q40: What is the purpose of `schema_reset.sql` in backend resources?
**Answer:**
Provides SQL statements to drop and recreate database tables during development testing, ensuring a clean schema state when running integration test suites.

---

## 7. ADVANCED TOPICS & PERFORMANCE

### Q41: How is memory-efficient pagination and sorting implemented for product catalogs?
**Answer:**
Uses Spring Data JPA `Pageable` requests: `PageRequest.of(page, size, Sort.by("price").ascending())`. Returns `Page<Product>` containing total pages, total elements, and sublist data.

---

### Q42: How does the system handle high-concurrency stock updates?
**Answer:**
Uses optimistic locking via JPA `@Version` on `Product` entity or pessimistic database row locking (`SELECT FOR UPDATE`) during checkout stock reduction to prevent overselling.

---

### Q43: How is inventory summary analytics calculated efficiently in `AdminController`?
**Answer:**
Uses single-pass iteration or JPQL aggregate queries (`COUNT`, `SUM`) grouping product stock levels into available, low stock (<10), out of stock (0), and expired counts.

---

### Q44: How are audit logs queried with performance bounds?
**Answer:**
`AuditLogRepository` defines `findTop50ByOrderByCreatedAtDesc()`, retrieving only the 50 most recent audit log entries using SQL `LIMIT 50`.

---

### Q45: What is the role of `RateLimitConfig` in protecting system resources?
**Answer:**
Prevents Denial of Service (DoS) and brute-force attacks by limiting API invocation frequency per IP address using sliding window algorithms.

---

### Q46: How does the application sanitize input text to prevent SQL Injection and XSS?
**Answer:**
1. SQL Injection: Handled by Hibernate parameterized queries (JDBC `PreparedStatement`).
2. XSS: Input strings are trimmed, HTML characters escaped, and validated via Jakarta Bean Validation.

---

### Q47: How does `PasswordEncoder` verify passwords during authentication?
**Answer:**
`passwordEncoder.matches(rawPassword, encodedPassword)` extracts the salt embedded in the stored BCrypt hash, re-hashes the raw password with that salt, and compares hash strings in constant time to prevent timing attacks.

---

### Q48: How are user sessions invalidated upon logout?
**Answer:**
Since JWT authentication is stateless, `authService.logout(token)` invalidates client sessions by clearing client tokens and optionally adding tokens to a Redis/in-memory blacklist until expiration.

---

### Q49: How does the backend support CORS preflight caching?
**Answer:**
`CorsConfiguration.setMaxAge(3600L)` sets `Access-Control-Max-Age: 3600` in preflight responses, allowing browsers to cache preflight decisions for 1 hour.

---

### Q50: How is the application prepared for cloud deployment (Docker / AWS)?
**Answer:**
Externalizes configuration using environment variables in `application.properties` (`${DB_URL}`, `${JWT_SECRET}`), packaged as a standalone executable JAR (`mvn clean package`), ready for Docker containerization.
