# AI Service

This is the Python FastAPI microservice that handles the core AI functionality: extracting text from URLs/PDFs/YouTube, and generating/revising blogs using LangGraph and Groq.

## Prerequisites
- Python 3.10+

## Development Setup
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables (e.g., in a `.env` file):
   - `GROQ_API_KEY`
   - `INTERNAL_GATEWAY_SECRET`
4. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
