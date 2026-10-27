# Development Log

A running record of what we did, what went wrong, and why we made
each decision. Newest entries at the bottom.

## Oct 25, 2026 (Day 1)

### Project decision
- Registered for OPEN//BUILD 2026 (OSCA Ile-Ife).
- Considered two ideas: (1) an AI tool for video editors, and (2) a
  student platform for accommodation, a marketplace and campus
  information, suggested by my teammate.
- Chose the video editor tool because I and my teammate are both video
  editor and understand the problem, and the AI model has a clear job.
  The accommodation idea may be mentioned as a possible next step.

### Core idea
Upload a video, transcribe it with an open-weight speech model,
search the transcript by meaning, and jump to the matching moment.
Captions export is a possible add-on if time allows.

### Research on existing tools
- Descript, Premiere Pro and DaVinci Resolve already offer
  transcript-based editing and auto-captions.
- Opus Clip focuses on finding short clips from long videos and is
  paid, billed in USD, with limited free minutes.
- We did not verify how these tools handle Nigerian accents or
  Pidgin, so we make no claims about that.
- Our angle: free, open-source, runs on the editor's own computer.

### Setup completed
- Created the GitHub repository (public, MIT licence, Python
  .gitignore).
- Installed Git for Windows and configured it.
- Created a Python virtual environment.
- Installed faster-whisper (v1.2.1) and its dependencies.
- Added `.gitignore` entries so videos and the venv are not uploaded.
- Wrote `transcribe.py` to transcribe a test clip.
- Drafted the README.

### Problem encountered
Running `python transcribe.py` failed with:

`ImportError: DLL load failed while importing rational: Your
organization used Device Guard to block this app.`

**Cause:** Windows Smart App Control blocked a compiled dependency
(`av`) used by faster-whisper to read video.

**Options considered:**
1. Turn off Smart App Control. Rejected: it can't be turned back on
   without resetting Windows, and it lowers protection.
2. Use Google Colab. Possible fallback, but we want the tool to run
   locally.
3. Use WSL (Ubuntu inside Windows), which Smart App Control does not
   check. **Chosen.**

**Status:** `wsl --install` started but stayed at 0%. Will restart the
laptop and retry on Oct 26.

### Plan for Oct 26 (Day 2)
- Restart, get Ubuntu running in WSL.
- Install faster-whisper inside WSL and run `transcribe.py`.
- Test the baseline Whisper model on 3-4 short clips.
- Compare it with Nigerian-speech fine-tunes (Sunbird 51 African
  languages, NaijaVox) and record where each makes mistakes.
- Read and record the licence of each model.

### AI assistance
Used Claude to help plan the project, research existing tools,
troubleshoot setup errors, and write the first version of the UI
prototype code (see Oct 26). [Make sure we can explain every part we
submit, and update this if AI helps write more code.]

## Oct 26 (Day 2)

### Setup
- Installed WSL (Ubuntu) to get around the Smart App Control block.
  WSL works.
- Installed faster-whisper in Ubuntu and ran `transcribe.py` on
  `clip1.mp4` with the Whisper `small` model.
- faster-whisper 1.2.1 needed `av<19` (PyAV 19 removed an argument
  faster-whisper still uses).

### First transcription test (clip1)
- Whisper `small`, auto-detect: guessed Yoruba on clip1 and produced
  garbled text. Forcing `language="en"` fixed it.
- Result:

