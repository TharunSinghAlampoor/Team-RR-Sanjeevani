package com.ecommerce.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Falling back to console logging.");
            logger.info("═══════════════════════════════════════════");
            logger.info("  [Console Fallback] OTP Email for {} : {}", toEmail, otpCode);
            logger.info("═══════════════════════════════════════════");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@sanjeevani.com");
            message.setTo(toEmail);
            message.setSubject("Sanjeevani Portal - Password Reset OTP");
            message.setText("Dear User,\n\nYour OTP for password reset is: " + otpCode + 
                "\nThis OTP is valid for 5 minutes. Please do not share this OTP with anyone.\n\nBest regards,\nSanjeevani Team");
            
            mailSender.send(message);
            logger.info("OTP Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send OTP Email to {}: {}", toEmail, e.getMessage());
            logger.info("═══════════════════════════════════════════");
            logger.info("  [Error Fallback] OTP Email for {} : {}", toEmail, otpCode);
            logger.info("═══════════════════════════════════════════");
        }
    }
}
