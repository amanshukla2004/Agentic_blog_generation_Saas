import requests
import logging
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

def extract_text_from_url(url: str) -> str:
    """
    Fetches a webpage and extracts clean, readable text by stripping out HTML tags, 
    scripts, and styles.
    """
    logger.info(f"Starting web scraping for URL: {url}")
    try:
        # Provide a common user agent to prevent basic blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove structural and functional elements that don't contain article content
        for script in soup(["script", "style", "noscript", "header", "footer", "nav"]):
            script.decompose()
            
        text = soup.get_text(separator="\n")
        
        # Clean up empty lines and normalize whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)
        
        if not clean_text:
            logger.warning("Web scraper returned empty text. Page might be JS rendered.")
            return "ERROR: Web scraper returned empty text. The page might be heavily JavaScript-rendered."
            
        logger.info(f"Successfully scraped and extracted {len(clean_text)} characters of text")
        return clean_text
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch the website URL: {str(e)}")
        return f"ERROR: Failed to fetch the website URL. {str(e)}"
    except Exception as e:
        logger.error(f"Web scraping failed: {str(e)}")
        return f"ERROR: Web scraping failed. {str(e)}"
