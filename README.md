# TEAM-NEXORA



A free, open-weight AI tool that helps video editors search raw footage

by meaning and get captions, built for editors working with

Nigerian-accented speech and indigenous Nigerian languages.



Built for OPEN//BUILD 2026 (OSCA Ile-Ife Hacktoberfest challenge).


> **Status:** Prototype. Transcription, search and SRT export work.
> Long videos are slow on a CPU-only laptop (see Known limitations).
> The teaser feature is a concept and is not built.


##/*tolu*/
> **Status:** Transcription runs locally through FastAPI. The Next.js
> frontend provides the landing page and editing workspace. Search uses
> a local transcript-matching demo until a semantic-search backend is added.


## The problem

Video editors spend a lot of time scrubbing through long raw footage

to find one moment, and then more time creating captions. Many AI

editing tools that help with this are paid, subscription-based in

dollars, and need footage uploaded to the cloud and most of the models are tested with foreign accents.



&#x20;As video editors, seeing long footage after shoots can be intimidating and not having a tool to help transcribe videos for client with Nigerian accent or local languages can be even more frustrating. Existing auto caption features in editing apps often transcribe wrongly as clients are Nigerians with Nigerian accent. This is why we built **SABI**



**Intended users:** video editors and content creators, especially in

Nigeria, working with spoken footage such as interviews, events and

talks.



## Our solution
1. **Transcription (working):** a local server runs an open-weight
   speech model and returns timestamped caption-sized lines for an
   uploaded video or audio file, in the language the user selects
   (English, Yoruba, Igbo, Hausa or Nigerian Pidgin).
2. **Search (working):** type a query in the interface and jump to the
   matching moment in the transcript.
3. **SRT captions export (working).**
4. **Runs on the user's own computer.** After the one-time model
   download, transcription ran with Wi-Fi turned off (tested once).

## Why not existing tools?

Tools like Descript, Premiere Pro, DaVinci Resolve and Opus Clip

already offer transcript-based editing, captions or clip finding. Our

project differs in aiming to be free, open-source and able to run on

the editor's own computer. We have not yet tested how those tools

perform on Nigerian accents or Pidgin, so we make no claims about

that. 



## The AI models
| Role | Model | Licence | Status |
|---|---|---|---|
| Speech-to-text (main) | Sunbird/faster-whisper-51-african-languages (a fine-tune of Whisper large-v3 for 51 African languages) | apache-2.0 | Working |
| Speech-to-text (baseline) | Whisper small via faster-whisper (Systran/faster-whisper-small) | MIT | Tested, less accurate on our clips |


**Why Sunbird:** on the same Nigerian-accented English clip, Whisper
small mishandled several words ("department" became "new classmate",
"on an" became "when I'm") and missed Nigerian slang. The Sunbird
model got nearly all of these right and also transcribed Yoruba and other local languages with
tone marks.

**Access:** the Sunbird model is gated on Hugging Face. You need a
free account, must accept its access conditions on the model page,
and must log in with your own access token.

**Speed:** on a laptop CPU with no GPU, one clip took about [160s] to
transcribe (118 seconds of audio).


**Why these:** The candidates are community fine-tunes of Whisper for

African languages and Nigerian speech. We plan to compare them with

base Whisper on our own test clips and record the results here.





## How it works
Browser interface (Next.js, in `frontend/`) forwards the upload to a
local server (`app.py`, FastAPI), which runs the Sunbird model with
faster-whisper and returns a list of `{start, end, text}` lines.

The model returns long 30-second segments with unreliable segment
times, so the server uses word-level timestamps to build short
caption-sized lines (about 70 characters or 6 seconds at most).

Example:
[106.21s] You are made to give like three to four pages.
[107.29s - 111.99s] They just want you to pour out what you understand and is, well, it's just
[111.99s - 115.53s] for our benefit and I get it, but omo, it's really stressful


## Setup and run
We ran this on Windows 11 using WSL (Ubuntu), because Windows Smart
App Control blocked a compiled dependency (`av`) on our laptop.

**Model server**
1. Install Python 3.10+ and create a virtual environment.
2. `pip install -r requirements.txt` and
   `pip install fastapi uvicorn python-multipart`
