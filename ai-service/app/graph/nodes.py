from app.graph.state import GraphState
from app.schemas import BlogOutputSchema
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

def context_extractor_node(state: GraphState) -> dict:
    """
    Step 1: Parses inputs and merges them into a single context string.
    This aggregates everything the AI needs to know into one massive string.
    """
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
    """
    Step 2: Enforces token limits by truncating context if necessary.
    Prevents 400 Payload Too Large errors from Groq/Llama 3.
    """
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
        ("system", "{system_prompt}"),
        ("user", "{context}")
    ])
    
    chain = prompt | structured_llm
    
    result: BlogOutputSchema = chain.invoke({
        "system_prompt": state.get("system_prompt", ""),
        "context": state.get("optimized_context", "")
    })
    
    return {"blog_output": result.model_dump()}
