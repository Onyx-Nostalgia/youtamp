# Youtamp

<div align="center">

## Desktop/Mobile Preview

<img src="./docs/images/youtamp-1.gif" weight=400 height=500 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">
<img src="./docs/images/youtamp-mb.gif" height=500 alt="Description" style="border-radius: 20px;box-shadow: 5px 5px 10px \#888;">


<h3>A simple web application for YouTube timestamp creation.</h3>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg?style=for-the-badge&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.12+-000.svg?style=for-the-badge&logo=flask&logoColor=fff)](https://flask.palletsprojects.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5.3+-purple.svg?style=for-the-badge&logo=daisyui)](https://daisyui.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1+-blue.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![uv](https://img.shields.io/badge/uv-1.0+-purple.svg?style=for-the-badge&logo=uv)](https://docs.astral.sh/uv/)

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
1.  **Start the Flask development server:**
    ```bash
    uv run --env-file .env app.py --file index.html
    ```
    >[!IMPORTANT] 
    > Make sure you have "GEMINI_API_KEY" set in your `.env` file or your environment variables
    
2. **Open the browser:** http://127.0.0.1:5000/
3. **In case you want to edit CSS files, run**
    ```bash
    npm run dev.build:css
    ``` 
    > [!NOTE] 
    > it will run continuously while you edit CSS files

#### Mock Mode (for Testing)

To test the frontend or bypass the Gemini API, you can run the server in "mock mode." This mode reads timestamp data directly from a local file instead of generating it.

Use the `--mock` flag and provide a path to your mock data file. The path should be relative to the `artifacts` directory.

**Example:**

```bash
uv run --env-file .env app.py --file index.html --mock 4Jb35R2MZ_c/timestamps.txt
```

This command will load timestamps from `artifacts/4Jb35R2MZ_c/timestamps.txt`.

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