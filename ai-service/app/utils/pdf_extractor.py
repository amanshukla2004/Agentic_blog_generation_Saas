import io
import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Reads a raw PDF byte stream in memory and extracts text page by page.
    """
    logger.info("Starting PDF text extraction from byte stream")
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        # Failsafe if the PDF was just scanned images without OCR text layer
        if not text.strip():
            logger.warning("PDF extraction returned empty text. Possible scanned image.")
            return "ERROR: PDF extraction returned empty text. Ensure PDF is not a scanned image."
            
        logger.info(f"Successfully extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        logger.error(f"Failed to extract PDF content: {str(e)}")
        return f"ERROR: Failed to extract PDF content. {str(e)}"
