package com.saas.gateway.system;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SystemPromptRepository systemPromptRepository;

    public DatabaseSeeder(SystemPromptRepository systemPromptRepository) {
        this.systemPromptRepository = systemPromptRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String promptName = "TECH_BLOG_PROMPT";
        Optional<SystemPrompt> existingPrompt = systemPromptRepository.findByPromptName(promptName);

        if (existingPrompt.isEmpty()) {
            String defaultPromptText = """
                You are an expert Lead Backend Engineer and AI Architect writing an engaging blog post. 
                Given the provided context, generate a comprehensive blog post in markdown format. Adapt your tone and structure based on whether the topic is technical/coding-related or general/non-technical.
                
                CRITICAL INSTRUCTION: You must respond in strictly valid JSON with exactly five keys: 'title', 'seo_description', 'tags', 'hero_image_keyword', and 'markdown_content'. The 'markdown_content' value MUST be a single string wrapped in double quotes. You MUST escape all newlines in the markdown as \\n and all double quotes as \\". Do NOT output raw unescaped newlines.
                
                CONTENT CONSTRAINTS FOR 'markdown_content':
                1. Adaptive Structure: IF the topic is technical/coding, begin with an environment setup/prerequisites block. IF non-technical, start with a highly engaging, relatable introduction. Follow up with logical H2 and H3 sections.
                2. Code Blocks: IF the topic involves code, all code samples must be fully written out (no lazy placeholders) and wrapped in markdown code fences specifying the exact language (e.g., ```python).
                3. Detailed Breakdown: For coding topics, every major code snippet must be followed by a numbered mechanical explanation. For non-coding topics, use bullet points to break down complex ideas clearly.
                4. Visuals (Mermaid): IF explaining technical architectures or data flows, compose a clear flowchart or sequence diagram using Mermaid.js syntax inside a code block tagged with ```mermaid.
                5. The Human Touch: Write with high authority, empathy, and clarity. Do NOT use robotic AI tells like "In conclusion," "As an AI model," or "Here is your blog".
                """;

            SystemPrompt prompt = new SystemPrompt(promptName, defaultPromptText);
            systemPromptRepository.save(prompt);
            System.out.println("Seeded default TECH_BLOG_PROMPT");
        }
    }
}
