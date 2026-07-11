package com.saas.gateway.auth;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationOtpEmail(String to, String otp) {
        log.info("Sending verification OTP email to {}", to);
        sendEmail(to, "Verify your Blog SaaS Account", 
            "<h2>Welcome to Blog SaaS!</h2>" +
            "<p>Your verification code is: <strong>" + otp + "</strong></p>" +
            "<p>This code is valid for 15 minutes.</p>");
    }

    public void sendPasswordResetEmail(String to, String otp) {
        log.info("Sending password reset OTP email to {}", to);
        sendEmail(to, "Password Reset - Blog SaaS",
            "<h2>Password Reset Request</h2>" +
            "<p>You requested to reset your password. Your reset code is: <strong>" + otp + "</strong></p>" +
            "<p>This code is valid for 15 minutes.</p>" +
            "<p>If you did not request this, please ignore this email.</p>");
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email");
        }
    }
}
