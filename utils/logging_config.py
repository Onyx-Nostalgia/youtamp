import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path

from flask import Flask


class EmojiFormatter(logging.Formatter):
    """A custom log formatter that adds an emoji corresponding to the log level."""

    LEVEL_EMOJIS = {
        logging.DEBUG: "🐛",
        logging.INFO: "📝",
        logging.WARNING: "⚠️",
        logging.ERROR: "❌",
        logging.CRITICAL: "🔥",
    }

    def format(self, record):
        # Get the original formatter's output
        s = super().format(record)
        # Prepend the emoji
        emoji = self.LEVEL_EMOJIS.get(record.levelno, "➡️")
        return f"{emoji} {s}"


def setup_logging(app: Flask) -> None:
    """Configures logging for the Flask application."""
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    # Determine log level from environment variable, default to INFO
    log_level_str = os.environ.get("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Set up a rotating file handler
    file_handler = RotatingFileHandler(
        log_dir / "app.log", maxBytes=10240, backupCount=10
    )

    # Use the custom EmojiFormatter and a cleaner format
    formatter = EmojiFormatter(
        "%(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)

    # Remove default handlers and add our custom one
    app.logger.handlers = []
    app.logger.addHandler(file_handler)
    app.logger.setLevel(log_level)

    # Also configure the root logger
    logging.basicConfig(level=log_level, handlers=[file_handler])
