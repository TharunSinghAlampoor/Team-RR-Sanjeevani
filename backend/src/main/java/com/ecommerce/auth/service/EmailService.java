package com.ecommerce.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private JavaMailSender mailSender;

    @Value("${spring.mail.username:tharunsingh851@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:tharunsingh851@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:wrfrtpyfnwjfufhv}")
    private String mailPassword;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Manually create a JavaMailSender if Spring auto-config didn't provide one.
     * This guarantees email works on Render even if auto-config fails.
     */
    private JavaMailSender getOrCreateMailSender() {
        if (mailSender != null) {
            return mailSender;
        }

        // Build a JavaMailSender manually from application.properties values
        logger.info("JavaMailSender was null. Creating manual SMTP sender for host={}, port={}, user={}", mailHost, mailPort, mailUsername);
        JavaMailSenderImpl manual = new JavaMailSenderImpl();
        manual.setHost(mailHost);
        manual.setPort(mailPort);
        manual.setUsername(mailUsername);
        manual.setPassword(mailPassword);
        manual.setProtocol("smtp");

        Properties props = manual.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        // Cache for reuse
        this.mailSender = manual;
        return manual;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        // Send synchronously to guarantee delivery before API response
        try {
            JavaMailSender sender = getOrCreateMailSender();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail != null && !fromEmail.isBlank() ? fromEmail : "tharunsingh851@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Sanjeevani Healthcare - Your Verification Code: " + otpCode);
            message.setText(
                "Dear User,\n\n" +
                "Your 6-digit verification code for Sanjeevani Healthcare Portal is:\n\n" +
                "    " + otpCode + "\n\n" +
                "This code is valid for 5 minutes.\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Sanjeevani Healthcare Team"
            );

            sender.send(message);
            logger.info("OTP Email sent SUCCESSFULLY to {} via Gmail SMTP (host={}, port={})", toEmail, mailHost, mailPort);
        } catch (Exception e) {
            logger.error("FAILED to send OTP Email to {}: {} - {}", toEmail, e.getClass().getSimpleName(), e.getMessage(), e);
        }
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

        try {
            JavaMailSender sender = getOrCreateMailSender();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail != null && !fromEmail.isBlank() ? fromEmail : "tharunsingh851@gmail.com");
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
            logger.info("Tax Invoice Email sent successfully to {}", recipient);
        } catch (Exception e) {
            logger.error("Failed to send Tax Invoice Email to {}: {}", recipient, e.getMessage());
        }
    }
}
