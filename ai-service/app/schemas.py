from pydantic import BaseModel, Field
from typing import List

class BlogOutputSchema(BaseModel):
    title: str = Field(description="An engaging, high-intent SEO H1 title.")
    seo_description: str = Field(description="A highly optimized meta description (under 160 characters).")
    tags: List[str] = Field(description="An array of relevant programming language or framework keywords.")
    hero_image_keyword: str = Field(description="A 1-2 word clear search term for fetching a cover photo (e.g., 'kubernetes', 'database').")
    markdown_content: str = Field(description="The complete body of the technical blog post in valid Markdown format.")
