import argparse
import asyncio
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))

from services import video_processor


async def main():
    # 1. Create the argument parser
    parser = argparse.ArgumentParser(
        description="YouTube Timestamp Generator CLI Tool",
        epilog="Example: python cli.py -u https://youtube.com/... -l th",
    )

    # 2. Define arguments

    # --- URL Group (supports both positional and -u flag) ---
    # Technique: Create an optional positional argument (?) 
    # to capture the URL if no flag is provided
    parser.add_argument("url_pos", nargs="?", help="YouTube URL")

    # Create -u / --url flags for explicit URL input
    parser.add_argument("-u", "--url", dest="url_flag", help="YouTube URL")

    # --- Prompt (-p / --prompt) ---
    parser.add_argument(
        "-p",
        "--prompt",
        type=str,
        default=None,  # Defaults to None if not provided
        dest="additional_instruction",
        help="Additional instruction for AI",
    )

    # --- Language (-l / --lang) ---
    parser.add_argument(
        "-l",
        "--lang",
        type=str,
        default="auto",  # Default value as per requirements
        help='Target language (e.g., th, en). Default is "auto"',
    )

    # 3. Parse arguments
    args = parser.parse_args()

    # 4. URL resolution logic (handles flexibility)
    # If -u is provided, use it; otherwise, check positional argument. If neither, raise an error.
    target_url = args.url_flag or args.url_pos

    if not target_url:
        parser.print_help()
        sys.exit(1)  # Exit with error code

    print("[*] Processing...")
    print(f"    URL:      {target_url}")
    print(f"    Language: {args.lang}")
    if args.additional_instruction:
        print(
            f"    Prompt:   {args.additional_instruction}"
        )

    try:
        result = await video_processor.process_video_timestamp(
            url=target_url, additional_instruction="", language=args.lang
        )
        print(result)
    except Exception as e:
        print(f"\n[Error] {e!s}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

