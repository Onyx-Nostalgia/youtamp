from collections.abc import Iterable

from flask import Flask, render_template, request

from services import gemini, youtube
from utils import file_io

app = Flask(__name__)


def format_timestamps(timestamps: Iterable[str]) -> str:
    return "\n".join(timestamps)


@app.route("/", methods=["GET", "POST"])
def index() -> str | tuple[str, int]:
    if request.method == "GET":
        return render_template("index.html")

    if request.method == "POST":
        error = ""
        timestamps = ""
        try:
            data = request.get_json()
            url = data.get("video_id")
            additional_instructions = data.get("additional_instructions", "")
            video_id = youtube.extract_video_id(url)

            # Default to Thai, can be parameterized later if needed
            languages = ["th"]
            captions_list = youtube.get_transcript_lines(video_id, languages)
            captions = "\n".join(captions_list)

            raw_output = gemini.evaluate_timestamps(
                captions,
                additional_instructions,
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
    app.run(debug=True)


if __name__ == "__main__":
    main()
