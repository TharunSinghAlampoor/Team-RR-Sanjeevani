package com.ecommerce.auth.config;

import com.ecommerce.auth.exception.AuthException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory rate limiter using a token bucket pattern.
 * Limits requests per IP per endpoint to prevent brute-force attacks.
 */
@Component
public class RateLimitConfig {

    private final int loginLimit;
    private final int otpLimit;

    // Map of "endpointType:clientIp" → bucket
    private final Map<String, RateBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitConfig(
            @Value("${rate-limit.login.requests-per-minute}") int loginLimit,
            @Value("${rate-limit.otp.requests-per-minute}") int otpLimit) {
        this.loginLimit = loginLimit;
        this.otpLimit = otpLimit;
    }

    /**
     * Check rate limit for login endpoint. Throws 429 if exceeded.
     */
    public void checkLoginRateLimit(String clientIp) {
        checkLimit("login:" + clientIp, loginLimit);
    }

    /**
     * Check rate limit for OTP endpoint. Throws 429 if exceeded.
     */
    public void checkOtpRateLimit(String clientIp) {
        checkLimit("otp:" + clientIp, otpLimit);
    }

    private void checkLimit(String key, int maxRequests) {
        RateBucket bucket = buckets.computeIfAbsent(key, k -> new RateBucket());
        long now = System.currentTimeMillis();

        // Reset bucket if more than 1 minute has passed
        if (now - bucket.windowStart.get() > 60_000) {
            bucket.count.set(0);
            bucket.windowStart.set(now);
        }

        if (bucket.count.incrementAndGet() > maxRequests) {
            throw AuthException.tooManyRequests("Too many requests. Please try again after a minute.");
        }
    }

    /**
     * Simple sliding-window-ish rate bucket.
     */
    private static class RateBucket {
        final AtomicInteger count = new AtomicInteger(0);
        final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
    }
}
