# Youtamp

<div align="center">


<img src="./docs/images/hero-dark (Small).png" height=300 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">

<img src="./docs/images/app-dark (Small).png" weight=200 height=300 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">

<details>
<summary><b>See Light Theme</b></summary>
<img src="./docs/images/hero-light (Small).png" height=300 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">

<img src="./docs/images/app-light (Small).png" weight=200 height=300 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">
</details>


<h3>A simple web application for YouTube timestamp creation.</h3>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg?style=for-the-badge&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2+-000.svg?style=for-the-badge&logo=flask&logoColor=fff)](https://flask.palletsprojects.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5.3+-ffcc2f.svg?style=for-the-badge&logo=daisyui&logoColor=ffcc2f)](https://daisyui.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1+-blue.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![uv](https://img.shields.io/badge/uv-1.0+-aa4ab6.svg?style=for-the-badge&logo=uv)](https://docs.astral.sh/uv/)

</div>

## Development

Follow these steps to set up and run the project in your local development environment.

### Prerequisites

*   [Python](https://www.python.org/downloads/) (version 3.12 or higher recommended)
*   [uv](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer) (a fast Python package installer and resolver)

In case you want to edit frontend (JavaScript/CSS/HTML), install the following additionally:
*   [Node.js](https://nodejs.org/en/download/) (version 16 or higher recommended)
*   [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (comes with Node.js)

### Installation
**Clone the repository:**

```bash
git clone https://github.com/Onyx-Nostalgia/youtamp.git
cd youtamp
```

### Running the Development Server
1.  **Create your environment file:**
    Copy the example environment file to create your own local configuration.
    ```bash
    cp .env.example .env
    ```

2.  **Configure Environment Variables:**
    Open the `.env` file and add your `GEMINI_API_KEY`. See the [Environment Variables (`.env`)](#environment-variables-env) section below for more details on all available options.

3.  **Start the Flask development server:**
    ```bash
    uv run app.py
    ```

4.  **Open the browser:**
    Navigate to http://127.0.0.1:45334/

5.  **(Optional) For Frontend Development:**
    If you need to edit CSS files, run the following command in a separate terminal. It will watch for changes in `static/css/input.css` and rebuild automatically.
    ```bash
    npm run dev.build:css
    ```

## Environment Variables (`.env`)

The `.env` file is used to configure the application. Below is a description of each variable found in the `.env.example` file.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **(Required)** Your API key for the Gemini service. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). | `""` |
| `LOG_LEVEL` | Sets the application's logging verbosity. | `INFO` |
| `MOCK_FILE` | For frontend testing. If a path to a text file is provided (e.g., `artifacts/video_id/timestamps.txt`), the app will return the content of that file instead of calling the Gemini API. | `""` |
| `HTML_FILE` | Specifies which HTML file in the `templates/` directory to render. | `index.html` |
| `SAVE_PROMPT` | If `true`, saves the generated prompt to a file in the `artifacts/` directory for debugging. | `false` |
| `SAVE_RESPONSE` | If `true`, saves the raw response from the Gemini API to a file in the `artifacts/` directory. | `false` |
| `LOAD_PROMPT` | If `true`, loads a previously saved prompt from the `artifacts/` directory, bypassing transcript fetching. Useful for quickly re-running a prompt. | `false` |

> [!NOTE]
> If you have `GEMINI_API_KEY` already configured as a system-wide environment variable (e.g., in your `.zshrc` or `.bashrc`), you do not need to set it again in the `.env` file, as the application will automatically use the existing key.

### How to edit frontend files (JavaScript/CSS/HTML)
Frontend base on [DaisyUI](https://daisyui.com/) and [TailwindCSS](https://tailwindcss.com/) framework.
1.  **Edit files in the `static/` directory**
    -  **JavaScript files:** `static/app.js`
    -  **CSS files:** `static/css/input.css`
    - if you want to add new files, just create them in the `static/` folder
2.  **Edit `template/index.html`** for HTML structure.
3.  **Refresh your browser** to see changes.

### Linting & Formatting

We use [Ruff](https://docs.astral.sh/ruff/) to maintain code quality and a consistent style.

**Check for issues:**
The following commands will report any issues without modifying files.
```bash
# Check for formatting issues
uvx ruff format --check .

# Check for linting errors
uvx ruff check .

# Check for type errors
uvx --with pydantic --with flask mypy .
```

**Apply fixes:**
The following commands will automatically format the code and fix any fixable linting issues (like removing unused imports).
```bash
# Automatically format all files
uvx ruff format .

# Automatically fix linting issues
uvx ruff check . --extend-fixable F401 --fix
```

> [!NOTE] 
> While Ruff can fix many issues automatically, some may require manual changes.