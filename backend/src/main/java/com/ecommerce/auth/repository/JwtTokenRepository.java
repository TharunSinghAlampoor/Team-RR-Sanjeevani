package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.JwtToken;
import com.ecommerce.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JwtTokenRepository extends JpaRepository<JwtToken, Integer> {
    Optional<JwtToken> findByToken(String token);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtToken t WHERE t.token = :token")
    int deleteByToken(@Param("token") String token);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtToken t WHERE t.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") Integer userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtToken t WHERE t.user = :user")
    int deleteByUser(@Param("user") User user);
}
