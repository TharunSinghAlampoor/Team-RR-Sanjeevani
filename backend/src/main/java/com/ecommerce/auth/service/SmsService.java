package com.ecommerce.auth.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class SmsService {
    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    private boolean isConfigured = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.trim().isEmpty() &&
            authToken != null && !authToken.trim().isEmpty() &&
            twilioPhoneNumber != null && !twilioPhoneNumber.trim().isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                isConfigured = true;
                logger.info("Twilio SMS Service initialized successfully.");
            } catch (Exception e) {
                logger.error("Failed to initialize Twilio: {}", e.getMessage());
            }
        } else {
            logger.warn("Twilio credentials not fully configured. SMS will fallback to console logging.");
        }
    }

    public void sendOtpSms(String toMobileNumber, String otpCode) {
        if (!isConfigured) {
            logger.warn("Twilio is not configured. Falling back to console logging.");
            logger.info("═══════════════════════════════════════════");
            logger.info("  [Console Fallback] OTP SMS for {} : {}", toMobileNumber, otpCode);
            logger.info("═══════════════════════════════════════════");
            return;
        }
        try {
            Message message = Message.creator(
                    new PhoneNumber(toMobileNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    "Sanjeevani Portal: Your OTP for password reset is " + otpCode + ". Valid for 5 minutes."
            ).create();
            logger.info("OTP SMS sent successfully to {}. Message SID: {}", toMobileNumber, message.getSid());
        } catch (Exception e) {
            logger.error("Failed to send OTP SMS to {}: {}", toMobileNumber, e.getMessage());
            logger.info("═══════════════════════════════════════════");
            logger.info("  [Error Fallback] OTP SMS for {} : {}", toMobileNumber, otpCode);
            logger.info("═══════════════════════════════════════════");
        }
    }
}