```
[20.8s - 21.8s]  I've cried many times.
[21.8s - 23.8s]  I've never cried before.
[24.8s - 33.8s]  Okay, so I think the stressful thing about my department is the fact that her lecturers are actually doing good, but they can't do better.
[33.8s - 42.8s]  So like they will bring a, let's say, numbers of PDF and they will just come to teach us for maybe two to three times.
[42.8s - 47.8s]  And then the next time is exam without actually explaining.
 HEAD
- Mistakes noticed: Had difficulty transcribing Nigerian slangs like "ke", "her" intead of "our" also "can't" instead of "can" in {24.8s-33.8s}
 English transcript quality on clip1: many lines correct, but it
  struggled with Nigerian slang ("ke", "abi") and some words
  ("on an" became "when I'm", "department" became "new classmate").

### Model comparison on clip1 (Nigerian-accented English, CPU only)
	Whisper small (English forced)
Correct words()           Printed words()
Department                  New classmate
On an                       When I'm
Ke, Abi                     _missed_
Lines correct:18/30, several errors

         Sunbird 51-African-languages (faster-whisper)
Correct words()              Printed words()
Department                    Department 
On an                         On an 
Ke, Abi                       missed, Abiola
Lines correct: 21/30, lesser errors

Notes: Sunbird is a fine-tune of Whisper large-v3. It required a
Hugging Face account, accepting access conditions and a token. Licence:
apache-2.0 (per its model page; to confirm).
 


- Mistakes noticed: difficulty with Nigerian slang such as "ke" and
  "abi". "her" instead of "our", and "can't" instead of "can", in
  [24.8s - 33.8s]. Some other words were also wrong ("on an" became
  "when I'm", "department" became "new classmate").
- English transcript quality on clip1: many lines correct, but errors
  cluster around slang and accent. One clip is not enough to draw
  conclusions, so we still need to test 3-4 clips.

### UI prototype
- Built a clickable prototype of the editor screen (working name
  "Sabi", a placeholder): https://claude.ai/artifact/X9RYBP1ie3iiHmkbunK6XE
- Three panels: footage list, player with caption overlay, and a
  search and transcript panel.
- Search results are labelled "Exact words" or "Similar meaning" and
  show as markers on the scrubber. Clicking a result jumps the player
  to that moment.
- Low-confidence words are underlined, transcript lines are editable,
  and an export dialog shows the SRT captions.
- A "compare with a generic auto-caption" toggle is there for the
  before/after demo.
- **Sample data only:** the footage is a placeholder, the transcripts
  are made up, and the search is a simple word and synonym match. The
  "generic" captions are illustrative, not real output from any tool.
- Data shape the UI needs: clip, then segments with start time, text
  and low-confidence words. `transcribe.py` output can be converted to
  this.

### Still to do from the plan
- Test the baseline model on 3-4 short clips.
- Compare with Sunbird and NaijaVox and record where each makes
  mistakes.
- Read and record the licence of each model.
- Replace the prototype's sample transcripts with real
  `transcribe.py` output, including clip1.
- Build the real meaning-based search (embeddings) to replace the
  prototype's mock search.

###Oct 27, Day3
### Yoruba test (Sunbird, Oct 27)
- Clip: one Yoruba clip, [l58s], [clean audio].
- Result: transcribed accurately, tone marks correct on the lines we checked
- Checked by a Yoruba speaker who read the output].
- Run time on CPU: 2mins
- Limitation: one clip only. Not enough to claim general accuracy on Yoruba.
**Yoruba (Sunbird), sample lines:**
[0.0s - 0.9s] àgo lọ́nà ẹ̀jẹ̀ ìrọ́kọ mi, olólùfẹ́ ẹ̀ mi, àyànfẹ́ tèmí nìkan, káàbù, ẹ̀kú ogun àjayé, bàbá lójú ogun tí jẹ́ balógun, ọkùnrin wá, ọkùnrin wò, ọkùnrin wà wá owó, inú mi dùn, ayọ̀ mí kú, erú
Just two words are wrong in these lines("kaabu" instead of "kaabo" and "owo" instead of "wowo")

### Igbo test (Sunbird, Oct 27)
- Clip: one Igbo clip, [70s], [clean audio].
- Result: [e.g. transcribed fairly accurate].
- Checked by: [ an Igbo speaker read the output].
- Run time on CPU: [less than 2mins].
- Limitation: one clip only. Not enough to claim general accuracy on Igbo.
**Igbo(Sunbird), sample lines:**
[2.6s - 3.2s]  m gịrị abụba. Ọ bụrụ na m anọọ ya, amalugo m ihe ya ga-eme. Ọkwa maka gị n'ụmụnne m ka m ji uwe n'ọrụ ebe a. Tupu na m anwụọ, ọgwụ agụụm ihe m ga-eme na mgbere otu a. Ọ maka adịghị

