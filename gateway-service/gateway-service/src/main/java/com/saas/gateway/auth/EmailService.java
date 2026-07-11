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
        log.info("Sending verification OTP email to {}. OTP is: {}", to, otp);
        sendEmail(to, "Verify your blogWho Account",
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>"
                        +
                        "<h2 style='color: #0056b3; margin-top: 0;'>Welcome to blogWho!</h2>" +
                        "<p>Your verification code is: <strong style='font-size: 20px; background-color: #f4f5f7; padding: 8px 12px; border-radius: 4px; letter-spacing: 2px;'>"
                        + otp + "</strong></p>" +
                        "<p style='color: #555;'>This code is valid for 15 minutes.</p>" +

                        "<hr style='border: none; border-top: 1px solid #eaeaea; margin: 20px 0;' />" +

                        "<div style='background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 13px; color: #555;'>"
                        +
                        "<p style='margin: 0 0 8px 0; font-size: 15px;'>👋 <b>Built by Aman Shukla</b></p>" +
                        "<p style='margin: 0 0 12px 0;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>"
                        +
                        "<p style='margin: 0;'>" +
                        "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='color: #0056b3; text-decoration: none; font-weight: bold;'>LinkedIn</a> | "
                        +
                        "<a href='https://github.com/amanshukla2004' style='color: #0056b3; text-decoration: none; font-weight: bold;'>GitHub</a>"
                        +
                        "</p>" +
                        "</div>" +
                        "</div>");
    }

    public void sendPasswordResetEmail(String to, String otp) {
        log.info("Sending password reset OTP email to {}. OTP is: {}", to, otp);
        sendEmail(to, "Reset password for blogWho",
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>"
                        +
                        "<h2 style='color: #0056b3; margin-top: 0;'>Welcome to blogWho!</h2>" +
                        "<p>Your verification code is: <strong style='font-size: 20px; background-color: #f4f5f7; padding: 8px 12px; border-radius: 4px; letter-spacing: 2px;'>"
                        + otp + "</strong></p>" +
                        "<p style='color: #555;'>This code is valid for 15 minutes.</p>" +

                        "<hr style='border: none; border-top: 1px solid #eaeaea; margin: 20px 0;' />" +

                        "<div style='background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 13px; color: #555;'>"
                        +
                        "<p style='margin: 0 0 8px 0; font-size: 15px;'>👋 <b>Built by Aman Shukla</b></p>" +
                        "<p style='margin: 0 0 12px 0;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>"
                        +
                        "<p style='margin: 0;'>" +
                        "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='color: #0056b3; text-decoration: none; font-weight: bold;'>LinkedIn</a> | "
                        +
                        "<a href='https://github.com/amanshukla2004' style='color: #0056b3; text-decoration: none; font-weight: bold;'>GitHub</a>"
                        +
                        "</p>" +
                        "</div>" +
                        "</div>");
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
            log.error("Failed to create email message to {}", to, e);
            log.warn("Since email failed, if you are in local dev, check the logs for the OTP.");
        } catch (org.springframework.mail.MailException e) {
            log.error("Failed to send email to {} (SMTP may not be configured properly). Error: {}", to,
                    e.getMessage());
            log.warn("Since email failed, if you are in local dev, check the logs for the OTP.");
        }
    }
}
