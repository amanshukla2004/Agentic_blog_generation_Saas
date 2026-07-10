package com.saas.gateway.system;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import com.saas.gateway.user.Role;
import com.saas.gateway.user.SubscriptionTier;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SystemPromptRepository systemPromptRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.security.master.email:master@admin.com}")
    private String masterEmail;
    
    @Value("${app.security.master.password:supersecretmasterpassword}")
    private String masterPassword;

    public DatabaseSeeder(SystemPromptRepository systemPromptRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.systemPromptRepository = systemPromptRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String promptName = "TECH_BLOG_PROMPT";
        Optional<SystemPrompt> existingPrompt = systemPromptRepository.findByPromptName(promptName);

        if (existingPrompt.isEmpty() || true) { // TEMPORARY OVERRIDE TO UPDATE PROMPT
            String defaultPromptText = """
                You are an expert Lead Backend Engineer and AI Architect writing an engaging blog post. 
                Given the provided context, generate a comprehensive blog post in markdown format. Adapt your tone and structure based on whether the topic is technical/coding-related or general/non-technical.
                
                CRITICAL INSTRUCTION: You must respond in strictly valid JSON with exactly five keys: 'title', 'seo_description', 'tags', 'hero_image_keyword', and 'markdown_content'. The 'markdown_content' value MUST be a single string wrapped in double quotes. You MUST escape all newlines in the markdown as \\n and all double quotes as \\". Do NOT output raw unescaped newlines.
                
                CONTENT CONSTRAINTS FOR 'markdown_content':
                1. Adaptive Structure: IF the topic is technical/coding, begin with an environment setup/prerequisites block. IF non-technical, start with a highly engaging, relatable introduction. Follow up with logical H2 and H3 sections.
                2. Code Blocks: IF the topic involves code, all code samples must be fully written out (no lazy placeholders) and wrapped in markdown code fences specifying the exact language (e.g., ```python).
                3. Detailed Breakdown: For coding topics, every major code snippet must be followed by a numbered mechanical explanation. For non-coding topics, use bullet points to break down complex ideas clearly.
                4. Visuals (Mermaid): IF explaining technical architectures or data flows, compose a clear diagram using Mermaid.js syntax inside a code block tagged with ```mermaid.
                   - VERY IMPORTANT: If making a flowchart, you MUST use `graph TD` or `graph LR` and define nodes (e.g. A-->B). DO NOT use `participant`.
                   - VERY IMPORTANT: If making a sequence diagram, you MUST start with `sequenceDiagram` and use `participant`. Do NOT mix the two syntaxes.
                5. The Human Touch: Write with high authority, empathy, and clarity. Do NOT use robotic AI tells like "In conclusion," "As an AI model," or "Here is your blog".
                """;

            if (existingPrompt.isPresent()) {
                SystemPrompt prompt = existingPrompt.get();
                prompt.setPromptText(defaultPromptText);
                systemPromptRepository.save(prompt);
                System.out.println("Updated TECH_BLOG_PROMPT");
            } else {
                SystemPrompt prompt = new SystemPrompt(promptName, defaultPromptText);
                systemPromptRepository.save(prompt);
                System.out.println("Seeded default TECH_BLOG_PROMPT");
            }
        }

        // Seed Master Admin User
        Optional<User> existingMaster = userRepository.findByEmail(masterEmail);
        if (existingMaster.isEmpty()) {
            User masterUser = new User();
            masterUser.setEmail(masterEmail);
            masterUser.setPasswordHash(passwordEncoder.encode(masterPassword));
            masterUser.setRole(Role.MASTER_ADMIN);
            masterUser.setSubscriptionTier(SubscriptionTier.PRO);
            masterUser.setGenerationsCount(0);
            masterUser.setIsActive(true);
            userRepository.save(masterUser);
            System.out.println("Seeded Master Admin User: " + masterEmail);
        }
    }
}
