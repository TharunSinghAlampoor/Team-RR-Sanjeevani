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
import java.util.Base64;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/e-commerce?useSSL=false&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=Asia/Kolkata&createDatabaseIfNotExist=true}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUser;

    @Value("${spring.datasource.password:Tharun@123}")
    private String dbPassword;

    @Value("${aiven.datasource.url:jdbc:mysql://sanjeevani-sanjeevani-sql.a.aivencloud.com:22954/defaultdb?useSSL=false&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=Asia/Kolkata}")
    private String aivenUrl;

    @Value("${aiven.datasource.username:avnadmin}")
    private String aivenUser;

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
            logger.warn("Primary local database connection failed ({}: {}). Trying Aiven Cloud MySQL Database...",
                    e.getClass().getSimpleName(), e.getMessage());
            
            // Try connecting to Aiven Cloud MySQL Database
            try {
                logger.info("Attempting connection to Aiven Cloud Database URL: {}", aivenUrl);
                HikariConfig aivenConfig = new HikariConfig();
                aivenConfig.setJdbcUrl(aivenUrl);
                aivenConfig.setUsername(aivenUser);
                aivenConfig.setPassword(resolveAivenPassword());
                aivenConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
                aivenConfig.setMaximumPoolSize(15);
                aivenConfig.setMinimumIdle(2);
                aivenConfig.setIdleTimeout(30000);
                aivenConfig.setMaxLifetime(1800000);
                aivenConfig.setConnectionTimeout(5000);

                HikariDataSource aivenDs = new HikariDataSource(aivenConfig);
                logger.info("Aiven Cloud MySQL Database connected successfully!");
                return aivenDs;
            } catch (Exception aivenEx) {
                logger.warn("Aiven Cloud database connection failed ({}: {}). Falling back to H2 in-memory database.",
                        aivenEx.getClass().getSimpleName(), aivenEx.getMessage());
                return createH2DataSource();
            }
        }
    }

    private String resolveAivenPassword() {
        String envPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (envPass != null && !envPass.trim().isEmpty()) {
            return envPass.trim();
        }
        try {
            return new String(Base64.getDecoder().decode("QVZOU19qNmZ1djhZOTF6RlJPUC1SeVc="));
        } catch (Exception e) {
            return "";
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
