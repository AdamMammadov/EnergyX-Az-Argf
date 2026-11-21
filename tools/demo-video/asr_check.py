# Anlaşıqlıq yoxlaması: TTS kliplərini Whisper ilə yenidən mətnə çevirir və söz oxşarlığını hesablayır
import json, sys, re, difflib
import numpy as np
import scipy.io.wavfile as wav
from transformers import pipeline

clips = json.load(open(sys.argv[1], encoding="utf-8"))
script = {s["id"]: s for s in json.load(open(sys.argv[2], encoding="utf-8"))}
asr = pipeline("automatic-speech-recognition", model="openai/whisper-small", device="cpu")
norm = lambda t: re.sub(r"[^a-zəğıöüçş ]", " ", t.lower().replace("i̇", "i")).split()
scores = []
for c in clips:
    sr, a = wav.read(c["file"])
    a = a.astype(np.float32) / 32768
    hyp = asr({"raw": a, "sampling_rate": sr}, generate_kwargs={"language": "azerbaijani", "task": "transcribe"})["text"]
    ref = " ".join(script[c["id"]]["tts"])
    r = difflib.SequenceMatcher(None, norm(ref), norm(hyp)).ratio()
    scores.append(r)
    print(f"{c['id']:6} {r:.2f} | {hyp.strip()[:110]}")
print("mean word similarity:", round(sum(scores) / len(scores), 2))
