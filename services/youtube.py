import datetime
import re

from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url_or_id: str) -> str:
    if len(url_or_id) == 11:
        return url_or_id
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url_or_id)
    video_id = match.group(1) if match else None
    if not video_id:
        raise ValueError("Invalid YouTube URL or ID.")
    return video_id


def format_time(seconds: float) -> str:
    return str(datetime.timedelta(seconds=int(seconds)))


def get_transcript_lines(video_id: str, languages: list[str] | None = None) -> list[str]:
    if languages is None:
        languages = ["th"]
    transcript = YouTubeTranscriptApi().fetch(video_id=video_id, languages=languages)
    return [
        f"{format_time(entry.start)} - {entry.text.replace('\n', ' ')}" for entry in transcript
    ]
