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
            "<body style='margin: 0; padding: 0; background-color: #0a0a0a; color: #ededed;'>" +
                "<div style='padding: 60px 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;'>" +
                    "<div style='max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #2a2a2a; padding: 40px;'>" +
                        "<div style='margin-bottom: 30px;'>" +
                            "<h1 style='margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; color: #ffffff;'>blogWho.</h1>" +
                        "</div>" +
                        "<h2 style='margin: 0 0 10px 0; font-size: 16px; font-weight: 500; color: #888888;'>Authentication</h2>" +
                        "<p style='font-size: 14px; line-height: 1.6; margin: 0 0 30px 0; color: #ededed;'>Please enter the following code to verify your email address and complete your registration:</p>" +
                        
                        "<div style='background-color: #1a1a1a; border: 1px solid #2a2a2a; padding: 24px; text-align: center; margin-bottom: 30px;'>" +
                            "<strong style='font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; letter-spacing: 8px; color: #ffffff;'>" + 
                                otp + 
                            "</strong>" +
                        "</div>" +
                        
                        "<p style='font-size: 12px; color: #555555; margin: 0;'>This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>" +
                        
                        "<hr style='border: none; border-top: 1px solid #2a2a2a; margin: 30px 0;' />" +
                        "<div style='text-align: left;'>" +
                            "<h3 style='margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #ffffff;'>Built by Aman Shukla</h3>" +
                            "<p style='margin: 0 0 15px 0; font-size: 13px; color: #888888; line-height: 1.5;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>" +
                            "<div>" +
                                "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='display: inline-block; border: 1px solid #2a2a2a; color: #ededed; background-color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; padding: 6px 12px; margin-right: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>LinkedIn</a>" +
                                "<a href='https://github.com/amanshukla2004' style='display: inline-block; border: 1px solid #2a2a2a; color: #ededed; background-color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; padding: 6px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>GitHub</a>" +
                            "</div>" +
                        "</div>" +
                        
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
            "<body style='margin: 0; padding: 0; background-color: #0a0a0a; color: #ededed;'>" +
                "<div style='padding: 60px 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;'>" +
                    "<div style='max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #2a2a2a; padding: 40px;'>" +
                        "<div style='margin-bottom: 30px;'>" +
                            "<h1 style='margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; color: #ffffff;'>blogWho.</h1>" +
                        "</div>" +
                        "<h2 style='margin: 0 0 10px 0; font-size: 16px; font-weight: 500; color: #888888;'>Password Reset</h2>" +
                        "<p style='font-size: 14px; line-height: 1.6; margin: 0 0 30px 0; color: #ededed;'>Please enter the following code to reset your password:</p>" +
                        
                        "<div style='background-color: #1a1a1a; border: 1px solid #2a2a2a; padding: 24px; text-align: center; margin-bottom: 30px;'>" +
                            "<strong style='font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; letter-spacing: 8px; color: #ffffff;'>" + 
                                otp + 
                            "</strong>" +
                        "</div>" +
                        
                        "<p style='font-size: 12px; color: #555555; margin: 0;'>This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>" +
                        
                        "<hr style='border: none; border-top: 1px solid #2a2a2a; margin: 30px 0;' />" +
                        "<div style='text-align: left;'>" +
                            "<h3 style='margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #ffffff;'>Built by Aman Shukla</h3>" +
                            "<p style='margin: 0 0 15px 0; font-size: 13px; color: #888888; line-height: 1.5;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>" +
                            "<div>" +
                                "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='display: inline-block; border: 1px solid #2a2a2a; color: #ededed; background-color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; padding: 6px 12px; margin-right: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>LinkedIn</a>" +
                                "<a href='https://github.com/amanshukla2004' style='display: inline-block; border: 1px solid #2a2a2a; color: #ededed; background-color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; padding: 6px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>GitHub</a>" +
                            "</div>" +
                        "</div>" +
                        
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

        // Defensively trim and remove accidental quotes from the environment variable
        String cleanApiKey = brevoApiKey.trim().replace("\"", "").replace("'", "");
        
        String maskedKey = cleanApiKey.length() > 10 
            ? cleanApiKey.substring(0, 10) + "..." 
            : "INVALID_LENGTH";
            
        log.info("Attempting to send email to {} via Brevo API using API Key starting with: {}", to, maskedKey);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", cleanApiKey);
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
