import re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_transcript_from_youtube(url: str) -> str:
    try:
        # Extract video ID
        video_id = None
        match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
        if match:
            video_id = match.group(1)
        
        if not video_id:
            return "ERROR: Malformed YouTube URL."
        
        # Try fetching transcript
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        
        # Try to get English manually created transcripts, fallback to generated English, fallback to first available
        try:
            # 1. Prefer high-quality human-made English transcripts
            transcript = transcript_list.find_manually_created_transcript(['en', 'en-US', 'en-GB'])
        except:
            try:
                # 2. Fallback to auto-generated English captions
                transcript = transcript_list.find_generated_transcript(['en', 'en-US', 'en-GB'])
            except:
                # 3. Absolute fallback: Just grab the first available transcript (might be in another language)
                transcript = list(transcript_list)[0]
            
        transcript_data = transcript.fetch()
        text = " ".join([t.text for t in transcript_data])
        return text
    except Exception as e:
        return f"ERROR: Failed to extract YouTube transcript. {str(e)}"
