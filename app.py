import os

from flask import Flask, render_template, request
from youtube_transcript_api import TranscriptsDisabled

from services import video_processor
from utils import file_io
from utils.logging_config import setup_logging

# ============================================================================
# App Configuration
# ============================================================================

app = Flask(__name__)
setup_logging(app)


@app.before_request
def log_request_info():
    app.logger.info(
        "Request: %s %s from %s", request.method, request.path, request.remote_addr
    )


@app.route("/", methods=["GET"])
def index() -> str:
    # Default to index.html, can be overridden by environment variable or other config
    html_file = os.environ.get("HTML_FILE", "index.html")
    return render_template(html_file)


@app.route("/api/timestamp/generate", methods=["POST"])
async def generate_timestamps() -> str | tuple[str, int]:
    if request.method == "POST":
        # MOCK_FILE env var can be used for testing
        mock_file = os.environ.get("MOCK_FILE")
        if mock_file:
            app.logger.info(f"Mock mode enabled. Reading from {mock_file}")
            try:
                timestamps = await file_io.async_read_file(mock_file)
                return timestamps, 200
            except Exception:
                app.logger.exception("Error reading mock file")
                return "Error reading mock file", 500

        try:
            data = request.get_json()
            if not data or "url" not in data:
                app.logger.warning("Bad Request: 'url' missing from request body")
                return "Error: 'url' is a required field.", 400

            url = data.get("url")
            additional_instruction = data.get("additional_instruction", "")
            language = data.get("language", "auto")

            app.logger.info(f"Processing timestamp for URL: {url}")
            timestamps = await video_processor.process_video_timestamp(
                url, additional_instruction, language
            )
            app.logger.info(f"Successfully generated timestamps for URL: {url}")
            return timestamps, 200

        except TranscriptsDisabled as e:
            app.logger.warning(f"Transcripts are disabled for URL {data.get('url', '')}: {e}")
            return "Could not generate timestamps because transcripts are disabled for this video.", 400
        except Exception:
            app.logger.exception("An unexpected error occurred during timestamp generation.")
            return "An internal server error occurred.", 500

    return "Method Not Allowed", 405


if __name__ == "__main__":
    app.logger.info("Starting Youtamp development server.")
    # In a production environment, use a proper WSGI server like Gunicorn or uWSGI
    app.run(debug=True, host="0.0.0.0", port=45334)
