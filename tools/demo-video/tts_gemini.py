# İzah kliplərini Gemini TTS ilə səsləndirir (Azərbaycan dili avtomatik tanınır).
# Açar skriptdə yoxdur: x-goog-api-key başlığını mühitin şəbəkə proksisi əlavə edir
# və ya GEMINI_API_KEY dəyişəni verilə bilər. Çıxış: <out>/<id>.wav və clips.json (tts_make.py ilə eyni format).
import base64, io, json, os, sys, time, urllib.error, urllib.request, wave
import numpy as np

script, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "Sulafat"
only = set(sys.argv[4].split(",")) if len(sys.argv) > 4 and sys.argv[4] else None
MODEL = os.environ.get("TTS_MODEL", "gemini-3.8-flash-tts")
STYLE = os.environ.get("TTS_STYLE", "calm, warm and clear narrator for a short product video, natural moderate pace")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
os.makedirs(out, exist_ok=True)

def synth(text):
    body = {"contents": [{"role": "user", "parts": [{"text": text, "speech_metadata": {"style": STYLE}}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"voice": voice}}}}
    headers = {"Content-Type": "application/json"}
    if os.environ.get("GEMINI_API_KEY"): headers["x-goog-api-key"] = os.environ["GEMINI_API_KEY"]
    for attempt in range(5):
        req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.load(r)
            part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
            return base64.b64decode(part["data"]), part.get("mimeType", "")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:300]
            if e.code in (429, 500, 503) and attempt < 4:
                time.sleep(8 * (attempt + 1)); continue
            raise SystemExit(f"Gemini xətası {e.code}: {msg}")

def to_array(raw, mime):
    if raw[:4] == b"RIFF":
        with wave.open(io.BytesIO(raw)) as w:
            sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    else:  # L16 PCM, 24 kHz
        sr = 24000; a = np.frombuffer(raw, dtype=np.int16)
    return a.astype(np.float32) / 32768, sr

def trim(a, sr, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx): return a
    return a[max(0, idx[0] - int(0.04 * sr)): min(len(a), idx[-1] + int(0.12 * sr))]

meta_path = os.path.join(out, "clips.json")
meta = {m["id"]: m for m in json.load(open(meta_path, encoding="utf-8"))} if os.path.exists(meta_path) else {}
for seg in json.load(open(script, encoding="utf-8")):
    if only and seg["id"] not in only: continue
    raw, mime = synth(seg.get("say", seg["sub"]))
    a, sr = to_array(raw, mime)
    a = trim(a, sr)
    a = a / max(1e-6, np.abs(a).max()) * 0.9
    path = os.path.join(out, seg["id"] + ".wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype(np.int16).tobytes())
    meta[seg["id"]] = {"id": seg["id"], "sub": seg["sub"], "file": path, "dur": round(len(a) / sr, 3)}
    print(seg["id"], meta[seg["id"]]["dur"], "s", flush=True)
order = [s["id"] for s in json.load(open(script, encoding="utf-8"))]
json.dump([meta[i] for i in order if i in meta], open(meta_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
