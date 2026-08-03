package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.entity.JwtToken;
import com.ecommerce.auth.entity.Role;
import com.ecommerce.auth.entity.Session;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.JwtTokenRepository;
import com.ecommerce.auth.repository.SessionRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.util.ValidationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final int sessionExpiryMinutes;

    public AuthService(
            UserRepository userRepository,
            SessionRepository sessionRepository,
            JwtTokenRepository jwtTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService,
            @Value("${session.expiry-minutes:60}") int sessionExpiryMinutes) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.sessionExpiryMinutes = sessionExpiryMinutes;
    }

    @Transactional
    public ApiResponse<Object> register(RegisterRequest request) {
        if (!ValidationUtil.isValidFullName(request.getFullName())) {
            throw AuthException.badRequest("Full name must be between 2 and 100 characters");
        }

        if (!ValidationUtil.isValidEmail(request.getEmail())) {
            throw AuthException.badRequest("Please provide a valid email address");
        }

        if (!ValidationUtil.isValidPassword(request.getPassword())) {
            throw AuthException.badRequest("Password must be at least 8 characters");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw AuthException.badRequest("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw AuthException.conflict("An account with this email already exists");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
                throw AuthException.conflict("An account with this phone number already exists");
            }
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        String phone = (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty())
                ? request.getPhoneNumber().trim()
                : null;

        User user = new User(
                request.getFullName().trim(),
                request.getEmail().toLowerCase().trim(),
                phone,
                passwordEncoder.encode(request.getPassword()),
                userRole
        );

        userRepository.save(user);
        logger.info("User registered successfully: {}", user.getEmail());

        return ApiResponse.success("Registration successful! You can now log in.");
    }

    @Transactional
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        Optional<User> userOpt = userRepository.findByEmailOrPhoneNumber(
                identifier.toLowerCase(),
                identifier
        );

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw AuthException.unauthorized("Invalid credentials. Please check your email/phone and password.");
        }

        User user = userOpt.get();

        String token = jwtService.generateToken(user.getUserId(), user.getEmail());

        LocalDateTime loginTime = LocalDateTime.now();
        LocalDateTime expiryTime = loginTime.plusMinutes(sessionExpiryMinutes);
        Session session = new Session(user, token, loginTime, expiryTime);
        sessionRepository.save(session);

        // Save JWT token in database
        JwtToken jwtTokenEntity = new JwtToken(user, token, expiryTime);
        jwtTokenRepository.save(jwtTokenEntity);

        LoginResponse.UserProfile profile = new LoginResponse.UserProfile(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole()
        );

        LoginResponse response = new LoginResponse(token, jwtService.getExpirationMs(), profile);

        logger.info("User logged in: {}, JWT token saved in database", user.getEmail());
        return ApiResponse.success("Login successful", response);
    }

    @Transactional
    public ApiResponse<Object> logout(String token) {
        sessionRepository.invalidateByToken(token);
        try {
            jwtTokenRepository.deleteByToken(token);
        } catch (Exception e) {
            logger.warn("Deleting JWT token from database failed during logout: {}", e.getMessage());
        }
        logger.info("User logged out, session invalidated, JWT token removed from database");
        return ApiResponse.success("Logged out successfully");
    }

    @Transactional
    public ApiResponse<Object> forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = findUserByIdentifier(identifier);

        otpService.generateAndSaveOtp(user, true);

        // OTP is sent only to registered email via Gmail SMTP - never exposed in API response
        return ApiResponse.success(
                "OTP has been sent to your registered Gmail. Please check your inbox. It expires in 5 minutes."
        );

    }

    @Transactional
    public ApiResponse<Object> verifyOtp(VerifyOtpRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = findUserByIdentifier(identifier);

        boolean verified = otpService.verifyOtp(user, request.getOtp());
        if (!verified) {
            throw AuthException.badRequest("Invalid or expired OTP. Please try again.");
        }

        logger.info("OTP verified for user: {}", user.getEmail());
        return ApiResponse.success("OTP verified successfully. You can now reset your password.");
    }

    @Transactional
    public ApiResponse<Object> resetPassword(ResetPasswordRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = findUserByIdentifier(identifier);

        if (!otpService.hasVerifiedOtp(user)) {
            throw AuthException.badRequest("Please verify your OTP before resetting password");
        }

        if (!ValidationUtil.isValidPassword(request.getNewPassword())) {
            throw AuthException.badRequest("Password must be at least 8 characters");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw AuthException.badRequest("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        try {
            sessionRepository.invalidateAllActiveSessions(user);
            jwtTokenRepository.deleteByUserUserId(user.getUserId());
        } catch (Exception e) {
            logger.warn("Session invalidation during reset password bypassed: {}", e.getMessage());
        }

        logger.info("Password reset for user: {}", user.getEmail());

        return ApiResponse.success("Password has been reset successfully. Please log in with your new password.");
    }

    @Transactional
    public ApiResponse<Object> changePassword(Integer userId, String currentToken, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AuthException.notFound("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw AuthException.badRequest("Current password is incorrect");
        }

        if (!ValidationUtil.isValidPassword(request.getNewPassword())) {
            throw AuthException.badRequest("Password must be at least 8 characters");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw AuthException.badRequest("Passwords do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw AuthException.badRequest("New password cannot be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        sessionRepository.invalidateByToken(currentToken);
        try {
            jwtTokenRepository.deleteByToken(currentToken);
        } catch (Exception e) {
            logger.warn("Deleting JWT token failed during change password: {}", e.getMessage());
        }
        logger.info("Password changed for user: {}. Session invalidated and token removed.", user.getEmail());

        return ApiResponse.success("Password changed successfully. Please log in again.");
    }

    public ApiResponse<LoginResponse.UserProfile> getUserProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AuthException.notFound("User not found"));
        LoginResponse.UserProfile profile = new LoginResponse.UserProfile(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole()
        );
        return ApiResponse.success("Profile retrieved successfully", profile);
    }

    public ApiResponse<List<java.util.Map<String, Object>>> getDevOtps() {
        List<java.util.Map<String, Object>> activeOtps = otpService.getAllActiveOtps();
        return ApiResponse.success("Active OTPs retrieved successfully", activeOtps);
    }

    private User findUserByIdentifier(String identifier) {
        Optional<User> userOpt = userRepository.findByEmailOrPhoneNumber(
                identifier.toLowerCase(),
                identifier
        );
        return userOpt.orElseThrow(() ->
                AuthException.notFound("No account found with this email or phone number"));
    }
}
