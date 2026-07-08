import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        if not text.strip():
            return "ERROR: PDF extraction returned empty text. Ensure PDF is not a scanned image."
            
        return text
    except Exception as e:
        return f"ERROR: Failed to extract PDF content. {str(e)}"
