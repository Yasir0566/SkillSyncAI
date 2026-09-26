# Groq CLI Assistant

A small, well-commented command-line LLM assistant that runs in either
**Q&A mode** or **Summarizer mode**, powered by [Groq's](https://console.groq.com)
free API. This is the capstone project from Session 2 of the Python for AI
workshop, packaged as a standalone, runnable project.

## 📁 Project Structure

```
groq_cli_assistant/
├── cli.py              # main entry point -- run this file
├── groq_client.py       # loads the API key, calls the model, handles retries
├── utils.py               # system prompts, token estimation, session saving
├── requirements.txt        # the 2 packages this project needs
├── .env.example              # template for your API key -- copy to .env
├── .gitignore                  # keeps .env and logs out of version control
├── README.md                    # you are here
└── logs/                          # saved conversation transcripts land here
```

## 🚀 Setup (one-time, ~3 minutes)

**1. Install the dependencies:**
```bash
pip install -r requirements.txt
```

**2. Get a free Groq API key:**
1. Go to [console.groq.com](https://console.groq.com) and sign up (free, no
   credit card required)
2. Open **API Keys** in the left sidebar → **Create API Key**
3. Copy the key (starts with `gsk_...`) — you'll only see it once

**3. Add your key:**
```bash
cp .env.example .env
```
Then open `.env` in any text editor and paste your real key in place of the
placeholder:
```
GROQ_API_KEY=gsk_your_real_key_here
```

## ▶️ Usage

**Q&A mode (default):**
```bash
python cli.py
```

**Summarizer mode:**
```bash
python cli.py --mode summarize
```
(In this mode, paste in a paragraph or article and the assistant will reply
with exactly 3 bullet points.)

**Custom reply length:**
```bash
python cli.py --mode qa --max-tokens 150
```

**Exit and save:** type `quit` (or press `Ctrl+C`) at any time. The full
conversation is automatically saved as a timestamped JSON file inside `logs/`.

## 💬 Example Session

```
==================================================
  Groq CLI Assistant -- Q&A Assistant mode
==================================================
Type your message and press Enter.
Type 'quit' (or press Ctrl+C) to exit and save this session.

You: What's the difference between a list and a tuple in Python?
Assistant: Lists are mutable (you can change, add, or remove items after
creation) while tuples are immutable (fixed once created). Lists use square
brackets [1, 2, 3]; tuples use parentheses (1, 2, 3).

You: quit

Session saved to: logs/qa_session_20260908_143022.json
```

## 🛠️ How It's Built (a quick tour for learning purposes)

- **`groq_client.py`** is the *only* file that talks to the network. It has
  two functions: `load_client()` (reads your API key safely) and
  `call_model()` (sends messages, retries automatically on transient
  failures, and always returns a plain string — never crashes the program).
- **`utils.py`** has zero network calls — just small, pure helper functions
  for system prompts, a rough token counter, and saving the session to disk.
- **`cli.py`** is the main loop: it reads what you type, appends it to a
  growing `history` list, calls the model, prints the reply, and appends
  the reply to `history` too. That growing list is what gives the
  conversation "memory" — the model itself remembers nothing between calls,
  so the whole history is resent every single time.

## ⚠️ Troubleshooting

| Problem | Likely cause |
|---|---|
| `Setup required: GROQ_API_KEY not found...` | You haven't created `.env` yet, or forgot to paste your real key in |
| `[Error: could not get a response after 3 attempts...]` | Check your internet connection, or that your key is valid at console.groq.com |
| Replies feel slow or you hit a rate-limit error | Groq's free tier has a requests-per-minute limit — wait a few seconds and try again |
| `ModuleNotFoundError: No module named 'groq'` | Run `pip install -r requirements.txt` |

## 🚧 Stretch Ideas

- Add a `--file input.txt` flag to summarize a whole file instead of typed input
- Add a `/reset` command mid-conversation to clear history without quitting
- Swap `groq_client.py` for an `openai_client.py` or `anthropic_client.py` —
  notice how little of `cli.py` or `utils.py` would need to change
all the details or information about the project is stored here !!