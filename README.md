# TEAM-NEXORA



A free, open-weight AI tool that helps video editors search raw footage

by meaning and get captions, built for editors working with

Nigerian-accented speech and indigenous Nigerian languages.



Built for OPEN//BUILD 2026 (OSCA Ile-Ife Hacktoberfest challenge).


> **Status:** Work in progress (Day 3 of 5). Transcription works
> locally through a simple web page connected to a local server.
> The final interface, search and captions export are not built yet.
> Items marked TODO are not done.



## The problem

Video editors spend a lot of time scrubbing through long raw footage

to find one moment, and then more time creating captions. Many AI

editing tools that help with this are paid, subscription-based in

dollars, and need footage uploaded to the cloud and most of the models are tested with foreign accents.



&#x20;As video editors, seeing long footage after shoots can be intimidating and not knowing where to start is a common issue, even after cutting clips, auto caption often transcribe wrongly as clients are nigerians with Nigerian accent. This is why we built..... d



**Intended users:** video editors and content creators, especially in

Nigeria, working with spoken footage such as interviews, events and

talks.



## Our solution
Current state:
1. **Transcription (working):** a local server loads an open-weight
   speech model and returns timestamped caption-sized lines for an
   uploaded video or audio file, in a language the user selects.
2. **Web page (placeholder):** a simple test page lets us upload a
   file, choose a language and see the transcript. Our final
   interface is being built separately and will replace it.
3. **Search by meaning (TODO):** type a query and jump to the matching
   moment.
4. **SRT captions export (TODO).**

## Why not existing tools?

Tools like Descript, Premiere Pro, DaVinci Resolve and Opus Clip

already offer transcript-based editing, captions or clip finding. Our

project differs in aiming to be free, open-source and able to run on

the editor's own computer. We have not yet tested how those tools

perform on Nigerian accents or Pidgin, so we make no claims about

that. TODO: add your own comparison if you test one.



## The AI models
| Role | Model | Licence | Status |
|---|---|---|---|
| Speech-to-text (main) | Sunbird/faster-whisper-51-african-languages (a fine-tune of Whisper large-v3 for 51 African languages) | apache-2.0 per its model page [confirm] | Working |
| Speech-to-text (baseline) | Whisper small via faster-whisper (Systran/faster-whisper-small) | [TODO: check licence on its model page] | Tested, less accurate on our clips |
| Search by meaning | TODO: choose an embedding model | TODO | Not started |

**Why Sunbird:** on the same Nigerian-accented English clip, Whisper
small mishandled several words ("department" became "new classmate",
"on an" became "when I'm") and missed Nigerian slang. The Sunbird
model [got nearly all of these right: describe what you saw].

**Access:** the Sunbird model is gated on Hugging Face. You need a
free account, must accept its access conditions on the model page,
and must log in with your own access token.

**Speed:** on a laptop CPU with no GPU, one clip took about [3mins] to
transcribe (118 seconds of audio).


**Why these:** The candidates are community fine-tunes of Whisper for

African languages and Nigerian speech. We plan to compare them with

base Whisper on our own test clips and record the results here.





## How it works
Browser page -> local server (`app.py`, FastAPI) -> faster-whisper
with the Sunbird model 

The model returns long 30-second segments with unreliable segment
times, so the server uses word-level timestamps to build short
caption-sized lines (about 70 characters or 6 seconds at most).

[106.21s] You are made to give like three to four pages.
[107.29s - 111.99s] They just want you to pour out what you understand and is, well, it's just
[111.99s - 115.53s] for our benefit and I get it, but omo, it's really stressful


## Setup and run
These steps worked on Windows 11 using WSL (Ubuntu). On a machine
where Windows does not block the packages, you can run the same
steps directly on Windows.

1. Install Python 3.10+ and create a virtual environment.
2. Clone this repository.
3. `pip install -r requirements.txt`
4. Create a free Hugging Face account, accept the conditions on the
   Sunbird model page, create an access token, and log in with
   `hf auth login`. Never commit your token.
5. Start the server from the project folder:
   `python -m uvicorn app:app --port 8000`
   The first start downloads the model and takes a while.
6. Open http://localhost:8000, choose a clip, pick a language
   (`eng`, `yor`, `ibo`, `hau`, `pcm`) and click Transcribe.

Test clips are not included in the repository.

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
- **Invented text:** at the end of one clip the model produced words
  that were not spoken ("Visit.", "were."). Captions must be reviewed
  before use.
- **Gated model:** reproducing the setup requires a Hugging Face
  account, accepting the model conditions and a personal token.


## Testing
We tested the Sunbird model on one clip per case, through the
command line and (for English) through the web page.

| Case | Clips | Result | Checked by |
|---|---|---|---|
| English (Nigerian accent) | 1 | Almost everything correct, including words Whisper small got wrong | Victoria |
| Yoruba | 1 | Accurate, tone marks correct | Victoria |
| Igbo | 1 | Transcribed well **not checked** (no Igbo speaker available) | nobody |
| Hausa | 1 | Transcribed, **not checked** (no Hausa speaker available) | nobody |
| Pidgin + English mix | 1 | `eng` and `pcm` both transcribed well; `pcm` spelled English words the Pidgin way | Victoria |

One clip per case is not enough to claim general accuracy.



## Known limitations
- Results come from single clips and are not statistically reliable.
- Hausa and Igbo output was not checked by a speaker.
- Transcription is slower than real time on a CPU.
- The final interface, search and SRT export are not built yet.


After the one-time model download, transcription ran with Wi-Fi turned off (tested twice on Oct27). It works offline.
## Next steps

Ideas we may add later: captions export, finding highlight clips,

turning client feedback into a revision list, support for more local

languages.



## Team

- Oluwatoberu Victoria, Obafemi Awolowo University

- Ajala Tolulope, Obafemi Awolowo University





## Acknowledgements

- Sunbird AI for the 51-African-languages Whisper fine-tune
  (apache-2.0 per its model page; link: [add it]).
- FastAPI, uvicorn and faster-whisper (licences: [TODO]).
- AI assistance: we used Claude to help plan the project, research
  existing tools, troubleshoot setup, and write the server and test
  page. We ran, tested and edited the code and can explain it. [Add
  anything your teammate used AI for.]



## Licence

This project is released under the MIT licence (see `LICENSE`).

Models and datasets used have their own licences, listed above.

