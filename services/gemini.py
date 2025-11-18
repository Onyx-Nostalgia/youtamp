from aiolimiter import AsyncLimiter
from google import genai
from google.genai.errors import APIError
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

import config
from utils import file_io


def is_gemini_overloaded(exception):
    """
    Determines if a given exception indicates that the Gemini API is overloaded or rate-limited.
    Args:
        exception (Exception): The exception object to check, typically raised during API calls.
    Returns:
        bool: True if the exception corresponds to an overloaded 
        or rate-limited API (HTTP 503 or 429), False otherwise.
    Notes:
        - HTTP 503 indicates the service is temporarily unavailable or overloaded.
        - HTTP 429 indicates the rate limit has been exceeded.
    """
    if isinstance(exception, APIError):
        error_code = getattr(exception, 'code', None) or getattr(exception, 'status_code', None)
        
        if error_code in [503, 429]:
            # 503:  "UNAVAILABLE" The service may be temporarily overloaded or down
            # 429:  "RESOURCE_EXHAUSTED" You've exceeded the rate limit.
            print(f"⚠️ Found Error {error_code} (Overloaded/Limit) -> Retry...")
            return True
            
    return False

# RPM 10 = 10 requests per 60 seconds
RATE_LIMITER = AsyncLimiter(max_rate=9, time_period=60)

client = genai.Client(api_key=config.API_KEY)

generation_config = {
    "temperature": 0.4,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 16384,
    "response_mime_type": "text/plain",
}

system_instruction = """
You are an intelligent video content analyzer. Your task is to extract timestamped chapters from a YouTube video transcript.

**Input Data:**
1. **Transcript**
2. **Target Language** (e.g., Thai, English, Same as Transcript)

**Instructions:**

1. **Analyze Content & Strategy:**
   - **Determine Content Type:** 
     - First, read the transcript to determine the nature of the content and apply the extraction logic accordingly
     - **Q&A / Interview:** If the content consists of questions, you MUST extract **every single question** start time.
     - **Tutorial / Step-by-Step:** Extract every major step.
     - **Storytelling / General:** Extract key topic transitions only.
   - **Determine Timestamp Format:**
     - Check the final timestamp in the transcript.
     - If the video is **under 1 hour**, use `MM:SS` format (e.g., 05:30, 59:45).
     - If the video is **1 hour or longer**, use `HH:MM:SS` format (e.g., 01:05:30).

2. **Labeling:**
   - Write labels in the **Target Language**.
   - Keep labels concise (1-6 words).
   - Use original English words for technical terms or specific loanwords.
   - If the Target Language is Thai, use English only for specific technical terms or loanwords (e.g., Sponsor, Member, Cosplay).

3. **Output Formatting:**
   - Format: `[Timestamp] - [Label]`
   - Example (Short video): `05:12 - Intro`
   - Example (Long video): `01:12:05 - Conclusion`
   - Output **ONLY** the list of timestamps. No conversational text.

**Example Output:**
00:00 - Start
02:15 - Introduction to the project
05:30 - What is the budget?
10:45 - Summary
"""

def generate_prompt(
    captions: str,
    additional_instructions: str,
    video_id: str,
    language: str = "Same as Transcript",
) -> str:
    transcript = f"""
**Target Language:** {language}
**Here is the transcript:**
{captions}
    """

    prompt_from_file = file_io.load_prompt_from_file(video_id)
    if prompt_from_file:
        return prompt_from_file

    return additional_instructions + transcript

@retry(
    stop=stop_after_attempt(5), 
    wait=wait_exponential(multiplier=1, min=4, max=20),
    retry=retry_if_exception(is_gemini_overloaded)
)
async def evaluate_timestamps(
    captions: str,
    additional_instructions: str = "",
    video_id: str = "",
    language: str = "Same as Transcript",
) -> list[str]:
    
    async with RATE_LIMITER:
        prompt = generate_prompt(captions, additional_instructions, video_id,language)
        await file_io.async_save_prompt_to_file(prompt, video_id)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={**generation_config, "system_instruction": system_instruction},
        )
        await file_io.async_save_response_to_file(response.text, video_id)

        output = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
        return output
