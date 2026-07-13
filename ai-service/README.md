# 🧠 AI Generation Service — FastAPI & LangGraph

> FastAPI | LangGraph | Groq (Llama 3.3 70B) | Pydantic v2 | Python 3.10+

The AI orchestration engine for the Agentic Blog Generation SaaS. This microservice sits behind the Spring Boot API Gateway (never directly exposed to end users) and processes multi-modal inputs through a stateful 3-node LangGraph pipeline to generate structured, markdown-formatted blog posts with auto-generated cover images.

---

## 🏗️ Architecture

```mermaid
sequenceDiagram
    participant Gateway as Spring Boot Gateway
    participant API as FastAPI (/generate-multimodal)
    participant Extract as Multi-Modal Extractors
    participant Graph as LangGraph Pipeline
    participant LLM as Groq Llama 3.3 70B

    Gateway->>API: POST Multipart + X-Internal-Secret
    API->>API: Validate internal secret
    
    par Input Extraction
        API->>Extract: PDF bytes → pypdf PdfReader
        API->>Extract: YouTube URL → transcript_api (EN fallback)
        API->>Extract: Website URL → SSRF-protected BeautifulSoup
    end
    
    Extract-->>API: Extracted text from each source
    
    API->>Graph: invoke(initial_state)
    
    Note over Graph: Node 1: context_extractor<br>Aggregates all sources into single string
    Note over Graph: Node 2: context_optimizer<br>Truncates to 30,000 chars
    Note over Graph: Node 3: single_generation<br>ChatGroq + structured JSON output
    
    Graph->>LLM: System Prompt + Optimized Context
    LLM-->>Graph: BlogOutputSchema JSON
    Graph-->>API: blog_output dict
    
    API->>API: Prepend Pollinations.ai cover image
    API-->>Gateway: FinalBlogResponse
```

---

## 📦 Project Structure

```text
ai-service/
├── app/
│   ├── main.py               # FastAPI app with 3 endpoints
│   ├── config.py              # pydantic_settings: GROQ_API_KEY, INTERNAL_GATEWAY_SECRET, ENV
│   ├── schemas.py             # Pydantic models for request/response validation
│   ├── graph/
│   │   ├── state.py           # TypedDict GraphState (7 fields: inputs → pipeline → output)
│   │   ├── workflow.py        # StateGraph builder: 3 nodes → END
│   │   ├── nodes.py           # Node implementations (extract, optimize, generate)
│   │   └── revise_workflow.py # Blog revision pipeline (separate from main generation)
│   └── utils/
│       ├── pdf_extractor.py   # pypdf PdfReader with scanned-image detection
│       ├── yt_extractor.py    # youtube_transcript_api with 3-tier fallback (manual EN → auto EN → any)
│       └── web_scraper.py     # SSRF-protected web scraper (validates against private/loopback IPs)
├── requirements.txt
└── .env
```

---


## 🧩 LangGraph Pipeline Details

### Node 1: Context Extractor (`context_extractor_node`)
Aggregates all non-empty input sources into a single context string:
```text
Topic: {topic}
Raw Text Input: {raw_text}
PDF Content: {pdf_text}
Website Content: {website_text}
YouTube Transcript: {youtube_transcript}
```

### Node 2: Context Optimizer (`context_optimizer_node`)
Truncates the aggregated context to **30,000 characters** max to prevent Groq API token overflow errors. Appends `[TRUNCATED TO OPTIMIZE FOOTPRINT]` when truncation occurs.

### Node 3: Single Generation (`single_generation_node`)
Invokes `ChatGroq` (Llama 3.3 70B Versatile) with `structured_output` (JSON mode) using the `BlogOutputSchema` Pydantic model. This ensures the LLM always returns valid, schema-conforming JSON.

---

## 🚀 Quick Start

```bash
cd ai-service

# Create and activate virtual environment
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

## 🔐 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
INTERNAL_GATEWAY_SECRET=my-super-secret-internal-key-for-ai-worker
ENV=development
```
