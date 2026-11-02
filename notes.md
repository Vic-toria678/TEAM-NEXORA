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
Claude was used during early planning and research, for troubleshooting,
and to help draft the first UI prototype. The problem and direction were
chosen by the team based on our own video-editing experience; the
prototype was reviewed and revised against the workflow we wanted to
show. Track further AI assistance in the later dated entries rather
than treating this first prototype as the whole project.

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
- Clip: one Yoruba clip, [58s], [clean audio].
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

### Pidgin test (Sunbird, Oct 27)
- Clip: one Pidgin clip, [38s], [audio and background music].
- Result: transcribed accurately 
- Checked by a Pidgin speaker who read the output
- Run time on CPU: 2mins
- Limitation: one clip only. Not enough to claim general accuracy on Pidgin.
**Pidgin(Sunbird), sample lines:**
[0.0s - 0.9s]  be girl you wey be girl wey dey do things for me for free you no know the plans wey i get for you i have great plans for you and when dem go manifest there i go beautify you i go upgrade your standard go put you for place wey be say nobody go fit touch you you go dey float you go dey fly dey go na the plans wey i get 

Got every single pidgin word right.

# Pidgin+Englishtest (Sunbird, Oct 27)
- Clip: one Pidgin clip, [36s], [clear audio].
- Result: transcribed accurately 
- Checked by a Pidgin and English speaker who read the output
- Run time on CPU: 2mins

**Pidgin+English(Sunbird), sample lines:**
[0.0s - 0.7s] this week is not for jokeing around e get as things be for country now serious conversations only anything wey you no fit discuss with a soldier no bring am come near me. I saw you yesterday, you were looking so fine. Send me money. You see this beauty, it's not just the glory of the Lord, money dey enter am.

Aside the wrong spelling of joking, every other word was transcribed accurately
### Mixed Pidgin and English clip (Sunbird, Oct 27)
- Clip: `clip_pidgin_english.mp4`, [36s], [clear audio].
- Run with `eng`: transcribed well, English-style spelling.
- Run with `pcm`: transcribed well, but English words appeared in
  Pidgin-style spelling. The words were correct, only the spelling
  convention differed.
- Checked by: [Victoria].
- Implication: the user should be able to choose the language
  setting. Search must be tested against both spellings.
- Limitation: one clip only.

### Hausa test (Sunbird, Oct 27)
- Clip: one Hausa clip, [182s], [audio and background music].
- Result: transcribed 
- Not Checked by a Pidgin speaker 
- Run time on CPU: 3mins
- Limitation: one clip only. Not enough to claim general accuracy on Hausa.
**Hausa(Sunbird), sample lines:**
[0.0s - 0.7s] a ta farko dama suma ta azamantakewa ta aure basu da matsala sai kwaya biyu darasin na farko shine babban laifin mace a wajen zaman aure don loksan da mace take tare da mijinta idan ranta ya ɓaci ba ta iya magana akwai matar da idan namiji ya gaya mata magana daya sai ta bashi amsa goma shatar da yawa gaske kuma idan namiji bai da ya laukira je zai ba shi ya dan kofa matashi ta shigo cikin lambarinsa da shi yadan zai yi aiki amma ko nami


### Connecting the model to a web interface
- Built a small local server (`app.py`, FastAPI + uvicorn) that loads
  the Sunbird 51-African-languages model once at startup and exposes
  one endpoint, `POST /api/transcribe`. It takes an audio/video file
  and a language code (`eng`, `yor`, `ibo`, `hau`, `pcm`) and returns
  a list of `{start, end, text}` lines.
- Created a simple test page (`frontend/index.html`) with a file
  picker, a language dropdown and a Transcribe button. It is a
  placeholder for the real interface, which my teammate is building.
  It will replace this page in the `frontend` folder.
- Ran the server inside WSL (Ubuntu), because Windows Smart App
  Control blocks a dependency on my laptop. Opened the page at
  `http://localhost:8000` in the Windows browser.
- Result: uploaded `clip1.mp4`, chose English, and the transcript
  appeared on the page. The server log showed the request completed
  (200 OK).

### Problem: unreliable timestamps
- The Sunbird model returned one segment per 30-second window, and
  the segment start/end times were not usable (for example, a long
  stretch of text shown as ending less than a second after it began).
  That would break "jump to the moment" and SRT captions.
- Word-level timestamps (`word_timestamps=True`) were accurate, so
  the server now builds short caption-sized lines from the word
  times (about 70 characters or 6 seconds at most, or at a sentence
  end).
- Check: [3.87s - 6.29s] How stressful is your department and exactly what makes it stressful?
[7.11s - 9.03s] All right, how stressful is my department?

