import json
from faster_whisper import WhisperModel
from huggingface_hub import hf_hub_download

repo = "Sunbird/faster-whisper-51-african-languages"
lang_map = json.load(open(hf_hub_download(repo, "language_map.json")))

model = WhisperModel(repo, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    "clips/clip1.mp4",
    language=lang_map["eng"],
    task="transcribe",
    beam_size=5,
    vad_filter=True,
    condition_on_previous_text=False,
)
for s in segments:
    print(f"[{s.start:.1f}s - {s.end:.1f}s] {s.text}")