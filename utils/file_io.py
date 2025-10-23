from pathlib import Path

import config


def write_file(data, filename: str, base_dir_name: str = config.ARTIFACTS_DIR):
    file_path = Path(base_dir_name) / filename
    directory_path = file_path.parent
    directory_path.mkdir(parents=True, exist_ok=True)
    with Path.open(file_path, "w") as f:
        f.write(data)
    print(f"💾 File saved: `{file_path}`")


def read_file(filename: str, base_dir_name: str = config.ARTIFACTS_DIR):
    file_path = Path(base_dir_name) / filename
    with Path.open(file_path) as f:
        data = f.read()
    print(f"📄  File loaded: `{file_path}`")
    return data


def save_timestamps_to_file(timestamps, folder_name):
    filename = f"{folder_name}/timestamps.txt"
    if config.SAVE_RESPONSE and timestamps:
        timestamps_text = "\n".join(timestamps)
        write_file(timestamps_text, filename)


def save_prompt_to_file(prompt, folder_name):
    filename = f"{folder_name}/prompt.txt"
    if config.SAVE_PROMPT:
        write_file(prompt, filename)


def load_prompt_from_file(folder_name):
    filename = f"{folder_name}/prompt.txt"
    if config.LOAD_PROMPT:
        prompt = read_file(filename)
        return prompt


def save_response_to_file(response, folder_name):
    filename = f"{folder_name}/response.json"
    if config.SAVE_RESPONSE:
        write_file(response, filename)
