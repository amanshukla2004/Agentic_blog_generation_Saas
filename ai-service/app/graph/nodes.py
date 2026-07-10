from app.graph.state import GraphState
from app.schemas import BlogOutputSchema
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def context_extractor_node(state: GraphState) -> dict:
    """
    Step 1: Parses inputs and merges them into a single context string.
    This aggregates everything the AI needs to know into one massive string.
    """
    logger.info("Extracting and aggregating all parsed context from inputs")
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
        
    context_str = "\n\n".join(parts)
    logger.info(f"Aggregated context length: {len(context_str)} characters")
    return {"extracted_context": context_str}

def context_optimizer_node(state: GraphState) -> dict:
    """
    Step 2: Enforces token limits by truncating context if necessary.
    Prevents 400 Payload Too Large errors from Groq/Llama 3.
    """
    logger.info("Optimizing context length to fit within LLM token limits")
    context = state.get("extracted_context", "")
    max_chars = 30000
    if len(context) > max_chars:
        optimized = context[:max_chars] + "\n...[TRUNCATED TO OPTIMIZE FOOTPRINT]"
    else:
        optimized = context
    return {"optimized_context": optimized}

def single_generation_node(state: GraphState) -> dict:
    """Uses LLM with structured output to generate the blog in one API call."""
    logger.info("Invoking LLM to generate the final structured blog output")
    llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")
    structured_llm = llm.with_structured_output(BlogOutputSchema, method="json_mode")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "{system_prompt}"),
        ("user", "{context}")
    ])
    
    chain = prompt | structured_llm
    
    result: BlogOutputSchema = chain.invoke({
        "system_prompt": state.get("system_prompt", ""),
        "context": state.get("optimized_context", "")
    })
    
    logger.info(f"LLM successfully returned generated blog structure with title: {result.title}")
    return {"blog_output": result.model_dump()}