Both lines were correct.

[102.19s - 106.21s] You are made to give like three to four pages.
[107.29s - 111.99s] They just want you to pour out what you understand and is, well, it's just
[111.99s - 115.53s] for our benefit and I get it, but omo, it's really stressful, there it

It recognized and transcribed the Nigerian slang "omo". Every other word is correct

- Observed: at the very end of clip1 (about 117 to 119 s) the model
  produced text that is not in the video ("Visit.", ".", "were.").
  Confirmed by listening. This looks like the model inventing words
  over trailing silence or noise. A few very short fragments also
  appear where a long sentence was cut at the line-length limit.
  Treated as a known limitation; not yet fixed.

### Offline test 
- Started the server with HF_HUB_OFFLINE=1, turned Wi-Fi off, and
  confirmed no connection (ping failed). Transcribed [38s, Hausa]
  through the page: [worked,].

### Not done / not verified yet
- Search and SRT export are not built yet.

### AI assistance
- Used Claude to help plan the project, research existing tools,
  troubleshoot setup errors, and draft parts of the server and test page.
- We ran the code, checked its output against the clips, and recorded
  limitations when results were uncertain. Model and UI choices were
  made in response to our tests and the editor workflow we wanted.

## Oct 28, 2026 — Current setup guide for Victoria

These are the steps for the **current** SABI application. The old
instructions above that say to open `http://localhost:8000` for the
web page refer to the earlier placeholder. The current Next.js website
runs at `http://localhost:3000`; FastAPI runs separately at
`http://localhost:8000`.

### What you need

- Git for Windows.
- Node.js 20 LTS (npm is included). Check with `node --version` and
  `npm --version` in PowerShell.
- WSL 2 with Ubuntu for the Python transcription server. We use WSL
  because Windows Smart App Control blocked a compiled audio
  dependency on one of our machines.
- A Hugging Face account and access to
  `Sunbird/faster-whisper-51-african-languages`. Sign in to Hugging
  Face, visit the model page, and accept its access conditions before
  trying to start the server.
- Enough disk space and memory for the speech model. The first server
  start downloads the model; subsequent starts use the cached copy.

### 1. Install WSL if it is not already available

Open PowerShell and run:

```powershell
wsl --install -d Ubuntu
```

Restart Windows if prompted, then open Ubuntu from the Start menu and
complete its first-run username and password setup. If Ubuntu is
already installed, open it and continue.

### 2. Clone the project on Windows

In PowerShell, choose a folder where you keep projects, then clone the
repository and enter it:

```powershell
cd "$HOME\Documents"
git clone https://github.com/Vic-toria678/TEAM-NEXORA.git
cd TEAM-NEXORA
```

If GitHub asks you to authenticate, use your own GitHub account. Do
not put passwords, Hugging Face tokens or other secrets in project
files.

### 3. Set up and start the local transcription server in Ubuntu

Open Ubuntu (WSL). Install the Python tools if needed:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git
```

The Windows Documents folder is available inside WSL under
`/mnt/c/Users/`. For the commands below, replace `<WindowsUser>` with
the Windows account folder name, and adjust the path if you cloned the
repository somewhere other than Documents:

```bash
cd "/mnt/c/Users/<WindowsUser>/Documents/TEAM-NEXORA"
python3 -m venv ~/sabi-venv
source ~/sabi-venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Authenticate inside Ubuntu so the server can download the gated model:

```bash
hf auth login
```

Paste a Hugging Face **read** token into the hidden prompt. The token
is saved in your WSL Hugging Face credentials, not in the repository.
Never add it to `.env`, source code, screenshots or a commit.

Start FastAPI from the repository root, in this same Ubuntu terminal:

```bash
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Keep the terminal open. On the first run, allow time for the model to
download and load; the workspace is not ready to transcribe until the
server has finished starting. WSL 2 forwards localhost ports to
Windows, so the Next.js app can reach this server at
`http://localhost:8000`.

### 4. Set up and start the website on Windows

Open a **second** PowerShell window and enter the frontend folder:

```powershell
cd "$HOME\Documents\TEAM-NEXORA\frontend"
npm ci
npm run dev
```

Keep this terminal open too. Once Next.js reports that it is ready,
open **http://localhost:3000** in your browser. The landing page is at
`/` and the editing workspace is at `/workspace`.

The frontend already proxies its `/api/transcribe` request to
`http://localhost:8000`, so the default setup needs no `.env.local`
file and no FastAPI CORS changes. If FastAPI is running at a different
address, create `frontend/.env.local` with a line such as
`API_BASE_URL=http://localhost:8000` (replace the address as needed),
then restart `npm run dev`. Do not add tokens or passwords to this
file.

