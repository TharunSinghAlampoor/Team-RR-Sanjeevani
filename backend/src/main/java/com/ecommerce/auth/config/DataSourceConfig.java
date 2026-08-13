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

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUser);
        config.setPassword(dbPassword);

        // Auto-detect driver from JDBC URL
        if (dbUrl != null && dbUrl.contains("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
            logger.info("Using H2 in-memory database (Cloud/Render mode)");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
        } else {
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            logger.info("Using MySQL database at URL: {}", dbUrl);
            config.setMaximumPoolSize(20);
            config.setMinimumIdle(5);
        }

        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(15000);

        return new HikariDataSource(config);
    }
}
