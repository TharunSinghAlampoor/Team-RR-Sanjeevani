package com.ecommerce.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataInitializer(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
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
    }
}

