# Hər seqment üçün səs faylı: cümlələr ayrı-ayrı səsləndirilir, aralarına pauza qoyulur
import json, os, sys
import numpy as np
import scipy.io.wavfile as wav
import torch
from transformers import VitsModel, AutoTokenizer

script, out = sys.argv[1], sys.argv[2]
rate = float(sys.argv[3]) if len(sys.argv) > 3 else 1.08
os.makedirs(out, exist_ok=True)
MODEL = "facebook/mms-tts-azj-script_latin"
tok = AutoTokenizer.from_pretrained(MODEL)
model = VitsModel.from_pretrained(MODEL, use_safetensors=True)
model.speaking_rate = rate
model.noise_scale = 0.55          # daha sabit intonasiya
model.noise_scale_duration = 0.7
sr = model.config.sampling_rate
PAUSE = 0.32

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx): return a
    s, e = max(0, idx[0] - int(0.03 * sr)), min(len(a), idx[-1] + int(0.06 * sr))
    return a[s:e]

meta = []
for seg in json.load(open(script, encoding="utf-8")):
    parts = []
    for i, sent in enumerate(seg["tts"]):
        torch.manual_seed(7 + i)
        with torch.no_grad():
            a = model(**tok(sent, return_tensors="pt")).waveform[0].numpy()
        parts.append(trim(a))
        if i < len(seg["tts"]) - 1:
            parts.append(np.zeros(int(PAUSE * sr), dtype=np.float32))
    audio = np.concatenate(parts)
    audio = audio / max(1e-6, np.abs(audio).max()) * 0.9
    path = os.path.join(out, seg["id"] + ".wav")
    wav.write(path, sr, (audio * 32767).astype(np.int16))
    meta.append({"id": seg["id"], "sub": seg["sub"], "file": path, "dur": round(len(audio) / sr, 3)})
    print(seg["id"], meta[-1]["dur"], "s")
json.dump(meta, open(os.path.join(out, "clips.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("total", round(sum(m["dur"] for m in meta), 1), "s")
