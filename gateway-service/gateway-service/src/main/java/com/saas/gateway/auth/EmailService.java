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

    public void sendPasswordResetEmail(String to, String resetUrl) {
        log.info("Sending password reset email to {}", to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Password Reset Request - Blog SaaS");
            
            String htmlContent = "<h2>Password Reset Request</h2>" +
                    "<p>You requested to reset your password. Click the link below to set a new password:</p>" +
                    "<a href=\"" + resetUrl + "\">Reset Password</a>" +
                    "<p>This link is valid for 15 minutes.</p>" +
                    "<p>If you did not request this, please ignore this email.</p>";
                    
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}", to, e);
            throw new RuntimeException("Failed to send email");
        }
    }
}
