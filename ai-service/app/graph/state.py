from typing import TypedDict, Optional

class GraphState(TypedDict):
    topic: Optional[str]
    youtube_transcript: Optional[str]
    raw_text: Optional[str]
    pdf_text: Optional[str]
    website_text: Optional[str]
    
    extracted_context: str
    optimized_context: str
    
    blog_output: Optional[dict] # Will hold title, seo_description, markdown_content
