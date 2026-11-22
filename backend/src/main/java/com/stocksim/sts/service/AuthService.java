package com.stocksim.sts.service;

import com.stocksim.sts.dto.AuthDtos.*;
import com.stocksim.sts.entity.*;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.*;
import com.stocksim.sts.security.JwtUtil;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final EmailVerificationTokenRepository verificationRepo;
    private final PasswordResetTokenRepository resetRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepository, WalletRepository walletRepository,
                       EmailVerificationTokenRepository verificationRepo,
                       PasswordResetTokenRepository resetRepo,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.verificationRepo = verificationRepo;
        this.resetRepo = resetRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Transactional
    public MessageResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }
        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(User.Role.TRADER)
                .verified(false)
                .build();
        user = userRepository.save(user);

        walletRepository.save(Wallet.builder()
                .userId(user.getId())
                .balance(new BigDecimal("100000.00"))
                .buyingPower(new BigDecimal("100000.00"))
                .build());

        String token = UUID.randomUUID().toString().replace("-", "");
        verificationRepo.save(EmailVerificationToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());
        emailService.sendVerification(user.getEmail(), token);

        return new MessageResponse("Registration successful. Check your email to verify your account.");
    }

    @Transactional
    public MessageResponse verifyEmail(String token) {
        EmailVerificationToken vt = verificationRepo.findByToken(token)
                .orElseThrow(() -> ApiException.badRequest("Invalid verification token"));
        if (vt.isUsed()) throw ApiException.badRequest("Token already used");
        if (vt.getExpiresAt().isBefore(LocalDateTime.now())) throw ApiException.badRequest("Token expired");

        User user = userRepository.findById(vt.getUserId())
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        vt.setUsed(true);
        verificationRepo.save(vt);
        return new MessageResponse("Email verified. You can now log in.");
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid credentials");
        }
        if (user.isSuspended()) throw ApiException.forbidden("Account suspended");
        if (!user.isVerified()) throw ApiException.forbidden("Please verify your email first");

        if (user.isTotpEnabled()) {
            if (req.totpCode() == null || req.totpCode().isBlank()) {
                throw ApiException.unauthorized("2FA code required");
            }
            int code;
            try { code = Integer.parseInt(req.totpCode().trim()); }
            catch (NumberFormatException e) { throw ApiException.unauthorized("Invalid 2FA code"); }
            if (!gAuth.authorize(user.getTotpSecret(), code)) {
                throw ApiException.unauthorized("Invalid 2FA code");
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.email()).ifPresent(user -> {
            String otp = String.format("%06d", random.nextInt(1_000_000));
            resetRepo.save(PasswordResetToken.builder()
                    .userId(user.getId())
                    .otp(otp)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build());
            emailService.sendPasswordResetOtp(user.getEmail(), otp);
        });
        // Always return success to avoid email enumeration
        return new MessageResponse("If that email exists, a reset code has been sent.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> ApiException.badRequest("Invalid reset request"));
        PasswordResetToken prt = resetRepo.findByUserIdAndOtpAndUsedFalse(user.getId(), req.otp())
                .orElseThrow(() -> ApiException.badRequest("Invalid or used OTP"));
        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) throw ApiException.badRequest("OTP expired");

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        prt.setUsed(true);
        resetRepo.save(prt);
        return new MessageResponse("Password reset successful. You can now log in.");
    }
}
