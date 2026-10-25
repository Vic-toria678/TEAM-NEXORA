TEAM-NEXORA



A free, open-weight AI tool that helps video editors search raw footage

by meaning and get captions, built for editors working with

Nigerian-accented speech.



Built for OPEN//BUILD 2026 (OSCA Ile-Ife Hacktoberfest challenge).



> \*\*Status:\*\* Work in progress (Day 1 of 5). Items marked TODO are not

> built or tested yet.



\## The problem

Video editors spend a lot of time scrubbing through long raw footage

to find one moment, and then more time creating captions. Many AI

editing tools that help with this are paid, subscription-based in

dollars, and need footage uploaded to the cloud and most of the models are tested with foreign accents.



&#x20;As video editors, seeing long footage after shoots can be intimidating and not knowing where to start is a common issue, even after cutting clips, auto caption often transcribe wrongly as clients are nigerians with Nigerian accent. This is why we built..... d



\*\*Intended users:\*\* video editors and content creators, especially in

Nigeria, working with spoken footage such as interviews, events and

talks.



\## Our solution

The tool will:

1\. Transcribe a video using an open-weight speech-to-text model

&#x20;  (TODO: confirm which one after testing).

2\. Let the editor search the transcript by meaning and jump to the

&#x20;  matching timestamp (TODO: build).

3\. Export captions as an `.srt` file (TODO: build if time allows).



\## Why not existing tools?

Tools like Descript, Premiere Pro, DaVinci Resolve and Opus Clip

already offer transcript-based editing, captions or clip finding. Our

project differs in aiming to be free, open-source and able to run on

the editor's own computer. We have not yet tested how those tools

perform on Nigerian accents or Pidgin, so we make no claims about

that. TODO: add your own comparison if you test one.



\## The AI models

| Role | Model | Licence | Status |

|---|---|---|---|

| Speech-to-text (baseline) | Whisper via faster-whisper | TODO: check | Installed, not yet run successfully |

| Speech-to-text (candidate) | Sunbird/asr-whisper-51-african-languages | TODO: check | To test |

| Speech-to-text (candidate) | NaijaVox (Axiveri) | TODO: check | To test |

| Search by meaning | TODO: choose an embedding model | TODO | Not started |



\*\*Why these:\*\* The candidates are community fine-tunes of Whisper for

African languages and Nigerian speech. We plan to compare them with

base Whisper on our own test clips and record the results here.



\*\*Limitations:\*\* TODO: fill in after testing (accuracy on accents,

noise, Pidgin, code-switching, speed).



\## How it works

Video -> transcript with timestamps -> search -> jump to moment.

TODO: add a simple diagram or screenshot once it works.



\## Setup and run

TODO: finalise after the pipeline works. Current plan:

1\. Install Python 3.10+

2\. Clone this repository

3\. Create and activate a virtual environment

4\. `pip install -r requirements.txt`

5\. Put a test video in a `clips/` folder (not included in the repo)

6\. `python transcribe.py`



\### Known issue on Windows

On a Windows laptop with Smart App Control on, `faster-whisper` can

fail with `ImportError: DLL load failed ... Device Guard`, because

Windows blocks a compiled dependency (`av`). We chose not to turn off

Smart App Control and are using WSL (Ubuntu on Windows) instead.

TODO: confirm this works and document the exact steps.



\## Testing

TODO: describe the clips you tested (without sharing private footage),

which models you compared, and the results. Only report what you

actually measured.



\## Known limitations

TODO: list honestly what does not work or is unfinished.



\## Next steps

Ideas we may add later: captions export, finding highlight clips,

turning client feedback into a revision list, support for more local

languages.



\## Team

\- Oluwatoberu Victoria, Obafemi Awolowo University

\- Ajala Tolulope, Obafemi Awolowo University





\## Acknowledgements

\- faster-whisper and OpenAI Whisper (TODO: add licence and links)

\- Sunbird and Axiveri models (TODO: add licence and links once checked)

\- Existing tools were researched for comparison only.

\- \*\*AI assistance:\*\* We used Claude (by Anthropic) to help plan the

&#x20; project, research existing tools and troubleshoot setup. TODO:

&#x20; update this if AI helps write code, and make sure we can explain

&#x20; all submitted code.



\## Licence

This project is released under the MIT licence (see `LICENSE`).

Models and datasets used have their own licences, listed above.

