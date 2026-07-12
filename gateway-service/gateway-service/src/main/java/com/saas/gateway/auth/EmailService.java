package com.saas.gateway.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${app.email.from:${EMAIL_FROM_ADDRESS:noreply@blogwho.com}}")
    private String fromEmail;

    @Value("${brevo.api.key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    public void sendVerificationOtpEmail(String to, String otp) {
        log.warn("=====================================================");
        log.warn("🔐 OTP FOR REGISTRATION: {} (Email: {})", otp, to);
        log.warn("=====================================================");
        
        String registrationEmail = 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; background-color: #0f172a;'>" +
                "<div style='background-color: #0f172a; padding: 40px 20px; font-family: \"Inter\", sans-serif;'>" +
                    "<div style='max-width: 520px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; text-align: center;'>" +
                        "<h2 style='color: #f8fafc; font-size: 20px;'>Welcome to blogWho!</h2>" +
                        "<p style='color: #cbd5e1; font-size: 15px;'>Your verification code is:</p>" +
                        "<strong style='font-size: 36px; color: #10b981;'>" + otp + "</strong>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";

        sendEmailViaHttp(to, "Verify your blogWho Account", registrationEmail);
    }

    public void sendPasswordResetEmail(String to, String otp) {
        log.warn("=====================================================");
        log.warn("🔑 OTP FOR PASSWORD RESET: {} (Email: {})", otp, to);
        log.warn("=====================================================");
        
        String otpEmail = 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; background-color: #0f172a;'>" +
                "<div style='background-color: #0f172a; padding: 40px 20px; font-family: \"Inter\", sans-serif;'>" +
                    "<div style='max-width: 520px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; text-align: center;'>" +
                        "<h2 style='color: #f8fafc; font-size: 20px;'>Password Reset</h2>" +
                        "<p style='color: #cbd5e1; font-size: 15px;'>Your reset code is:</p>" +
                        "<strong style='font-size: 36px; color: #0ea5e9;'>" + otp + "</strong>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";

        sendEmailViaHttp(to, "Reset password for blogWho", otpEmail);
    }

    private void sendEmailViaHttp(String to, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("BREVO_API_KEY is missing. HTTP Email aborted.");
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", brevoApiKey);
            headers.set("Content-Type", "application/json");
            headers.set("Accept", "application/json");

            Map<String, Object> requestBody = Map.of(
                "sender", Map.of("name", "blogWho", "email", fromEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.brevo.com/v3/smtp/email", 
                request, 
                String.class
            );
            
            log.info("Successfully sent HTTP email to {} via Brevo API. Response: {}", to, response.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to send HTTP email to {}. Error: {}", to, e.getMessage());
            log.warn("Since email failed, check the OTP log above if testing.");
        }
    }
}
