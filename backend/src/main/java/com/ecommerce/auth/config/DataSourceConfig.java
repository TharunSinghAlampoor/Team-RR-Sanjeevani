package com.ecommerce.auth.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/e-commerce?useSSL=false&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=Asia/Kolkata&createDatabaseIfNotExist=true}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUser;

    @Value("${spring.datasource.password:Tharun@123}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. If explicit H2 URL requested
        if (dbUrl != null && dbUrl.contains("jdbc:h2:")) {
            logger.info("Explicit H2 JDBC URL requested. Initializing H2 in-memory database...");
            return createH2DataSource();
        }

        // 2. Try initializing Primary MySQL Database with fast failover timeout
        try {
            logger.info("Attempting connection to primary database URL: {}", dbUrl);
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setMaximumPoolSize(20);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setMaxLifetime(1800000);
            config.setConnectionTimeout(3000); // 3 seconds timeout for fast failover

            HikariDataSource ds = new HikariDataSource(config);
            logger.info("Primary MySQL database connected successfully!");
            return ds;
        } catch (Exception e) {
            logger.warn("Primary database connection failed ({}: {}). Falling back to H2 in-memory database for resilient cloud execution.",
                    e.getClass().getSimpleName(), e.getMessage());
            return createH2DataSource();
        }
    }

    private DataSource createH2DataSource() {
        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:mem:sanjeevani_db;DB_CLOSE_DELAY=-1;MODE=MySQL");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setMaximumPoolSize(10);
        h2Config.setMinimumIdle(2);
        h2Config.setIdleTimeout(30000);
        h2Config.setMaxLifetime(1800000);
        h2Config.setConnectionTimeout(5000);

        logger.info("H2 In-Memory Database initialized successfully (Cloud resilient mode)");
        return new HikariDataSource(h2Config);
    }
}
