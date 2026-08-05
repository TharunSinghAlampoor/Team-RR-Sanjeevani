# Sanjeevani Healthcare E-Commerce Platform — Top 50 Frontend Technical Interview Questions & Answers

This document contains **50 comprehensive, pin-to-pin frontend technical interview questions and answers** based on the production codebase of the **Sanjeevani Healthcare E-Commerce Platform** (JavaScript ES6+, React 18, Vite 8, React Router 6, Context API, Axios, OpenStreetMap Nominatim Geolocation, and CSS Glassmorphism).

---

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

### Q14: How does `CheckoutModal.jsx` handle the Razorpay payment payment flow?
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
