import asyncio
import datetime
import logging
import re

from youtube_transcript_api import YouTubeTranscriptApi

logger = logging.getLogger(__name__)


def extract_video_id(url_or_id: str) -> str:
    logger.info("Extracting video ID from URL/ID.")
    if len(url_or_id) == 11:
        logger.info("Input is 11 chars, assuming video ID.")
        return url_or_id
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url_or_id)
    video_id = match.group(1) if match else None
    if not video_id:
        logger.error("Invalid YouTube URL or ID provided.")
        raise ValueError("Invalid YouTube URL or ID.")
    logger.info(f"Extracted video ID: {video_id}")
    return video_id


def format_time(seconds: float) -> str:
    return str(datetime.timedelta(seconds=int(seconds)))


def get_transcript_lines(
    video_id: str, languages: list[str] | None = None
) -> list[str]:
    if languages is None:
        languages = ["th"]
    logger.info(f"Fetching transcript for {video_id} ({languages})")
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id=video_id, languages=languages)
        logger.info(f"Transcript received for {video_id}")
        return [
            f"{format_time(entry.start)} - {entry.text.replace('\n', ' ')}"
            for entry in transcript
        ]
    except Exception as e:
        logger.error(
            f"Transcript fetch failed for {video_id} ({languages}): {e}",
            exc_info=True,
        )
        raise


async def async_get_transcript_lines(
    video_id: str,
    languages: list[str] | None = None,
) -> list[str]:
    if languages is None:
        languages = ["th"]
    logger.info(f"Async fetching transcript for {video_id} ({languages})")

    def _fetch():
        return get_transcript_lines(video_id, languages)

    try:
        result = await asyncio.to_thread(_fetch)
        logger.info(f"Async transcript received for {video_id}")
        return result
    except Exception as e:
        logger.error(
            f"Async transcript fetch failed for {video_id}: {e}",
            exc_info=True,
        )
        raise
