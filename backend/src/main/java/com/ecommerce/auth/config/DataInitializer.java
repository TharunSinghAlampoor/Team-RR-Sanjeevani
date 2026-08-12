package com.ecommerce.auth.config;

import com.ecommerce.auth.entity.Role;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING'");
            logger.info("Successfully updated orders table status column to VARCHAR(50)");
        } catch (Exception e) {
            logger.info("Order status column migration status: {}", e.getMessage());
        }

        try {
            seedUserIfMissing("Tharun Singh Alampoor", "tharunsingh851@gmail.com", "+919876543212", "Tharun@123", Role.CUSTOMER);
            seedUserIfMissing("System Admin", "admin@sanjeevani.com", "+919876543210", "Admin@123", Role.ADMIN);
            seedUserIfMissing("Valued Customer", "user@sanjeevani.com", "+919876543211", "User@123", Role.CUSTOMER);
        } catch (Exception e) {
            logger.warn("User seeding status: {}", e.getMessage());
        }
    }

    private void seedUserIfMissing(String fullName, String email, String phone, String rawPassword, Role role) {
        java.util.Optional<User> existing = userRepository.findByEmail(email.toLowerCase());
        if (existing.isEmpty()) {
            User user = new User(
                    fullName,
                    email.toLowerCase(),
                    phone,
                    passwordEncoder.encode(rawPassword),
                    role
            );
            userRepository.save(user);
            logger.info("Seeded user account: {} ({})", fullName, email);
        }
    }
}

