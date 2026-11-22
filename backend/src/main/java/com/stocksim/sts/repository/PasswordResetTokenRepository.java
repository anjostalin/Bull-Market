package com.stocksim.sts.repository;

import com.stocksim.sts.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByUserIdAndOtpAndUsedFalse(Long userId, String otp);
}
