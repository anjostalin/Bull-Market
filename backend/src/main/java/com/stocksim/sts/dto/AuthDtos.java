package com.stocksim.sts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    // A properly-formed email: local@domain.tld (rejects "a@b", "test@", "no-at.com", spaces).
    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final String EMAIL_MSG = "Enter a valid email address (e.g. you@example.com)";

    // Strong password: >=8 chars with at least one lowercase, uppercase, digit and special character.
    private static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,100}$";
    private static final String PASSWORD_MSG =
            "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character";

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Pattern(regexp = EMAIL_REGEX, message = EMAIL_MSG) String email,
            @NotBlank @Pattern(regexp = PASSWORD_REGEX, message = PASSWORD_MSG) String password
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            String totpCode
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String fullName,
            String email,
            String role
    ) {}

    public record MessageResponse(String message) {}

    public record ForgotPasswordRequest(
            @NotBlank @Pattern(regexp = EMAIL_REGEX, message = EMAIL_MSG) String email
    ) {}

    public record ResetPasswordRequest(
            @NotBlank @Pattern(regexp = EMAIL_REGEX, message = EMAIL_MSG) String email,
            @NotBlank String otp,
            @NotBlank @Pattern(regexp = PASSWORD_REGEX, message = PASSWORD_MSG) String newPassword
    ) {}
}
