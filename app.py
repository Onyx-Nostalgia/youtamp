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
def generate_timestamps() -> str | tuple[str, int]:
    if request.method == "POST":
        error = ""
        timestamps = ""
        try:
            data = request.get_json()
            url = data.get("url")
            additional_instruction = data.get("additional_instruction", "")
            language = data.get("language", "auto")
            
            video_id = youtube.extract_video_id(url)
            language = format_language(language)

            # Default to Thai, can be parameterized later if needed
            captions_list = youtube.get_transcript_lines(video_id, language)
            captions = "\n".join(captions_list)

            raw_output = gemini.evaluate_timestamps(
                captions,
                additional_instruction,
                video_id,
            )

            file_io.save_timestamps_to_file(raw_output, video_id)

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
    args = parser.parse_args()
    app.config["HTML_FILE"] = args.file
    app.run(debug=True)


if __name__ == "__main__":
    main()