### 5. Try a transcription

1. Make sure both terminals are still running and FastAPI has finished
   loading the model.
2. In the browser, open `/workspace`.
3. Drop a supported video or audio file onto the upload area, or click
   **Choose a file**. Supported extensions include MP4, MOV, M4V,
   WebM, MP3, WAV, M4A, AAC, OGG and FLAC.
4. Choose the spoken language: English, Yoruba, Igbo, Hausa or
   Nigerian Pidgin. Selecting the language sends the matching code
   (`eng`, `yor`, `ibo`, `hau` or `pcm`) to the server.
5. Click **Transcribe** and leave the browser and server running.
   CPU transcription can take several minutes. The first model
   download can take longer.
6. When the transcript appears, click a timestamp to seek the media.
   Click a transcript line's text to edit it. Use **Find a moment** to
   search the transcript, or **Export SRT** to download the current
   edited captions.

### Troubleshooting

- **Workspace says it cannot reach the server:** check that the Ubuntu
  terminal is still running Uvicorn on port 8000 and finished loading
  the model. In Windows, open `http://localhost:8000/docs`; if it does
  not load, check the Uvicorn terminal for its startup error.
- **Hugging Face reports access denied or authentication required:**
  confirm the account has accepted the model access conditions, then
  run `hf auth login` again in Ubuntu. Windows and WSL keep separate
  credentials.
- **Address already in use:** another process is already using port
  3000 or 8000. Stop the other development server with `Ctrl+C`, or
  identify and stop that process before restarting SABI.
- **Node or npm is not recognized:** install Node.js 20 LTS, close and
  reopen PowerShell, then verify both commands work.
- **Python package or `av` errors on Windows:** run FastAPI from
  Ubuntu/WSL as described above, not from Windows Python. The
  repository pins PyAV below version 19 because faster-whisper 1.2.1
  is incompatible with PyAV 19.
- **A language is rejected:** use one of the five language options in
  the workspace. The server validates the submitted language code.
- **Captions or transcript look wrong:** speech recognition can make
  mistakes, especially with noisy audio or silence at the end of a
  clip. Review and edit the transcript before using or publishing it.

### Important behavior and limitations

- The media file is uploaded to the **local FastAPI server** on
  Victoria's own computer; it is not sent to a SABI cloud service.
- The model must be downloaded once. After it is cached, transcription
  can run offline.
- The current **Find a moment** feature is a local word/related-term
  matching demo over the transcript. It does not yet use semantic
  embedding search, so describe it honestly during testing or a demo.
- Stop the website and server separately with `Ctrl+C` in their
  respective terminals.

## Oct 28 (Day 4)

### Connecting the real interface to the model
- Pulled my teammate's interface (Next.js, in `frontend/`). It
  forwards `/api/transcribe` to the local model server at
  `localhost:8000` (rewrite in `next.config.ts`), so no changes to
  the server's API were needed.
- Problem: `npm install` failed on the Windows drive (`/mnt/c`) with
  network errors, then with `ENOTEMPTY: directory not empty, rename`.
  Fix: copied the interface into Ubuntu's own home folder
  (`~/frontend`) and ran `npm install` and `npm run dev` there.
- Problem: the page failed with "Module not found: Can't resolve
  '@/lib/utils'". Cause: the repo's Python `.gitignore` ignores
  folders named `lib`, so `frontend/lib` was never pushed.
  [Say how it was fixed, e.g. changed `.gitignore` and teammate
  pushed the folder.]
- Problem: transcription of a 22.7 MB clip failed with a 500 error.
  Cause: Next.js limits proxied uploads to 10 MB by default and the
  connection to the model server was reset. Fix: raised the upload
  limit (`middlewareClientMaxBodySize`) and the proxy timeout in
  `next.config.ts`.
- Result: uploaded a clip in the interface, the model server logged
  `POST /api/transcribe ... 200 OK`, and the transcript appeared.
  Search and SRT export work in the interface. [Tested a 59s yoruba clip and imported into Capcut]

### Speed on CPU (no GPU)
- Checked for a GPU: none available (`nvidia-smi` not usable in WSL).
  Laptop has 8 CPU threads.
- Through the interface, a 36-second clip took a little over 3
  minutes with the original settings, about 5 times the clip length.
- Tested three settings of faster-whisper on one 59-second Yoruba
  clip (Sunbird model, int8, CPU):

| Setting | Run 1 | Run 2 |
|---|---|---|
| A) sequential, beam 5 | 487 s, 127 words | 1170 s, 89 words |
| B) batched 4, beam 5 | 267 s, 92 words | 234 s, 92 words |
| C) batched 4, beam 1 | 209 s, 86 words | 154 s, 86 words |

