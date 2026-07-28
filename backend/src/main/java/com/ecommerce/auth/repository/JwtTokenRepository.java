package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JwtTokenRepository extends JpaRepository<JwtToken, Integer> {
    Optional<JwtToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteByUserUserId(Integer userId);
}
