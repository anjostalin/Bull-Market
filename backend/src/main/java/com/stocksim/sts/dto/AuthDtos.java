package com.stocksim.sts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password
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

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(
            @NotBlank @Email String email,
            @NotBlank String otp,
            @NotBlank @Size(min = 6, max = 100) String newPassword
    ) {}
}
