from pathlib import Path
import sys
from unittest.mock import patch

sys.path.append(
    str(
        Path(__file__).resolve().parent.parent
    )
)

import pytest

from cli.manage import main

SAMPLE_URL = "https://www.youtube.com/watch?v=Q9gxKxGLmkc&t=131s"


@pytest.fixture
def mock_processor():
    """
    Mocks the `process_video_timestamp` function to capture its calls
    without executing the actual service logic.
    """
    with patch("services.video_processor.process_video_timestamp") as mock:
        yield mock


# ============================================================================
# Group 1: Default & Positional URL
# ============================================================================


@pytest.mark.asyncio
async def test_cli_positional_url(mock_processor):
    """
    Test Case:
    cli.py https://...
    cli.py "https://..." (Quotes are handled by the shell before reaching Python)
    """
    # Simulate command-line arguments
    test_args = ["cli.py", SAMPLE_URL]

    with patch.object(sys, "argv", test_args):
        await main()

    # Assert that the function was called with the correct URL and default values
    mock_processor.assert_called_once_with(
        url=SAMPLE_URL, language="auto", additional_instruction=None
    )


# ============================================================================
# Group 2: Explicit URL Flags (-u / --url)
# ============================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("flag", ["-u", "--url"])
async def test_cli_url_flags(mock_processor, flag):
    """
    Test Case:
    cli.py -u https://...
    cli.py --url https://...
    """
    test_args = ["cli.py", flag, SAMPLE_URL]

    with patch.object(sys, "argv", test_args):
        await main()

    mock_processor.assert_called_once_with(
        url=SAMPLE_URL, language="auto", additional_instruction=None
    )


@pytest.mark.asyncio
async def test_cli_url_flag_equals(mock_processor):
    """
    Test Case:
    cli.py --url="https://..."
    """
    # argparse handles --url=... automatically
    test_args = ["cli.py", f"--url={SAMPLE_URL}"]

    with patch.object(sys, "argv", test_args):
        await main()

    mock_processor.assert_called_once_with(
        url=SAMPLE_URL, language="auto", additional_instruction=None
    )


# ============================================================================
# Group 3: Prompt Flag (-p / --prompt)
# ============================================================================


@pytest.mark.asyncio
async def test_cli_with_prompt(mock_processor):
    """
    Test Case:
    cli.py ... -p "i want 10 timestamp"
    """
    prompt_text = "i want 10 timestamp"
    test_args = ["cli.py", SAMPLE_URL, "-p", prompt_text]

    with patch.object(sys, "argv", test_args):
        await main()

    # Assert that the service was called with the correct prompt and other arguments.

    mock_processor.assert_called_once_with(
        url=SAMPLE_URL, language="auto", additional_instruction=prompt_text
    )


# ============================================================================
# Group 4: Language Flag (-l / --lang)
# ============================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("lang_val", ["th", "thai", "en", "english"])
async def test_cli_with_language(mock_processor, lang_val):
    """
    Test Case:
    cli.py ... -l th
    cli.py ... --lang english
    """
    test_args = ["cli.py", SAMPLE_URL, "-l", lang_val]

    with patch.object(sys, "argv", test_args):
        await main()

    # Assert that the language value (lang_val) was passed correctly.
    mock_processor.assert_called_once_with(
        url=SAMPLE_URL, language=lang_val, additional_instruction=None
    )