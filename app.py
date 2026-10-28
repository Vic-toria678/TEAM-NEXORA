import json
import os
import tempfile

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from faster_whisper import WhisperModel
from huggingface_hub import hf_hub_download

REPO = "Sunbird/faster-whisper-51-african-languages"
LANG_MAP = json.load(open(hf_hub_download(REPO, "language_map.json")))

# Loaded once when the server starts (takes a while)
model = WhisperModel(REPO, device="cpu", compute_type="int8")

app = FastAPI()


def group_words(words, max_chars=70, max_seconds=6.0):
    """Build short caption-sized lines from word timings."""
    lines, cur = [], []

    def flush():
        text = "".join(w.word for w in cur).strip()
        if text:
            lines.append({
                "start": round(cur[0].start, 2),
                "end": round(cur[-1].end, 2),
                "text": text,
            })

    for w in words:
        cur.append(w)
        text = "".join(x.word for x in cur).strip()
        duration = cur[-1].end - cur[0].start
        sentence_end = w.word.strip().endswith((".", "?", "!"))
        if (sentence_end and len(text) >= 20) or len(text) >= max_chars or duration >= max_seconds:
            flush()
            cur = []
    if cur:
        flush()
    return lines


@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = Form("eng")):
    if language not in LANG_MAP:
        raise HTTPException(status_code=400, detail="Unknown language code")
    suffix = os.path.splitext(file.filename or "")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        path = tmp.name
    try:
        segments, info = model.transcribe(
            path,
            language=LANG_MAP[language],
            task="transcribe",
            beam_size=5,
            vad_filter=True,
            condition_on_previous_text=False,
            word_timestamps=True,
        )
        results = []
        for s in segments:
            if s.words:
                results.extend(group_words(s.words))
            else:
                # fallback: keep the segment as it came
                results.append({
                    "start": round(s.start, 2),
                    "end": round(s.end, 2),
                    "text": s.text.strip(),
                })
        return results
    finally:
        os.remove(path)
