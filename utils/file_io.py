from collections.abc import Iterable
from pathlib import Path

import aiofiles

import config


async def async_write_file(
    data: str,
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> None:
    file_path = Path(base_dir_name) / filename
    directory_path = file_path.parent
    directory_path.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(file_path, "w") as f:
        await f.write(data)
    print(f"💾 File saved: `{file_path}`")


async def async_read_file(
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> str:
    f_path = Path(filename)
    if f_path.parts and f_path.parts[0] == Path(base_dir_name).name:
        file_path = f_path
    else:
        file_path = Path(base_dir_name) / f_path
    async with aiofiles.open(file_path) as f:
        data = await f.read()
    print(f"📄  File loaded: `{file_path}`")
    return data


async def async_save_timestamps_to_file(
    timestamps: Iterable[str],
    folder_name: str,
) -> None:
    filename = f"{folder_name}/timestamps.txt"
    if config.SAVE_RESPONSE and timestamps:
        timestamps_text = "\n".join(timestamps)
        await async_write_file(timestamps_text, filename)


async def async_save_prompt_to_file(prompt: str, folder_name: str) -> None:
    filename = f"{folder_name}/prompt.txt"
    if config.SAVE_PROMPT:
        await async_write_file(prompt, filename)


async def async_load_prompt_from_file(folder_name: str) -> str | None:
    filename = f"{folder_name}/prompt.txt"
    if config.LOAD_PROMPT:
        prompt = await async_read_file(filename)
        return prompt
    return None


async def async_save_response_to_file(response: str, folder_name: str) -> None:
    filename = f"{folder_name}/response.json"
    if config.SAVE_RESPONSE:
        await async_write_file(response, filename)


def write_file(
    data: str,
    filename: str,
    base_dir_name: Path = config.ARTIFACTS_DIR,
) -> None:
    file_path = Path(base_dir_name) / filename
    directory_path = file_path.parent
    directory_path.mkdir(parents=True, exist_ok=True)
    with Path.open(file_path, "w") as f:
        f.write(data)
    print(f"💾 File saved: `{file_path}`")


def read_file(filename: str, base_dir_name: Path = config.ARTIFACTS_DIR) -> str:
    f_path = Path(filename)
    if f_path.parts and f_path.parts[0] == Path(base_dir_name).name:
        file_path = f_path
    else:
        file_path = Path(base_dir_name) / f_path
    with file_path.open() as f:
        data = f.read()
    print(f"📄  File loaded: `{file_path}`")
    return data


def save_timestamps_to_file(
    timestamps: Iterable[str],
    folder_name: str,
) -> None:
    filename = f"{folder_name}/timestamps.txt"
    if config.SAVE_RESPONSE and timestamps:
        timestamps_text = "\n".join(timestamps)
        write_file(timestamps_text, filename)


def save_prompt_to_file(prompt: str, folder_name: str) -> None:
    filename = f"{folder_name}/prompt.txt"
    if config.SAVE_PROMPT:
        write_file(prompt, filename)


def load_prompt_from_file(folder_name: str) -> str | None:
    filename = f"{folder_name}/prompt.txt"
    if config.LOAD_PROMPT:
        prompt = read_file(filename)
        return prompt
    return None


def save_response_to_file(response: str, folder_name: str) -> None:
    filename = f"{folder_name}/response.txt"
    if config.SAVE_RESPONSE:
        write_file(response, filename)
