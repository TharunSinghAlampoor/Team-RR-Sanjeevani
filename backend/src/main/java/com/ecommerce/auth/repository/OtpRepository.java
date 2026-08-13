package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Otp;
import com.ecommerce.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Integer> {

    Optional<Otp> findTopByUserAndOtpCodeAndVerifiedFalseOrderByGeneratedTimeDesc(User user, String otpCode);

    Optional<Otp> findTopByUserAndVerifiedTrueOrderByGeneratedTimeDesc(User user);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("DELETE FROM Otp o WHERE o.user.userId = :userId")
    void deleteByUserUserId(@org.springframework.data.repository.query.Param("userId") Integer userId);
}
