# \# Development Log

# 

# A running record of what we did, what went wrong, and why we made

# each decision. Newest entries at the bottom.

# 

# \## Oct 25, 2026 (Day 1)

# 

# \### Project decision

# \- Registered for OPEN//BUILD 2026 (OSCA Ile-Ife).

# \- Considered two ideas: (1) an AI tool for video editors, and (2) a

# &#x20; student platform for accommodation, a marketplace and campus

# &#x20; information, suggested by my teammate.

# \- Chose the video editor tool because \[your reason, e.g. I am a video

# &#x20; editor and understand the problem, and the AI model has a clear job].

# &#x20; The accommodation idea may be mentioned as a possible next step.

# 

# \### Core idea

# Upload a video, transcribe it with an open-weight speech model,

# search the transcript by meaning, and jump to the matching moment.

# Captions export is a possible add-on if time allows.

# 

# \### Research on existing tools

# \- Descript, Premiere Pro and DaVinci Resolve already offer

# &#x20; transcript-based editing and auto-captions.

# \- Opus Clip focuses on finding short clips from long videos and is

# &#x20; paid, billed in USD, with limited free minutes.

# \- We did not verify how these tools handle Nigerian accents or

# &#x20; Pidgin, so we make no claims about that.

# \- Our angle: free, open-source, runs on the editor's own computer.

# 

# \### Setup completed

# \- Created the GitHub repository (public, MIT licence, Python

# &#x20; .gitignore).

# \- Installed Git for Windows and configured it.

# \- Created a Python virtual environment.

# \- Installed faster-whisper (v1.2.1) and its dependencies.

# \- Added `.gitignore` entries so videos and the venv are not uploaded.

# \- Wrote `transcribe.py` to transcribe a test clip.

# \- Drafted the README.

# 

# \### Problem encountered

# Running `python transcribe.py` failed with:

# 

# `ImportError: DLL load failed while importing rational: Your

# organization used Device Guard to block this app.`

# 

# \*\*Cause:\*\* Windows Smart App Control blocked a compiled dependency

# (`av`) used by faster-whisper to read video.

# 

# \*\*Options considered:\*\*

# 1\. Turn off Smart App Control. Rejected: it can't be turned back on

# &#x20;  without resetting Windows, and it lowers protection.

# 2\. Use Google Colab. Possible fallback, but we want the tool to run

# &#x20;  locally.

# 3\. Use WSL (Ubuntu inside Windows), which Smart App Control does not

# &#x20;  check. \*\*Chosen.\*\*

# 

# \*\*Status:\*\* `wsl --install` started but stayed at 0%. Will restart the

# laptop and retry on Oct 26.

# 

# \### Plan for Oct 26 (Day 2)

# \- Restart, get Ubuntu running in WSL.

# \- Install faster-whisper inside WSL and run `transcribe.py`.

# \- Test the baseline Whisper model on 3-4 short clips.

# \- Compare it with Nigerian-speech fine-tunes (Sunbird 51 African

# &#x20; languages, NaijaVox) and record where each makes mistakes.

# \- Read and record the licence of each model.

# 

# \### AI assistance

# Used Claude to help plan the project, research existing tools and

# troubleshoot setup errors. \[Update this if AI helps write code, and

# make sure we can explain every part we submit.]

## Oct 26 (Day 2)
- Installed WSL (Ubuntu) to get around the Smart App Control block.
- Installed faster-whisper in Ubuntu and ran transcribe.py on clip1.mp4
  with the Whisper `small` model.
 WSL (Ubuntu) works. faster-whisper 1.2.1 needed `av<19` (PyAV 19
  removed an argument faster-whisper still uses).
- Whisper `small`, auto-detect: guessed Yoruba on clip1 and produced
  garbled text. Forcing `language="en"` fixed it.

- Result: [20.8s - 21.8s]  I've cried many times.
[21.8s - 23.8s]  I've never cried before.
[24.8s - 33.8s]  Okay, so I think the stressful thing about my department is the fact that her lecturers are actually doing good, but they can't do better.
[33.8s - 42.8s]  So like they will bring a, let's say, numbers of PDF and they will just come to teach us for maybe two to three times.
[42.8s - 47.8s]  And then the next time is exam without actually explaining.
- Mistakes noticed: Had difficulty transcribing Nigerian slangs like "ke", "her" intead of "our" also "can't" instead of "can" in {24.8s-33.8s}
 

