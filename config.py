import os
from pathlib import Path


def get_bool_env(name: str, default: str = "False") -> bool:
    """Gets a boolean value from an environment variable."""
    return os.environ.get(name, default).lower() == "true"


# --- Gemini API ---
API_KEY: str | None = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

# --- Prompt Engineering ---
LOAD_PROMPT: bool = get_bool_env("LOAD_PROMPT")
SAVE_PROMPT: bool = get_bool_env("SAVE_PROMPT")
SAVE_RESPONSE: bool = get_bool_env("SAVE_RESPONSE")

# --- File System ---
PROJECT_ROOT: Path = Path(__file__).resolve()
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
