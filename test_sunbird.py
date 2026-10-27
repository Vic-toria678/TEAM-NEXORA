import json
import sys
from faster_whisper import WhisperModel
from huggingface_hub import hf_hub_download

clip = sys.argv[1] if len(sys.argv) > 1 else "clips/clip1.mp4"
lang = sys.argv[2] if len(sys.argv) > 2 else "eng"

repo = "Sunbird/faster-whisper-51-african-languages"
lang_map = json.load(open(hf_hub_download(repo, "language_map.json")))

if lang not in lang_map:
    print("Unknown language code. Available codes:", sorted(lang_map.keys()))
    sys.exit(1)

model = WhisperModel(repo, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    clip,
    language=lang_map[lang],
    task="transcribe",
    beam_size=5,
    vad_filter=True,
    condition_on_previous_text=False,
)
for s in segments:
    print(f"[{s.start:.1f}s - {s.end:.1f}s] {s.text}")