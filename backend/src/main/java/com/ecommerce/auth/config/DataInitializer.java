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

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING'");
            logger.info("Successfully updated orders table status column to VARCHAR(50)");
        } catch (Exception e) {
            logger.info("Order status column migration status: {}", e.getMessage());
        }
        if (userRepository.count() == 0) {
            logger.info("Database users table is empty. Seeding default demo accounts...");

            // 1. Seed Customer User
            User customer = new User(
                    "Tharun Singh",
                    "tharunsingh851@gmail.com",
                    "+917702173084",
                    passwordEncoder.encode("Tharun@2005"),
                    Role.CUSTOMER
            );
            userRepository.save(customer);

            // 2. Seed Admin User
            User admin = new User(
                    "System Admin",
                    "admin@sanjeevani.com",
                    "+919999999999",
                    passwordEncoder.encode("Admin@1234"),
                    Role.ADMIN
            );
            userRepository.save(admin);

            logger.info("Default accounts created successfully:");
            logger.info("  Customer: Tharun Singh / tharunsingh851@gmail.com / +917702173084 | Password: Tharun@2005");
            logger.info("  Admin:    System Admin / admin@sanjeevani.com / +919999999999     | Password: Admin@1234");
        }
    }
}
