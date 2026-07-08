from pydantic import BaseModel, Field
from typing import List, Optional

class BlogOutputSchema(BaseModel):
    title: str = Field(description="An engaging, high-intent SEO H1 title.")
    seo_description: str = Field(description="A highly optimized meta description (under 160 characters).")
    tags: List[str] = Field(description="An array of relevant programming language or framework keywords.")
    hero_image_keyword: str = Field(description="A 1-2 word clear search term for fetching a cover photo (e.g., 'kubernetes', 'database').")
    markdown_content: str = Field(description="The complete body of the technical blog post in valid Markdown format.")

class BlogReviseRequest(BaseModel):
    current_markdown: str = Field(description="The existing blog markdown content that needs to be revised.")
    instruction: str = Field(description="The user's instruction on how to revise the blog (e.g., 'make it funnier', 'add a section about X').")

class BlogReviseResponse(BaseModel):
    revised_markdown: str = Field(description="The newly generated markdown content after applying the revision instruction.")

class FinalBlogResponse(BaseModel):
    blog: BlogOutputSchema
    source_context: Optional[str] = Field(None, description="The raw transcribed or extracted data used by the AI.")
