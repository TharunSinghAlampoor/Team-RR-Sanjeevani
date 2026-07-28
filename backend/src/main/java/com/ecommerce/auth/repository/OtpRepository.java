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
}
