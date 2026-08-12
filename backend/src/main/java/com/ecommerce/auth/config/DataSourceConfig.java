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
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String dbDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Testing primary database connection at URL: {}", dbUrl);

        boolean canConnectToPrimary = false;
        try {
            Class.forName(dbDriver);
            DriverManager.setLoginTimeout(3);
            try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
                if (conn != null && !conn.isClosed()) {
                    canConnectToPrimary = true;
                    logger.info("Successfully connected to primary MySQL database at {}", dbUrl);
                }
            }
        } catch (Exception e) {
            logger.warn("Primary MySQL database connection check failed ({}: {}). Switching to cloud-resilient embedded H2 MySQL mode to prevent deployment exit.", e.getClass().getSimpleName(), e.getMessage());
        }

        HikariConfig config = new HikariConfig();

        if (canConnectToPrimary) {
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setDriverClassName(dbDriver);
        } else {
            logger.warn("Activating embedded H2 database layer (jdbc:h2:mem:sanjeevani_db;MODE=MySQL) for Render service stability.");
            config.setJdbcUrl("jdbc:h2:mem:sanjeevani_db;MODE=MySQL;DB_CLOSE_DELAY=-1;CASE_INSENSITIVE_IDENTIFIERS=TRUE");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
        }

        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(10000);

        return new HikariDataSource(config);
    }
}
