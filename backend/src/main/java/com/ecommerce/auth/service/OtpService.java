package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.Otp;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final int otpExpiryMinutes;
    private final int otpLength;

    public OtpService(
            OtpRepository otpRepository,
            EmailService emailService,
            @Value("${otp.expiry-minutes:5}") int otpExpiryMinutes,
            @Value("${otp.length:6}") int otpLength) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.otpExpiryMinutes = otpExpiryMinutes;
        this.otpLength = otpLength;
    }

    public String generateAndSaveOtp(User user, boolean sendViaEmail) {
        String otpCode = generateOtpCode();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusMinutes(otpExpiryMinutes);

        Otp otp = new Otp(user, otpCode, now, expiry);
        otpRepository.save(otp);

        try {
            emailService.sendOtpEmail(user.getEmail(), otpCode);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            // Delete the OTP since the email was never delivered
            otpRepository.delete(otp);
            throw new RuntimeException("Unable to send verification email. Please try again in a moment.", e);
        }

        logger.info("═══════════════════════════════════════════");
        logger.info("  OTP for {} ({}) : {}", user.getFullName(), user.getEmail(), otpCode);
        logger.info("  Expires at: {}", expiry);
        logger.info("═══════════════════════════════════════════");

        return otpCode;
    }


    public boolean verifyOtp(User user, String otpCode) {
        Optional<Otp> otpOpt = otpRepository
                .findTopByUserAndOtpCodeAndVerifiedFalseOrderByGeneratedTimeDesc(user, otpCode);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();

        if (LocalDateTime.now().isAfter(otp.getExpiryTime())) {
            logger.warn("OTP expired for user: {}", user.getEmail());
            return false;
        }

        otp.setVerified(true);
        otpRepository.save(otp);
        return true;
    }

    public boolean hasVerifiedOtp(User user) {
        Optional<Otp> otpOpt = otpRepository
                .findTopByUserAndVerifiedTrueOrderByGeneratedTimeDesc(user);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();
        return LocalDateTime.now().isBefore(otp.getExpiryTime().plusMinutes(10));
    }

    public java.util.List<java.util.Map<String, Object>> getAllActiveOtps() {
        return otpRepository.findAll().stream()
                .filter(otp -> !otp.isVerified() && LocalDateTime.now().isBefore(otp.getExpiryTime()))
                .map(otp -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("email", otp.getUser().getEmail());
                    map.put("fullName", otp.getUser().getFullName());
                    map.put("otpCode", otp.getOtpCode());
                    map.put("expiryTime", otp.getExpiryTime());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private String generateOtpCode() {
        int bound = (int) Math.pow(10, otpLength);
        int code = SECURE_RANDOM.nextInt(bound);
        return String.format("%0" + otpLength + "d", code);
    }
}
