---
mode: 'agent'
tools: ['codebase']
description: 'Generate or modify Python modules for YouTube Transcriber'
---
Your goal is to generate or modify Python modules for the YouTube Transcriber project, following the instructions and architecture below.

**Main flow
1. read URLs from the `videos.txt` file (ignore lines beginning with `//`)
2. Download audio from YouTube videos using `yt-dlp` (save in `audios/`)
3. Transcribe audio using Whisper (OpenAI) or Faster-Whisper (preferred, with GPU/CPU support)
4. Save full transcript (.txt) and detailed segments (.json) in `transcripts/words/`
5. Split transcript into blocks (~130 words, keeping sentences) and save in `transcripts/sections/`
6. Export blocks to Excel with timestamps in `excel_output/`
7. All configuration centralized in `src/config.py`
8. Use consistent logging (`logger.py`)

**Requirements for the code
- Follow the directory structure and file names as instructed in the project
- Implement command line options: `--only-excel`, `--list`, `--video-id`, `--ignore`, `--whisper`, `--cpu`, `--test-whisper`
- Use utility functions for video ID extraction and logging
- Name output files based on YouTube video ID
- Generate clean, modular and documented code

**When generating code:**
- Ask which module or functionality you want to create/modify, if it's not clear
- Ask for details such as configuration parameters, desired template (Whisper/Faster-Whisper), or output format, if necessary
- Briefly explain how the code fits into the project flow

Always follow the practices and architecture described in the project instructions.