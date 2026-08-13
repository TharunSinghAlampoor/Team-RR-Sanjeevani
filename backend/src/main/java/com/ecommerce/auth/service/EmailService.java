package com.ecommerce.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:tharunsingh851@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:wrfrtpyfnwjfufhv}")
    private String mailPassword;

    private JavaMailSender createSmtpsMailSender() {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost("smtp.gmail.com");
        impl.setPort(465);
        impl.setUsername(mailUsername != null && !mailUsername.isBlank() ? mailUsername : "tharunsingh851@gmail.com");
        impl.setPassword(mailPassword != null && !mailPassword.isBlank() ? mailPassword : "wrfrtpyfnwjfufhv");
        impl.setProtocol("smtps");

        Properties props = impl.getJavaMailProperties();
        props.put("mail.smtps.auth", "true");
        props.put("mail.smtps.ssl.enable", "true");
        props.put("mail.smtps.ssl.trust", "*");
        props.put("mail.smtps.socketFactory.port", "465");
        props.put("mail.smtps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtps.connectiontimeout", "8000");
        props.put("mail.smtps.timeout", "8000");
        props.put("mail.smtps.writetimeout", "8000");

        return impl;
    }

    private JavaMailSender createSmtpMailSender() {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost("smtp.gmail.com");
        impl.setPort(587);
        impl.setUsername(mailUsername != null && !mailUsername.isBlank() ? mailUsername : "tharunsingh851@gmail.com");
        impl.setPassword(mailPassword != null && !mailPassword.isBlank() ? mailPassword : "wrfrtpyfnwjfufhv");
        impl.setProtocol("smtp");

        Properties props = impl.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.connectiontimeout", "8000");
        props.put("mail.smtp.timeout", "8000");

        return impl;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        String from = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "tharunsingh851@gmail.com";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("Sanjeevani Healthcare - Verification Code: " + otpCode);
        message.setText(
            "Dear User,\n\n" +
            "Your 6-digit verification code for password reset on Sanjeevani Healthcare Portal is:\n\n" +
            "    👉 " + otpCode + " 👈\n\n" +
            "This code is valid for 5 minutes.\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Sanjeevani Healthcare Team"
        );

        // 1. Try SMTPS Port 465 (SSL) - High reliability for Render/cloud environments
        try {
            JavaMailSender smtpsSender = createSmtpsMailSender();
            smtpsSender.send(message);
            logger.info("OTP Email sent SUCCESSFULLY to {} via Gmail SMTPS Port 465 (SSL)", toEmail);
            return;
        } catch (Exception e1) {
            logger.warn("Gmail SMTPS Port 465 failed ({}: {}). Retrying via Gmail SMTP Port 587...", e1.getClass().getSimpleName(), e1.getMessage());
        }

        // 2. Try SMTP Port 587 (TLS) as secondary fallback
        try {
            JavaMailSender smtpSender = createSmtpMailSender();
            smtpSender.send(message);
            logger.info("OTP Email sent SUCCESSFULLY to {} via Gmail SMTP Port 587 (TLS)", toEmail);
            return;
        } catch (Exception e2) {
            logger.error("Gmail SMTP Port 587 failed as well ({}: {}). Email delivery failed on both ports.", e2.getClass().getSimpleName(), e2.getMessage());
        }
    }

    public void sendOrderInvoiceEmail(String toEmail, String orderId, Double totalAmount, String paymentId, String referenceNumber) {
        String recipient = (toEmail != null && !toEmail.isBlank()) ? toEmail : "customer@sanjeevani.com";
        String from = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "tharunsingh851@gmail.com";
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        try {
            createSmtpsMailSender().send(message);
            logger.info("Tax Invoice Email sent successfully to {} via SMTPS Port 465", recipient);
        } catch (Exception e) {
            try {
                createSmtpMailSender().send(message);
                logger.info("Tax Invoice Email sent successfully to {} via SMTP Port 587", recipient);
            } catch (Exception e2) {
                logger.error("Failed to send Tax Invoice Email to {}: {}", recipient, e2.getMessage());
            }
        }
    }
}
