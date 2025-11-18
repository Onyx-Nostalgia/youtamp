from collections.abc import Iterable

from services import gemini, youtube
from utils import file_io


def format_timestamps(timestamps: Iterable[str]) -> str:
    return "\n".join(timestamps)

def format_language(language: str) -> list[str]:
    if language.lower() == "auto":
        return ["th"]
    return [language.lower()]

async def process_video_timestamp(url:str,additional_instruction:str,language:str) -> str:

    video_id = youtube.extract_video_id(url)
    language = format_language(language)

    captions_list = await youtube.async_get_transcript_lines(video_id, language)
    captions = "\n".join(captions_list)

    raw_output = await gemini.evaluate_timestamps(
        captions,
        additional_instruction,
        video_id,
    )

    await file_io.async_save_timestamps_to_file(raw_output, video_id)

    timestamps = format_timestamps(raw_output)

    return timestamps