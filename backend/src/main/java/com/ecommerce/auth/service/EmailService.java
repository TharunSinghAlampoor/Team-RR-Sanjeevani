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
        java.util.concurrent.CompletableFuture.runAsync(() -> {
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
            message.setFrom("invoices@sanjeevani.com");
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
