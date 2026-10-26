from faster_whisper import WhisperModel

model = WhisperModel("small", compute_type="int8")
segments, info = model.transcribe("clips/clip1.mp4", language="en")

print(f"Language used: {info.language} (confidence {info.language_probability:.2f})")
for s in segments:
    print(f"[{s.start:.1f}s - {s.end:.1f}s] {s.text}")
