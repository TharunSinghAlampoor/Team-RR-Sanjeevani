package com.ecommerce.auth;

import com.ecommerce.auth.repository.JwtTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
public class AuthApplication {

    private static final Logger logger = LoggerFactory.getLogger(AuthApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    @Bean
    @Transactional
    public CommandLineRunner purgeJwtTokensOnStartup(JwtTokenRepository jwtTokenRepository) {
        return args -> {
            try {
                int count = jwtTokenRepository.deleteAllTokens();
                logger.info("Purged {} old JWT token record(s) from database table 'jwt_tokens' on startup", count);
            } catch (Exception e) {
                logger.warn("Could not purge JWT tokens on startup: {}", e.getMessage());
            }
        };
    }
}
