# Səsli video yığımı: kadrlar + izah klipləri (vaxtında) + musiqi (izah zamanı səsi azalır) + yandırılmış altyazı
import json, os, re, subprocess, sys
frames, clips_json, music, fontsdir, out = sys.argv[1:6]
meta = json.load(open(os.path.join(frames, "stamps.json")))
st, end, marks = meta["stamps"], meta["end"], meta["marks"]
base = st[0]
DUR = end - base
clips = json.load(open(clips_json, encoding="utf-8"))
D = {c["id"]: c for c in clips}

# 1) Hər klipin başlanğıc vaxtı (videonun əvvəlindən, saniyə)
starts = {"intro": marks["intro"] - base + 0.6, "home": marks["home"] - base + 0.35, "outro": marks["outro"] - base + 0.5}
acc = marks["steps"] - base
for i, ms in enumerate(marks["durations"]):
    starts[f"s{i + 1}"] = acc + 0.35
    acc += ms / 1000

# 2) Altyazı (SRT): cümlələrə bölünür, vaxt simvol sayına görə paylanır
def sentences(t):
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", t) if p.strip()]
    merged = []
    for p in parts:
        if merged and len(merged[-1]) < 20: merged[-1] += " " + p
        else: merged.append(p)
    return merged
def ts(x):
    x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
cues = []
for cid, t0 in sorted(starts.items(), key=lambda kv: kv[1]):
    c = D[cid]; parts = sentences(c["sub"]); total = sum(len(p) for p in parts); t = t0
    for p in parts:
        d = c["dur"] * len(p) / total
        cues.append((t, t + d + 0.25, p)); t += d
srt = os.path.join(frames, "subs.srt")
with open(srt, "w", encoding="utf-8") as f:
    for i, (a, b, p) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{p}\n\n")

# 3) Kadr siyahısı (real vaxt möhürləri ilə)
lst = os.path.join(frames, "list.txt")
with open(lst, "w") as f:
    for i, t in enumerate(st):
        nxt = st[i + 1] if i + 1 < len(st) else end
        f.write(f"file 'f{i:06d}.jpg'\nduration {max(0.001, nxt - t):.4f}\n")
    f.write(f"file 'f{len(st) - 1:06d}.jpg'\n")

# 4) ffmpeg qrafı
order = [cid for cid, _ in sorted(starts.items(), key=lambda kv: kv[1])]
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", music]
for cid in order: cmd += ["-i", D[cid]["file"]]
fc = []
style = "FontName=DejaVu Sans,FontSize=13,PrimaryColour=&H00FFFFFF,BackColour=&H1A101418,BorderStyle=4,Outline=0,Shadow=0,MarginV=26,MarginL=40,MarginR=40,Alignment=2"
fc.append(f"[0:v]fps=30,scale=1920:1080:flags=lanczos,subtitles={srt}:fontsdir={fontsdir}:force_style='{style}',format=yuv420p[v]")
for k, cid in enumerate(order):
    ms = int(round(starts[cid] * 1000))
    fc.append(f"[{k + 2}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[c{k}]")
fc.append("".join(f"[c{k}]" for k in range(len(order))) + f"amix=inputs={len(order)}:normalize=0:duration=longest,"
          "highpass=f=80,equalizer=f=3000:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=8:release=150:makeup=2,"
          f"apad=whole_dur={DUR:.2f},asplit=2[vo][sc]")
fc.append(f"[1:a]atrim=0:{DUR:.2f},asetpts=N/SR/TB,afade=t=in:st=0:d=2,afade=t=out:st={DUR - 4:.2f}:d=4,volume=0.6[m]")
fc.append("[m][sc]sidechaincompress=threshold=0.02:ratio=12:attack=25:release=600:makeup=1[md]")
fc.append("[vo][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
cmd += ["-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
        "-t", f"{DUR:.2f}", "-movflags", "+faststart", out]
subprocess.run(cmd, check=True)
print("written", out, round(os.path.getsize(out) / 1e6, 2), "MB |", len(cues), "subtitle cues | duration", round(DUR, 1), "s")
