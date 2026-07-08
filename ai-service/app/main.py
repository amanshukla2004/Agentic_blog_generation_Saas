from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form, Body
from typing import Optional
from app.config import settings
from app.graph.workflow import graph
from app.utils.pdf_extractor import extract_text_from_pdf
from app.utils.yt_extractor import extract_transcript_from_youtube
from app.utils.web_scraper import extract_text_from_url
from app.schemas import BlogOutputSchema, BlogReviseRequest, BlogReviseResponse, FinalBlogResponse
from app.graph.revise_workflow import revise_blog_content

app = FastAPI(title="AI Worker Microservice")

def verify_internal_secret(x_internal_secret: str = Header(...)):
    """
    Security Bouncer: Validates that incoming requests have the correct internal secret.
    This prevents external users from directly hitting this unauthenticated worker.
    """
    if settings.ENV != "development":
        if x_internal_secret != settings.INTERNAL_GATEWAY_SECRET:
            raise HTTPException(status_code=403, detail="Forbidden: Invalid internal gateway secret")
    return x_internal_secret

def prepend_unsplash_image(blog_data: dict) -> dict:
    keyword = blog_data.get("hero_image_keyword", "technology")
    # Using Pollinations.ai as a reliable, free image placeholder generator
    image_markdown = f"![Cover Image](https://image.pollinations.ai/prompt/{keyword}?width=1200&height=600&nologo=true)\n\n"
    blog_data["markdown_content"] = image_markdown + blog_data.get("markdown_content", "")
    return blog_data

@app.post("/api/v1/blogs/generate-multimodal", response_model=FinalBlogResponse)
async def generate_multimodal(
    topic: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    youtube_url: Optional[str] = Form(None),
    raw_text: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None),
    secret: str = Depends(verify_internal_secret)
):
    # Extract text from various sources. If extraction returns an ERROR string, we log it and keep it empty to prevent confusing the AI.
    pdf_text = ""
    if pdf_file:
        content = await pdf_file.read()
        res = extract_text_from_pdf(content)
        pdf_text = "" if res.startswith("ERROR:") else res
        
    youtube_transcript = ""
    if youtube_url:
        res = extract_transcript_from_youtube(youtube_url)
        youtube_transcript = "" if res.startswith("ERROR:") else res
        
    website_text = ""
    if website_url:
        res = extract_text_from_url(website_url)
        website_text = "" if res.startswith("ERROR:") else res
        
    # If topic is not provided, AI will infer it from the context
    inferred_topic = topic if topic else "Infer the topic from the provided context."
        
    initial_state = {
        "topic": inferred_topic,
        "youtube_transcript": youtube_transcript,
        "raw_text": raw_text,
        "pdf_text": pdf_text,
        "website_text": website_text
    }
    
    result = graph.invoke(initial_state)
    
    blog_output = result.get("blog_output")
    if not blog_output:
        raise HTTPException(status_code=500, detail="Failed to generate blog output")
        
    blog_output = prepend_unsplash_image(blog_output)
    
    return FinalBlogResponse(
        blog=blog_output,
        source_context=result.get("extracted_context")
    )

@app.post("/api/v1/blogs/revise", response_model=BlogReviseResponse)
async def revise_blog(
    request: BlogReviseRequest = Body(...),
    secret: str = Depends(verify_internal_secret)
):
    try:
        revised_response = revise_blog_content(request)
        return revised_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Revision failed: {str(e)}")
