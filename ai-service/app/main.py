from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form
from typing import Optional
from app.config import settings
from app.graph.workflow import graph
from app.utils.pdf_extractor import extract_text_from_pdf
from app.utils.yt_extractor import extract_transcript_from_youtube
from app.schemas import BlogOutputSchema

app = FastAPI(title="AI Worker Microservice")

def verify_internal_secret(x_internal_secret: str = Header(...)):
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

@app.post("/api/v1/blogs/generate-multimodal", response_model=BlogOutputSchema)
async def generate_multimodal(
    topic: str = Form(...),
    youtube_url: Optional[str] = Form(None),
    raw_text: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None),
    secret: str = Depends(verify_internal_secret)
):
    pdf_text = ""
    if pdf_file:
        content = await pdf_file.read()
        pdf_text = extract_text_from_pdf(content)
        
    youtube_transcript = ""
    if youtube_url:
        youtube_transcript = extract_transcript_from_youtube(youtube_url)
        
    initial_state = {
        "topic": topic,
        "youtube_transcript": youtube_transcript,
        "raw_text": raw_text,
        "pdf_text": pdf_text
    }
    
    result = graph.invoke(initial_state)
    
    blog_output = result.get("blog_output")
    if not blog_output:
        raise HTTPException(status_code=500, detail="Failed to generate blog output")
        
    blog_output = prepend_unsplash_image(blog_output)
    
    return blog_output
