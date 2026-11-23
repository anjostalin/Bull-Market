package com.stocksim.sts.service;

import com.stocksim.sts.entity.User;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.UserRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TotpService {

    private final UserRepository userRepository;
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public TotpService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Generates a secret, stores it (not yet enabled), and returns the otpauth:// URI for QR display. */
    @Transactional
    public String setup(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        user.setTotpSecret(key.getKey());
        userRepository.save(user);
        // otpauth URI the authenticator app scans
        return String.format("otpauth://totp/BullMarket:%s?secret=%s&issuer=BullMarket",
                user.getEmail(), key.getKey());
    }

    /** Verifies a code against the stored secret and, on success, enables 2FA. */
    @Transactional
    public boolean enable(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (user.getTotpSecret() == null) throw ApiException.badRequest("Run 2FA setup first");
        if (!gAuth.authorize(user.getTotpSecret(), code)) return false;
        user.setTotpEnabled(true);
        userRepository.save(user);
        return true;
    }

    @Transactional
    public void disable(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        userRepository.save(user);
    }
}
