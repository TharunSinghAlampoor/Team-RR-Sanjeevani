package com.ecommerce.auth.filter;

import com.ecommerce.auth.entity.Session;
import com.ecommerce.auth.repository.SessionRepository;
import com.ecommerce.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

/**
 * JWT authentication filter that intercepts every request.
 * Validates the Bearer token, checks session status in DB, and sets the SecurityContext.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final SessionRepository sessionRepository;

    public JwtAuthenticationFilter(JwtService jwtService, SessionRepository sessionRepository) {
        this.jwtService = jwtService;
        this.sessionRepository = sessionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        // No token present — let Spring Security handle it (may be a public endpoint)
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            // 1. Validate JWT signature and expiry
            if (!jwtService.validateToken(token)) {
                sendUnauthorized(response, "Invalid or expired token");
                return;
            }

            // 2. Check session exists and is active in database
            Optional<Session> sessionOpt = sessionRepository.findByJwtTokenAndActiveTrue(token);
            if (sessionOpt.isEmpty()) {
                sendUnauthorized(response, "Session has been invalidated. Please log in again.");
                return;
            }

            Session session = sessionOpt.get();

            // 3. Check session expiry
            if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                session.setActive(false);
                sessionRepository.save(session);
                sendUnauthorized(response, "Session has expired. Please log in again.");
                return;
            }

            // 4. Extract user info and set authentication
            Integer userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);

            if (userId == null && session.getUser() != null) {
                userId = session.getUser().getUserId();
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId, // principal = userId
                            token,  // credentials = jwt token
                            Collections.emptyList()
                    );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.trace("Authenticated user: {} (ID: {})", email, userId);

        } catch (Exception e) {
            logger.error("JWT authentication error: {}", e.getMessage());
            sendUnauthorized(response, "Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Send a 401 Unauthorized JSON response.
     */
    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}
