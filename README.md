# FiveM Lua AI Code Generator

A command-line tool that uses DeepSeek via OpenRouter to generate FiveM Lua code snippets based on user prompts.

## Setup

1. Install Python 3.8+ if not already installed.
2. Clone or download this project.
3. Create a `.env` file in the project root and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### CLI Usage

Run the tool with a prompt describing the code you want:

```
python main.py "Create a client-side script that displays a notification when the player enters a vehicle."
```

The tool will output the generated Lua code.

### Web Interface

1. Run the Flask app:
   ```
   python main.py
   ```
2. Open your browser and go to `http://127.0.0.1:5000/`
3. Use the web interface to create multiple chats, send prompts, and copy generated code.

## Examples

- `python main.py "Write a server script to ban a player."`
- `python main.py "Generate a client script for a simple teleport command."`

## Notes

- Ensure your OpenRouter API key has sufficient credits.
- The generated code is tailored for FiveM but may require adjustments.
- For security, keep your `.env` file private.
- The web interface uses local storage for chat sessions.
