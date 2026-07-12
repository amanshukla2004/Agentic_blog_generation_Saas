package com.saas.gateway.auth;

import com.resend.*;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    public void sendVerificationOtpEmail(String to, String otp) {
        log.info("Sending verification OTP email to {}. OTP is: {}", to, otp);
        String registrationEmail = 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; background-color: #0f172a;'>" +
            
                "<div style='display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #0f172a;'>" +
                    "Welcome to blogWho! Here is your verification code to complete your registration." +
                "</div>" +

                "<div style='background-color: #0f172a; padding: 40px 20px; font-family: \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                    "<div style='max-width: 520px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);'>" +
                        
                        "<div style='text-align: center; margin-bottom: 25px;'>" +
                            "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif' alt='Rocket Launch' width='48' height='48' style='display: block; margin: 0 auto 15px auto; border: 0;' />" +
                            "<h1 style='color: #38bdf8; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;'>blogWho</h1>" +
                        "</div>" +
                        
                        "<div style='background-color: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px; border: 1px solid #334155;'>" +
                            "<h2 style='color: #f8fafc; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;'>Welcome Aboard!</h2>" +
                            "<p style='color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;'>We are thrilled to have you. To complete your registration and secure your account, please use the verification code below:</p>" +
                            
                            "<div style='margin: 0;'>" +
                                "<strong style='display: inline-block; font-size: 36px; background: linear-gradient(to right, #10b981, #059669); color: #ffffff; padding: 18px 36px; border-radius: 12px; letter-spacing: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); border: 1px solid #34d399;'>" + 
                                    otp + 
                                "</strong>" +
                            "</div>" +
                        "</div>" +
                        
                        "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom: 30px;'>" +
                            "<tr>" +
                                "<td align='center' style='padding: 12px; background-color: #334155; border-radius: 8px;'>" +
                                    "<table cellpadding='0' cellspacing='0'>" +
                                        "<tr>" +
                                            "<td valign='middle' style='padding-right: 10px;'>" +
                                                "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/23f3/512.gif' alt='Hourglass' width='20' height='20' style='display: block; border: 0;' />" +
                                            "</td>" +
                                            "<td valign='middle'>" +
                                                "<p style='color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;'>This registration code expires in 15 minutes.</p>" +
                                            "</td>" +
                                        "</tr>" +
                                    "</table>" +
                                "</td>" +
                            "</tr>" +
                        "</table>" +
                        
                        "<hr style='border: none; border-top: 1px dashed #475569; margin: 0 0 30px 0;' />" +
                        
                        "<div style='background-color: #0f172a; padding: 25px; border-radius: 12px; font-size: 14px; color: #94a3b8; border: 1px solid #334155; text-align: left;'>" +
                            "<table cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 12px;'>" +
                                "<tr>" +
                                    "<td width='28' valign='top'>" +
                                        "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.gif' alt='Wave' width='24' height='24' style='display: block; border: 0;' />" +
                                    "</td>" +
                                    "<td valign='middle'>" +
                                        "<span style='font-size: 16px; color: #f8fafc; font-weight: 600;'>Built by Aman Shukla</span>" +
                                    "</td>" +
                                "</tr>" +
                            "</table>" +
                            "<p style='margin: 0 0 16px 0; line-height: 1.6;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>" +
                            "<p style='margin: 0;'>" +
                                "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; margin-right: 10px; font-size: 13px;'>LinkedIn</a>" +
                                "<a href='https://github.com/amanshukla2004' style='display: inline-block; background-color: #334155; color: #f8fafc; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; font-size: 13px;'>GitHub</a>" +
                            "</p>" +
                        "</div>" +
                        
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";

        sendEmail(to, "Verify your blogWho Account", registrationEmail);
    }

    public void sendPasswordResetEmail(String to, String otp) {
        log.info("Sending password reset OTP email to {}. OTP is: {}", to, otp);
        String otpEmail = 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; background-color: #0f172a;'>" +
            
                "<div style='display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #0f172a;'>" +
                    "Your blogWho password reset code is " + otp + ". This code expires in 15 minutes." +
                "</div>" +

                "<div style='background-color: #0f172a; padding: 40px 20px; font-family: \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                    "<div style='max-width: 520px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);'>" +
                        
                        "<div style='text-align: center; margin-bottom: 25px;'>" +
                            "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/1f512/512.gif' alt='Security Lock' width='48' height='48' style='display: block; margin: 0 auto 15px auto; border: 0;' />" +
                            "<h1 style='color: #38bdf8; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;'>blogWho</h1>" +
                        "</div>" +
                        
                        "<div style='background-color: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px; border: 1px solid #334155;'>" +
                            "<h2 style='color: #f8fafc; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;'>Password Reset</h2>" +
                            "<p style='color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;'>Copy the verification code below to reset your password.</p>" +
                            
                            "<div style='margin: 0;'>" +
                                "<strong style='display: inline-block; font-size: 36px; background: linear-gradient(to right, #0ea5e9, #3b82f6); color: #ffffff; padding: 18px 36px; border-radius: 12px; letter-spacing: 8px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4); border: 1px solid #7dd3fc;'>" + 
                                    otp + 
                                "</strong>" +
                            "</div>" +
                        "</div>" +
                        
                        "<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom: 30px;'>" +
                            "<tr>" +
                                "<td align='center' style='padding: 12px; background-color: #334155; border-radius: 8px;'>" +
                                    "<table cellpadding='0' cellspacing='0'>" +
                                        "<tr>" +
                                            "<td valign='middle' style='padding-right: 10px;'>" +
                                                "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/23f3/512.gif' alt='Hourglass' width='20' height='20' style='display: block; border: 0;' />" +
                                            "</td>" +
                                            "<td valign='middle'>" +
                                                "<p style='color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;'>This code expires in 15 minutes.</p>" +
                                            "</td>" +
                                        "</tr>" +
                                    "</table>" +
                                "</td>" +
                            "</tr>" +
                        "</table>" +
                        
                        "<hr style='border: none; border-top: 1px dashed #475569; margin: 0 0 30px 0;' />" +
                        
                        "<div style='background-color: #0f172a; padding: 25px; border-radius: 12px; font-size: 14px; color: #94a3b8; border: 1px solid #334155; text-align: left;'>" +
                            "<table cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 12px;'>" +
                                "<tr>" +
                                    "<td width='28' valign='top'>" +
                                        "<img src='https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.gif' alt='Wave' width='24' height='24' style='display: block; border: 0;' />" +
                                    "</td>" +
                                    "<td valign='middle'>" +
                                        "<span style='font-size: 16px; color: #f8fafc; font-weight: 600;'>Built by Aman Shukla</span>" +
                                    "</td>" +
                                "</tr>" +
                            "</table>" +
                            "<p style='margin: 0 0 16px 0; line-height: 1.6;'>I am a Software Developer actively looking for new opportunities. If you like the architecture of this app, let's connect!</p>" +
                            "<p style='margin: 0;'>" +
                                "<a href='https://www.linkedin.com/in/amanshukla-dev/' style='display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; margin-right: 10px; font-size: 13px;'>LinkedIn</a>" +
                                "<a href='https://github.com/amanshukla2004' style='display: inline-block; background-color: #334155; color: #f8fafc; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; font-size: 13px;'>GitHub</a>" +
                            "</p>" +
                        "</div>" +
                        
                    "</div>" +
                    "<p style='text-align: center; color: #64748b; font-size: 12px; margin-top: 20px;'>If you didn't request this reset, you can safely ignore this email.</p>" +
                "</div>" +
            "</body>" +
            "</html>";

        sendEmail(to, "Reset password for blogWho", otpEmail);
    }

    @Value("${resend.from.email:${RESEND_FROM_EMAIL:onboarding@resend.dev}}")
    private String fromEmail;

    private void sendEmail(String to, String subject, String htmlContent) {
        if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.equals("re_xxxxxxxxx")) {
            log.warn("RESEND_API_KEY is not set or is invalid. Email to {} not sent.", to);
            log.warn("Since email failed, if you are in local dev, check the logs for the OTP.");
            return;
        }

        try {
            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            CreateEmailResponse data = resend.emails().send(sendEmailRequest);
            log.info("Successfully sent email via Resend to {}. ID: {}", to, data.getId());
        } catch (ResendException e) {
            log.error("Failed to send email to {} via Resend. Error: {}", to, e.getMessage(), e);
            log.warn("Since email failed, if you are in local dev, check the logs for the OTP.");
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}", to, e);
            log.warn("Since email failed, if you are in local dev, check the logs for the OTP.");
        }
    }
}