3. Create a free Hugging Face account, accept the access conditions on
   the Sunbird model page, create an access token and run
   `hf auth login`. Never commit your token.
4. Start the server (the first start downloads the model, several GB):
   `python -m uvicorn app:app --port 8000`
   After the download it can run offline with
   `HF_HUB_OFFLINE=1 python -m uvicorn app:app --port 8000`

**Interface**
1. Install Node.js 18 or newer.
2. `cd frontend`, then `npm install`, then `npm run dev`
3. Open http://localhost:3000/workspace, choose a short clip, pick a
   language and click Transcribe.

If `npm install` fails on a Windows drive under WSL, copy the
`frontend` folder into the Linux home folder and install there.
Test clips are not included in this repository.

### Known issues
- **Windows Smart App Control** blocked a compiled dependency (`av`)
  with a "Device Guard" error. We did not turn it off. We run the
  project inside WSL (Ubuntu on Windows) instead.
- **PyAV 19** removed an argument that faster-whisper 1.2.1 still
  uses, causing `open() got an unexpected keyword argument
  'metadata_errors'`. Fix: `pip install "av<19"`.
- **Language auto-detection** guessed Yoruba on our English clip and
  produced garbled text. Forcing `language="en"` fixed it.

- **Sunbird segment timestamps** were unreliable (one segment per
  30 seconds). We rebuild lines from word timestamps instead.

- **Captions must be reviewed** before use.

- **Gated model:** reproducing the setup requires a Hugging Face
  account, accepting the model conditions and a personal token.

## Demo
A demo video of the working prototype is linked here: PASTE-THE-LINK
Parts of the video where we waited for the model were cut.


## Testing
One clip per case, run through the model; English also through the
interface. This is not enough to claim general accuracy.

| Case | Clips | Result |
|---|---|---|
| English (Nigerian accent) | 1 | Almost everything correct, including words Whisper small got wrong |
| Yoruba | 1 | Accurate, tone marks correct |
| Igbo | 1 | Transcribed well |
| Hausa | 1 | Transcribed, not checked by a Hausa speaker |
| Pidgin and English mix | 1 | English and Pidgin settings both transcribed well; the Pidgin setting spelled English words the Pidgin way |

**Speed (CPU only, 8 threads, no GPU):** on one 59-second Yoruba clip,
sequential decoding took 487 s in one run and 1170 s in another (we
cannot explain the difference), batched decoding with beam 5 took
about 234 to 267 s, and batched with beam 1 took 154 to 209 s. The
server uses batched beam 1, which read better in our comparison.
Through the interface, a 59-second clip took a little under three
minutes.


## Known limitations
- Results come from single clips and are not statistically reliable.
- Hausa and Igbo output was not checked by a speaker.
- Transcription is slower than real time on a CPU.
- CPU transcription is slower than real time (roughly 3 to 5 times the
  clip length on our laptop). A one-hour video would take hours. A GPU
  or a hosted server is needed for long-form use.
- Captions must be reviewed before use.
- Every language was tested on one clip only, and Hausa output was not
  checked by a speaker.
- Reproducing the setup needs a Hugging Face account, accepting the
  Sunbird model's conditions and a personal token.


After the one-time model download, transcription ran with Wi-Fi turned off (tested twice on Oct27). It works offline.

## Next steps

- **Support for more local languages.**
- **Teaser builder (concept, not built):** take a long podcast
  transcript and propose a one-minute teaser as an ordered cut list
  of real transcript lines, for the editor to review and reorder.
- **Run the server on a GPU** machine and show progress for long files.
- **Test more clips** and noisier audio, and have all languages checked
  by native speakers.



## Team

- Oluwatoberu Victoria, Obafemi Awolowo University

- Ajala Tolulope, Obafemi Awolowo University





## Acknowledgements

- Sunbird AI for the 51-African-languages Whisper fine-tune
  (apache-2.0 per its model page; link: [add it]).
- FastAPI, uvicorn and faster-whisper (licences: [TODO]).
- **AI assistance:** we used Claude (by Anthropic) to help plan the
  project, research existing tools, troubleshoot setup, and write the
  server code. The interface was built with AI assistance as well.
  We ran, tested and edited everything and can explain it.


## Licence

This project is released under the MIT licence (see `LICENSE`).

Models and datasets used have their own licences, listed above.

