from app.graph.state import GraphState
from app.schemas import BlogOutputSchema
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

def context_extractor_node(state: GraphState) -> dict:
    """Parses inputs and merges them into a single context string."""
    parts = []
    if state.get("topic"):
        parts.append(f"Topic: {state['topic']}")
    if state.get("raw_text"):
        parts.append(f"Raw Text Input: {state['raw_text']}")
    if state.get("pdf_text"):
        parts.append(f"PDF Content: {state['pdf_text']}")
    if state.get("website_text"):
        parts.append(f"Website Content: {state['website_text']}")
    if state.get("youtube_transcript"):
        parts.append(f"YouTube Transcript: {state['youtube_transcript']}")
        
    return {"extracted_context": "\n\n".join(parts)}

def context_optimizer_node(state: GraphState) -> dict:
    """Enforces token limits by truncating context if necessary."""
    context = state.get("extracted_context", "")
    max_chars = 30000
    if len(context) > max_chars:
        optimized = context[:max_chars] + "\n...[TRUNCATED TO OPTIMIZE FOOTPRINT]"
    else:
        optimized = context
    return {"optimized_context": optimized}

def single_generation_node(state: GraphState) -> dict:
    """Uses LLM with structured output to generate the blog in one API call."""
    llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")
    structured_llm = llm.with_structured_output(BlogOutputSchema, method="json_mode")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert Lead Backend Engineer and AI Architect writing an engaging blog post. 
Given the provided context, generate a comprehensive blog post in markdown format. Adapt your tone and structure based on whether the topic is technical/coding-related or general/non-technical.

CRITICAL INSTRUCTION: You must respond in strictly valid JSON with exactly five keys: 'title', 'seo_description', 'tags', 'hero_image_keyword', and 'markdown_content'. The 'markdown_content' value MUST be a single string wrapped in double quotes. You MUST escape all newlines in the markdown as \\n and all double quotes as \\\". Do NOT output raw unescaped newlines.

CONTENT CONSTRAINTS FOR 'markdown_content':
1. Adaptive Structure: IF the topic is technical/coding, begin with an environment setup/prerequisites block. IF non-technical, start with a highly engaging, relatable introduction. Follow up with logical H2 and H3 sections.
2. Code Blocks: IF the topic involves code, all code samples must be fully written out (no lazy placeholders) and wrapped in markdown code fences specifying the exact language (e.g., ```python).
3. Detailed Breakdown: For coding topics, every major code snippet must be followed by a numbered mechanical explanation. For non-coding topics, use bullet points to break down complex ideas clearly.
4. Visuals (Mermaid): IF explaining technical architectures or data flows, compose a clear flowchart or sequence diagram using Mermaid.js syntax inside a code block tagged with ```mermaid.
5. The Human Touch: Write with high authority, empathy, and clarity. Do NOT use robotic AI tells like "In conclusion," "As an AI model," or "Here is your blog".
"""),
        ("user", "{context}")
    ])
    
    chain = prompt | structured_llm
    
    result: BlogOutputSchema = chain.invoke({"context": state.get("optimized_context", "")})
    
    return {"blog_output": result.model_dump()}
