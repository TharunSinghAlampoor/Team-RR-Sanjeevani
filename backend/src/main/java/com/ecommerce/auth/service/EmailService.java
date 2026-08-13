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

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:tharunsingh851@gmail.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Falling back to console logging.");
            logger.info("═══════════════════════════════════════════");
            logger.info("  [Console Fallback] OTP Email for {} : {}", toEmail, otpCode);
            logger.info("═══════════════════════════════════════════");
            return;
        }
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail != null && !fromEmail.isBlank() ? fromEmail : "tharunsingh851@gmail.com");
                message.setTo(toEmail);
                message.setSubject("Sanjeevani Healthcare - Password Reset Verification Code (" + otpCode + ")");
                message.setText("Dear User,\n\nYour 6-digit verification code for password reset on Sanjeevani Healthcare Portal is:\n\n   👉 " + otpCode + " 👈\n\nThis code is valid for 5 minutes. If you did not request a password reset, please ignore this email.\n\nBest regards,\nSanjeevani Healthcare Team");
                
                mailSender.send(message);
                logger.info("OTP Email sent successfully to {} via Gmail SMTP", toEmail);
            } catch (Exception e) {
                logger.error("Failed to send OTP Email to {}: {}", toEmail, e.getMessage(), e);
                logger.info("═══════════════════════════════════════════");
                logger.info("  [Error Fallback] OTP Email for {} : {}", toEmail, otpCode);
                logger.info("═══════════════════════════════════════════");
            }
        });
    }

    public void sendOrderInvoiceEmail(String toEmail, String orderId, Double totalAmount, String paymentId, String referenceNumber) {
        String recipient = (toEmail != null && !toEmail.isBlank()) ? toEmail : "customer@sanjeevani.com";
        String subject = "Sanjeevani Healthcare - Official Tax Invoice for Order " + orderId;
        String body = String.format(
            "Dear Customer,\n\n" +
            "Thank you for shopping with Sanjeevani Healthcare!\n" +
            "Here are your invoice details:\n\n" +
            "Order ID: %s\n" +
            "Grand Total: ₹%.2f\n" +
            "Payment ID: %s\n" +
            "Reference Number: %s\n" +
            "Status: PAID / COMPLETED\n\n" +
            "If you have any questions, reach out to support@sanjeevani.com.\n\n" +
            "Best regards,\n" +
            "Sanjeevani Healthcare Team",
            orderId, (totalAmount != null ? totalAmount : 0.0), 
            (paymentId != null ? paymentId : "pay_verified"), 
            (referenceNumber != null ? referenceNumber : "ref_verified")
        );

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Console log invoice email fallback.");
            logger.info("═══════════════════════════════════════════");
            logger.info(" [Console Fallback] Tax Invoice Email sent to {}:\n{}", recipient, body);
            logger.info("═══════════════════════════════════════════");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail != null && !fromEmail.isBlank() ? fromEmail : "tharunsingh851@gmail.com");
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Tax Invoice Email sent successfully to {}", recipient);
        } catch (Exception e) {
            logger.error("Failed to send Tax Invoice Email to {}: {}", recipient, e.getMessage());
        }
    }
}
