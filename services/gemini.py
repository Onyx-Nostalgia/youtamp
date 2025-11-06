from google import genai

import config
from models import Timestamp
from utils import file_io

client = genai.Client(api_key=config.API_KEY)

generation_config = {
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 16384,
    "response_mime_type": "application/json",
    "response_schema": list[Timestamp],
}

system_instruction = """
You are given a YouTube video transcript with timestamps. Your task is to extract only the important or meaningful moments from the transcript.

🎯 For each important moment:
- Include the timestamp (HH:MM:SS format if possible, otherwise MM:SS)
    - If the video is less than 1 hour, use MM:SS format.
    - If the video is 1 hour or longer, use HH:MM:SS format
- Write just 1 to 5 words describing what's happening
- The number of characters must not exceed 1000 characters (based on YouTube's comment character limit).

* ✅ I want only the timestamps and labels, nothing else.
* ✅ I want to use Thai, but if there are words that can be transliterated into English (such as sponsor, member, project), use the English word.
* Skip unimportant lines or filler content.

Example HH:MM:SS format output:
[
  {"timestamp": "00:00:05", "label": "Start"},
  {"timestamp": "00:02:15", "label": "เรื่องมันมีอยู่ว่า..."},
  {"timestamp": "01:15:30", "label": "สรุป" }
]
Example MM:SS format output:
[
  {"timestamp": "00:05", "label": "Start"},
  {"timestamp": "02:15", "label": "เรื่องมันมีอยู่ว่า..."},
  {"timestamp": "15:30", "label": "สรุป"}
]

"""


def generate_prompt(
    captions: str,
    additional_instructions: str,
    video_id: str,
) -> str:
    transcript = f"""
    Here is the transcript:
    {captions}
    """

    prompt_from_file = file_io.load_prompt_from_file(video_id)
    if prompt_from_file:
        return prompt_from_file

    return additional_instructions + transcript


def evaluate_timestamps(
    captions: str,
    additional_instructions: str = "",
    video_id: str = "",
) -> list[str]:
    prompt = generate_prompt(captions, additional_instructions, video_id)
    file_io.save_prompt_to_file(prompt, video_id)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={**generation_config, "system_instruction": system_instruction},
    )
    file_io.save_response_to_file(response.text, video_id)

    my_timestamps: list[Timestamp] = response.parsed

    output = [f"{ts.timestamp} {ts.label}" for ts in my_timestamps]
    return output
