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
import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUser;

    @Value("${spring.datasource.password:Tharun@123}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String activeUrl = dbUrl;
        String activeUser = dbUser;
        String activePassword = dbPassword;
        String driver;

        // Check if explicit H2 URL is provided or if localhost MySQL is unreachable (Render Cloud fallback)
        boolean isExplicitH2 = activeUrl != null && activeUrl.contains("jdbc:h2:");
        boolean isLocalhost = activeUrl == null || activeUrl.contains("localhost") || activeUrl.contains("127.0.0.1");

        if (isExplicitH2 || (isLocalhost && !isLocalhostMysqlReachable())) {
            activeUrl = "jdbc:h2:mem:sanjeevani_db;DB_CLOSE_DELAY=-1;MODE=MySQL";
            activeUser = "sa";
            activePassword = "";
            driver = "org.h2.Driver";
            logger.info("Using H2 In-Memory Database (Cloud/Render fallback mode)");
        } else {
            driver = "com.mysql.cj.jdbc.Driver";
            logger.info("Using MySQL Database at URL: {}", activeUrl);
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(activeUrl);
        config.setUsername(activeUser);
        config.setPassword(activePassword);
        config.setDriverClassName(driver);

        if (driver.equals("org.h2.Driver")) {
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
        } else {
            config.setMaximumPoolSize(20);
            config.setMinimumIdle(5);
        }

        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(10000);

        return new HikariDataSource(config);
    }

    private boolean isLocalhostMysqlReachable() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("127.0.0.1", 3306), 500);
            return true;
        } catch (Exception e) {
            logger.warn("Localhost MySQL port 3306 is not reachable. Falling back to H2 for cloud container execution.");
            return false;
        }
    }
}
