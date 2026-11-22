package com.stocksim.sts.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String baseUrl;

    public EmailService(JavaMailSender mailSender,
                        @Value("${sts.mail.from}") String from,
                        @Value("${sts.mail.base-url}") String baseUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.baseUrl = baseUrl;
    }

    public void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            // In dev without SMTP, do not fail the request; log to console.
            System.out.println("[EmailService] Failed to send mail to " + to + ": " + e.getMessage());
        }
    }

    public void sendVerification(String to, String token) {
        String link = baseUrl + "/verify?token=" + token;
        send(to, "Verify your StockSim Pro account",
                "Welcome to StockSim Pro!\n\nVerify your account:\n" + link +
                        "\n\nThis link expires in 24 hours.");
    }

    public void sendPasswordResetOtp(String to, String otp) {
        send(to, "StockSim Pro password reset code",
                "Your password reset code is: " + otp + "\n\nThis code expires in 15 minutes.");
    }

    public void sendOrderExecuted(String to, String detail) {
        send(to, "Order executed - StockSim Pro", detail);
    }

    public void sendPriceAlert(String to, String detail) {
        send(to, "Price alert - StockSim Pro", detail);
    }
}
