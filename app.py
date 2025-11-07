import argparse
from collections.abc import Iterable

from flask import Flask, render_template, request

from services import gemini, youtube
from utils import file_io

app = Flask(__name__)


def format_timestamps(timestamps: Iterable[str]) -> str:
    return "\n".join(timestamps)

def format_language(language: str) -> list[str]:
    if language.lower() == "auto":
        return ["th"]
    return [language.lower()]


@app.route("/", methods=["GET"])
def index() -> str:
    return render_template(app.config["HTML_FILE"])


@app.route("/api/timestamp/generate", methods=["POST"])
async def generate_timestamps() -> str | tuple[str, int]:
    if request.method == "POST":
        error = ""
        timestamps = ""
        if app.config["MOCK"]:
            timestamps = await file_io.async_read_file(app.config["MOCK"])
            return timestamps, 200
        try:
            data = request.get_json()
            url = data.get("url")
            additional_instruction = data.get("additional_instruction", "")
            language = data.get("language", "auto")

            video_id = youtube.extract_video_id(url)
            language = format_language(language)

            captions_list = await youtube.async_get_transcript_lines(video_id, language)
            captions = "\n".join(captions_list)

            raw_output = await gemini.async_evaluate_timestamps(
                captions,
                additional_instruction,
                video_id,
            )

            await file_io.async_save_timestamps_to_file(raw_output, video_id)

            timestamps = format_timestamps(raw_output)

        except Exception as e:
            error = f"Error: {e!s}"

        if error:
            return error, 400
        return timestamps, 200
    return "", 405


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the Flask app with a specified HTML template."
    )
    parser.add_argument(
        "--file",
        type=str,
        default="index.html",
        help="The HTML file to render (e.g., 'index.html').",
    )
    parser.add_argument(
        "--mock",
        type=str,
        default=None,
        help="Enable mock mode by providing a path to a mock file relative to the 'artifacts' directory (e.g., '4Jb35R2MZ_c/timestamps.txt').",
    )
    args = parser.parse_args()
    app.config["HTML_FILE"] = args.file
    app.config["MOCK"] = args.mock
    app.run(debug=True)


if __name__ == "__main__":
    main()
