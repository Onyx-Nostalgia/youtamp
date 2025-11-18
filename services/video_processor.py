import logging
from collections.abc import Iterable

from services import gemini, youtube
from utils import file_io

logger = logging.getLogger(__name__)


def format_timestamps(timestamps: Iterable[str]) -> str:
    logger.info("Formatting final timestamps.")
    return "\n".join(timestamps)


def format_language(language: str) -> list[str]:
    if language.lower() == "auto":
        logger.info("Language 'auto', using ['th'].")
        return ["th"]
    lang_list = [language.lower()]
    logger.info(f"Language set to {lang_list}.")
    return lang_list


async def process_video_timestamp(
    url: str, additional_instruction: str, language: str
) -> str:
    logger.info(f"Processing URL: {url}")
    try:
        video_id = youtube.extract_video_id(url)
        logger.info(f"Video ID: {video_id}")

        lang_list = format_language(language)

        logger.info(f"Fetching transcript for {video_id} ({lang_list})")
        captions_list = await youtube.async_get_transcript_lines(video_id, lang_list)
        captions = "\n".join(captions_list)
        logger.info(f"Transcript received for {video_id}")

        logger.info(f"Sending to Gemini for {video_id}")
        raw_output = await gemini.evaluate_timestamps(
            captions,
            additional_instruction,
            video_id,
            language=language,
        )
        logger.info(f"Gemini evaluation complete for {video_id}")

        await file_io.async_save_timestamps_to_file(raw_output, video_id)

        timestamps = format_timestamps(raw_output)
        logger.info(f"Finished processing for {url}")
        return timestamps
    except Exception as e:
        logger.error(
            f"Processing failed for {url}: {e}",
            exc_info=True,
        )
        raise