- Setting A varied a lot between the two runs and I cannot explain
  it. Treat exact timings as rough; batched decoding was clearly
  faster than sequential in both runs.
- Compared the saved text of A and C against the video. C read
  better. [checked by Victoria, I understand
  Yoruba.]
- Switched `app.py` to batched decoding with beam size 1, batch
  size 4 and all CPU threads. The same 36-second clip then took
  under 3 minutes through the interface, still much slower than
  real time.
- A first benchmark run froze for over 15 minutes. The traceback
  showed it waiting on a network lookup (`getaddrinfo`), not on
  transcription. Fix: start scripts and the server with
  `HF_HUB_OFFLINE=1` so they never contact the internet.

### Limitations noted today
- CPU-only transcription is slower than real time, so long videos
  would take longer time on this laptop. A GPU or a hosted server is the
  next step for long-form use.
- Word counts differ between settings (86 to 127 on the same clip),
  so accuracy should be checked, not assumed.

### AI assistance
- Used Claude to help with setup, debugging the errors above, the
  speed experiments and server-code changes. The model settings were
  selected after comparing measured timings and listening to the
  resulting clip; AI assistance did not replace those experiments.
  We ran and reviewed the resulting workflow.

## Oct 29, 2026 (Day 5)

### Integrating the shared work
- Started from the `feature/sabi-agent` branch, which already included
  the `feature/persist-workspace-state` commit.
- Fetched the latest `origin/main` and merged its three newer shared
  commits into `feature/sabi-agent`. The incoming work included README
  updates and the faster-whisper batched-inference change in `app.py`
  (beam size 1, batch size 4).
- Resolved the README overlap by keeping the current setup steps and
  workspace persistence notes, adding the offline startup instruction,
  and updating the project status so it describes Sabi Agent as a
  front-end mock rather than a real AI feature.
- Pushed the merge to `origin/feature/sabi-agent` at
  `8e598c3` (`Merge latest main into Sabi Agent`).

### Sabi Agent implementation
- Added a typed front-end service contract and deterministic mock
  service; no backend or AI API calls were added.
- Added the Story Brief, tone/platform settings, candidate-moment list
  and filters, transcript-linked highlighting/seeking, and the
  storyboard editor.
- Added storyboard reorder controls, half-second caption-snapped or
  free trims, arc slots, duration meter, over-target trimming,
  undo/redo, and per-media local storage persistence.
- Added mock editor chat and actionable suggestions, stitched preview
  controls using the existing media player, and JSON, SRT, CSV and
  clipboard cut-list exports.
- Added a 15-moment Nigerian podcast sample fixture, feature README,
  Vitest configuration, utility tests and component interaction tests.
- Integrated the panel into the workspace toolbar with a Ctrl/Cmd+J
  shortcut and kept the existing workspace, transcript, player, theme
  tokens and Zustand state patterns.

### Verification
- `npm run typecheck` passed.
- `npm test` passed: 11 tests across utility/exporter and component
  interaction suites.
- `npm run build` passed for the merged Next.js frontend.
- `git diff --check` passed and the Sabi Agent branch was clean after
  the merge was pushed.
- Started the frontend locally; `/workspace` returned HTTP 200. In the
  browser, used a mocked transcription response to verify opening Sabi
  Agent, finding three suggested moments, and adding a moment to the
  storyboard.
- A follow-up real transcription request returned HTTP 500 because
  FastAPI was not running. Python was not available in this Windows
  environment and WSL had no installed distribution, so the updated
  server could not be started or syntax-checked here. This is an
  environment limitation, not a successful live-backend test.

### Deployment status and remaining work
- Started exploring a Vercel deployment, then stopped at the user's
  request before creating a project or deployment. Vercel CLI
  authentication was not completed.
- The frontend expects a local FastAPI server by default. A Vercel
  deployment with working transcription requires a separately hosted
  API and a configured `API_BASE_URL`.
- Sabi Agent suggestions and chat remain mocked. The real AI/service
  adapter, production backend, and end-to-end transcription verification
  are still future work.

### AI assistance
- Used Copilot in VS Code to help explore the existing app, draft and
  integrate Sabi Agent frontend code, update documentation, and add/run
  tests. The feature brief, editing flow and interaction priorities
  came from the team's product decisions; suggestions and code were
  checked against the existing app and revised during implementation.
- We ran the type check, tests, production build and a browser smoke
  test. We recorded the real-transcription failure rather than
  presenting the mocked browser flow as a successful backend test.
- This log distinguishes what we exercised from what remains a mock or
  unverified. Keep that distinction in future entries, especially when
  describing AI-assisted code or test results.
