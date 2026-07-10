# Agentic Blog Generation SaaS

A full-stack application that leverages AI to generate and revise blog posts from various sources like PDFs, YouTube videos, and websites.

## Architecture
The platform is split into three main microservices:

1. **Frontend**: A React application built with Vite and Tailwind CSS. Provides an interactive UI to generate, manage, and view blogs.
2. **Gateway Service**: A Java Spring Boot service that handles user authentication, JWT token generation, routing, and database persistence.
3. **AI Service**: A Python FastAPI service that orchestrates LLMs using LangGraph to scrape content, transcribe videos, read PDFs, and generate well-formatted Markdown blog posts.

## Getting Started
Please refer to the `DEPLOYMENT_GUIDE.md` for detailed instructions on how to set up, build, and deploy the application. Each service also has its own `README.md` with development instructions.
