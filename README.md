# Full-Stack User Authentication System

A production-ready User Authentication System featuring a React frontend (Vite 6 + CSS) and a Spring Boot 4.1.0 backend (Java 21 + Spring Security 7.x + JWT) backed by MySQL.

---

## Features

1. **User Registration**: Real-time validation, password strength checker, mobile number verification with country codes, and unique field checks (Email, Phone, Password).
2. **Secure Login**: Session-based JWT token generation with 60-minute expiry.
3. **Session Management**: Server-side tracking in a `sessions` table. Soft-invalidation on logout, reset, or password changes.
4. **Forgot & Reset Password**: Multi-step flow involving OTP generation (saved in `otps` table) and verification before permitting password reset.
5. **Change Password**: Verified update (requires correct current password) which triggers immediate session termination.
6. **JWT Filtering**: Intercepts and shields protected endpoints with a custom security filter.
7. **Rate Limiting**: Brute-force protection on Login and OTP request endpoints.

---

## Tech Stack & Versions
- **Frontend**: React 18.3, Vite 6.x, Axios, React Router v7
- **Backend**: Spring Boot 4.1.0, Spring Security 7.x (Ships with Boot 4.1), Spring Data JPA
- **Database**: MySQL 8.4 LTS
- **Build & Compilers**: Java 21, Maven 3.9.x, Node.js 24.x

---

## Prerequisites

1. **MySQL Database**:
   Create a database schema named `E-Commerce` on your local MySQL server:
   ```sql
   CREATE DATABASE `E-Commerce`;
   ```

2. **Environment Variables**:
   By default, the backend looks for the environment variable `JWT_SECRET`. If not set, it will fallback to a default secure developer key:
   - Variable Name: `JWT_SECRET`
   - Example Value (min 256 bits): `c3VwZXJTZWNyZXRLZXlGb3JFQ29tbWVyY2VBdXRoU2VydmljZTIwMjZQcm9kdWN0aW9uUmVhZHk=`

---

## How to Run

### 1. Run the Backend (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run:
   ```bash
   mvn spring-boot:run
   ```
The backend will launch at `http://localhost:8080` with context path `/api`. The tables `users`, `sessions`, and `otps` will be created automatically in the `E-Commerce` schema on startup.

### 2. Run the Frontend (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
The frontend will launch at `http://localhost:5173`.

---

## Developer OTP Notice
Since this is a standalone local deployment, OTPs generated in the Forgot Password flow are:
1. Printed to the backend Console.
2. Returned in the `/forgot-password` API response under `data.otp` for developer testing convenience.
