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

    /**
     * Maximum retry attempts per SMTP port before moving to fallback.
     * Render free tier cold-starts can cause the first 1-2 attempts to timeout.
     */
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 2000; // 2 seconds

    static {
        System.setProperty("java.net.preferIPv4Stack", "true");
    }

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
        props.put("mail.smtps.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtps.socketFactory.port", "465");
        props.put("mail.smtps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        // Increased timeouts for Render free tier cold-start (was 8s, now 20s)
        props.put("mail.smtps.connectiontimeout", "20000");
        props.put("mail.smtps.timeout", "20000");
        props.put("mail.smtps.writetimeout", "20000");

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
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        // Increased timeouts for Render free tier cold-start (was 8s, now 20s)
        props.put("mail.smtp.connectiontimeout", "20000");
        props.put("mail.smtp.timeout", "20000");
        props.put("mail.smtp.writetimeout", "20000");

        return impl;
    }

    /**
     * Sends OTP email with retry logic and exponential backoff.
     * Tries SMTPS (465) first with retries, then falls back to SMTP (587) with retries.
     * Throws RuntimeException if ALL attempts fail so the API returns an error to the user.
     */
    public void sendOtpEmail(String toEmail, String otpCode) {
        String from = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "tharunsingh851@gmail.com";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("Sanjeevani Healthcare - Verification Code: " + otpCode);
        message.setText(
            "Dear User,\n\n" +
            "Your 6-digit verification code for password reset on Sanjeevani Healthcare Portal is:\n\n" +
            "    \uD83D\uDC49 " + otpCode + " \uD83D\uDC48\n\n" +
            "This code is valid for 5 minutes.\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Sanjeevani Healthcare Team"
        );

        Exception lastException = null;

        // 1. Try SMTPS Port 465 (SSL) with retries
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                JavaMailSender smtpsSender = createSmtpsMailSender();
                smtpsSender.send(message);
                logger.info("OTP Email sent SUCCESSFULLY to {} via Gmail SMTPS Port 465 (SSL) [attempt {}]", toEmail, attempt);
                return;
            } catch (Exception e) {
                lastException = e;
                logger.warn("Gmail SMTPS Port 465 attempt {}/{} failed ({}: {})",
                        attempt, MAX_RETRIES, e.getClass().getSimpleName(), e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        // 2. Try SMTP Port 587 (TLS) with retries as fallback
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                JavaMailSender smtpSender = createSmtpMailSender();
                smtpSender.send(message);
                logger.info("OTP Email sent SUCCESSFULLY to {} via Gmail SMTP Port 587 (TLS) [attempt {}]", toEmail, attempt);
                return;
            } catch (Exception e) {
                lastException = e;
                logger.warn("Gmail SMTP Port 587 attempt {}/{} failed ({}: {})",
                        attempt, MAX_RETRIES, e.getClass().getSimpleName(), e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        // All attempts exhausted — throw so the API returns a proper error to the user
        String errorMsg = "Failed to send OTP email to " + toEmail + " after " + (MAX_RETRIES * 2)
                + " attempts on both SMTP ports. Last error: "
                + (lastException != null ? lastException.getMessage() : "unknown");
        logger.error(errorMsg);
        throw new RuntimeException(errorMsg);
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

        // Invoice emails use retry logic too
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                createSmtpsMailSender().send(message);
                logger.info("Tax Invoice Email sent successfully to {} via SMTPS Port 465 [attempt {}]", recipient, attempt);
                return;
            } catch (Exception e) {
                logger.warn("Tax Invoice SMTPS 465 attempt {}/{} failed: {}", attempt, MAX_RETRIES, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                createSmtpMailSender().send(message);
                logger.info("Tax Invoice Email sent successfully to {} via SMTP Port 587 [attempt {}]", recipient, attempt);
                return;
            } catch (Exception e) {
                logger.warn("Tax Invoice SMTP 587 attempt {}/{} failed: {}", attempt, MAX_RETRIES, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        logger.error("Failed to send Tax Invoice Email to {} after all retry attempts", recipient);
    }

    /**
     * Exponential backoff sleep: 2s, 4s, 8s...
     */
    private void sleepBeforeRetry(int attempt) {
        long delay = INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1);
        logger.info("Waiting {}ms before retry...", delay);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
