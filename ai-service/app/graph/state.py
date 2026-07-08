from typing import TypedDict, Optional

class GraphState(TypedDict, total=False):
    # --- Input Data (from user/API) ---
    topic: Optional[str]
    youtube_transcript: Optional[str]
    raw_text: Optional[str]
    pdf_text: Optional[str]
    website_text: Optional[str]
    
    # --- Generated Pipeline State ---
    extracted_context: Optional[str]  # Combined raw text from all sources
    optimized_context: Optional[str]  # Truncated context to fit LLM limits
    
    # --- Final Output ---
    blog_output: Optional[dict] # Will hold title, seo_description, markdown_content
