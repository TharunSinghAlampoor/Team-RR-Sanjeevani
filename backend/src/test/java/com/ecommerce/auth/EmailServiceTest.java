package com.ecommerce.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@SpringBootTest
public class EmailServiceTest {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Test
    public void testSendEmail() {
        if (mailSender == null) {
            System.out.println("TEST_RESULT: mailSender is NULL");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("tharunsingh851@gmail.com");
            message.setTo("tharunsingh851@gmail.com");
            message.setSubject("Sanjeevani Test Email OTP Verification");
            message.setText("Test OTP Code: 999888");
            mailSender.send(message);
            System.out.println("TEST_RESULT: EMAIL_SENT_SUCCESSFULLY");
        } catch (Exception e) {
            System.out.println("TEST_RESULT: EMAIL_FAILED: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }
    }
}
