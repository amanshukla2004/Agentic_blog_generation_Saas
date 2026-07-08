from app.schemas import BlogReviseRequest, BlogReviseResponse
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

def revise_blog_content(request: BlogReviseRequest) -> BlogReviseResponse:
    """Uses LLM to revise existing markdown content based on user instructions."""
    llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")
    structured_llm = llm.with_structured_output(BlogReviseResponse, method="json_mode")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert Lead Backend Engineer and AI Architect acting as a strict editor.
Given the original markdown blog content and the user's specific instruction, rewrite or modify the content to perfectly fulfill the instruction.

CRITICAL INSTRUCTION: You must respond in strictly valid JSON with exactly one key: 'revised_markdown'. 
The 'revised_markdown' value MUST be a single string wrapped in double quotes. 
You MUST escape all newlines in the markdown as \\n and all double quotes as \\\". Do NOT output raw unescaped newlines.
"""),
        ("user", "User Instruction:\n{instruction}\n\nOriginal Content:\n{current_markdown}")
    ])
    
    chain = prompt | structured_llm
    
    result: BlogReviseResponse = chain.invoke({
        "instruction": request.instruction,
        "current_markdown": request.current_markdown
    })
    
    return result
