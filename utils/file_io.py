import logging
from collections.abc import Iterable
from pathlib import Path

import aiofiles

import config

logger = logging.getLogger(__name__)


async def async_write_file(
    data: str,
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> None:
    file_path = Path(base_dir_name) / filename
    directory_path = file_path.parent
    directory_path.mkdir(parents=True, exist_ok=True)
    try:
        async with aiofiles.open(file_path, "w") as f:
            await f.write(data)
        logger.info(f"File saved: {file_path}")
    except Exception as e:
        logger.error(f"File write failed: {file_path} ({e})", exc_info=True)
        raise


async def async_read_file(
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> str:
    f_path = Path(filename)
    if f_path.parts and f_path.parts[0] == Path(base_dir_name).name:
        file_path = f_path
    else:
        file_path = Path(base_dir_name) / f_path
    try:
        async with aiofiles.open(file_path) as f:
            data = await f.read()
        logger.info(f"File read: {file_path}")
        return data
    except Exception as e:
        logger.error(f"File read failed: {file_path} ({e})", exc_info=True)
        raise


async def async_save_timestamps_to_file(
    timestamps: Iterable[str],
    folder_name: str,
) -> None:
    filename = f"{folder_name}/timestamps.txt"
    if config.SAVE_RESPONSE and timestamps:
        logger.info(f"Saving timestamps to {filename}")
        timestamps_text = "\n".join(timestamps)
        await async_write_file(timestamps_text, filename)


async def async_save_prompt_to_file(prompt: str, folder_name: str) -> None:
    filename = f"{folder_name}/prompt.txt"
    if config.SAVE_PROMPT:
        logger.info(f"Saving prompt to {filename}")
        await async_write_file(prompt, filename)


async def async_load_prompt_from_file(folder_name: str) -> str | None:
    filename = f"{folder_name}/prompt.txt"
    if config.LOAD_PROMPT:
        logger.info(f"Loading prompt from {filename}")
        try:
            prompt = await async_read_file(filename)
            return prompt
        except FileNotFoundError:
            logger.warning(f"Prompt file not found: {filename}")
            return None
    return None


async def async_save_response_to_file(response: str, folder_name: str) -> None:
    filename = f"{folder_name}/response.json"
    if config.SAVE_RESPONSE:
        logger.info(f"Saving response to {filename}")
        await async_write_file(response, filename)


def write_file(
    data: str,
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> None:
    file_path = Path(base_dir_name) / filename
    directory_path = file_path.parent
    directory_path.mkdir(parents=True, exist_ok=True)
    try:
        with Path.open(file_path, "w") as f:
            f.write(data)
        logger.info(f"File saved: {file_path}")
    except Exception as e:
        logger.error(f"File write failed: {file_path} ({e})", exc_info=True)
        raise


def read_file(filename: str, base_dir_name: Path = config.ARTIFACTS_DIR) -> str:
    f_path = Path(filename)
    if f_path.parts and f_path.parts[0] == Path(base_dir_name).name:
        file_path = f_path
    else:
        file_path = Path(base_dir_name) / f_path
    try:
        with file_path.open() as f:
            data = f.read()
        logger.info(f"File read: {file_path}")
        return data
    except Exception as e:
        logger.error(f"File read failed: {file_path} ({e})", exc_info=True)
        raise


def save_timestamps_to_file(
    timestamps: Iterable[str],
    folder_name: str,
) -> None:
    filename = f"{folder_name}/timestamps.txt"
    if config.SAVE_RESPONSE and timestamps:
        logger.info(f"Saving timestamps to {filename}")
        timestamps_text = "\n".join(timestamps)
        write_file(timestamps_text, filename)


def save_prompt_to_file(prompt: str, folder_name: str) -> None:
    filename = f"{folder_name}/prompt.txt"
    if config.SAVE_PROMPT:
        logger.info(f"Saving prompt to {filename}")
        write_file(prompt, filename)


def load_prompt_from_file(folder_name: str) -> str | None:
    filename = f"{folder_name}/prompt.txt"
    if config.LOAD_PROMPT:
        logger.info(f"Loading prompt from {filename}")
        try:
            prompt = read_file(filename)
            return prompt
        except FileNotFoundError:
            logger.warning(f"Prompt file not found: {filename}")
            return None
    return None


def save_response_to_file(response: str, folder_name: str) -> None:
    filename = f"{folder_name}/response.txt"
    if config.SAVE_RESPONSE:
        logger.info(f"Saving response to {filename}")
        write_file(response, filename)
