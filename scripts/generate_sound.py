#!/usr/bin/env python3
"""Sound-Design für das Instagram-Story-Video (495 Frames @ 30 fps = 16,5 s).

Erzeugt public/audio/story-sound.wav — komplett synthetisiert, framegenau auf
die Animation in src/story/StoryVideo.tsx abgestimmt:

  f0-7     Stille (Loop-Naht), ab f4 leiser aufsteigender Whoosh
  f8-13    Blitzeinschlag: Donnerkrache + Sub-Boom
  f14-44   Neon-Zündflackern: Buzz-Bursts exakt auf den Leucht-Intervallen
  f44-475  Röhren-Grundbrummen (atmet im 3-s-Takt wie der Glow)
  f70-415  dunkles Synth-Bett mit Puls alle 16 Frames
  f190/295 Szenen-Whooshes
  f304/308 WhatsApp-Pill: zwei Pops
  f312-324 Nummern-Blöcke: Anzeigetafel-Klacks
  f335     Merk-dir-das-Ping
  f434-442 Claim-Zündflackern
  f475-487 Power-Down, Funken-Knister der Restglut, dann Stille
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
FPS = 30
FRAMES = 495
DUR = FRAMES / FPS
N = int(SR * DUR)

rng = np.random.default_rng(4361)  # fester Seed, reproduzierbar

t_all = np.arange(N) / SR
mix_l = np.zeros(N)
mix_r = np.zeros(N)


def f2s(frame: float) -> float:
    """Frame → Sekunden."""
    return frame / FPS


def add(sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
    """Signal bei Sekunde `at` einmischen. pan: -1 links … +1 rechts."""
    start = int(at * SR)
    end = min(start + len(sig), N)
    if start >= N:
        return
    seg = sig[: end - start]
    gl = gain * (1.0 - max(pan, 0.0) * 0.7)
    gr = gain * (1.0 + min(pan, 0.0) * 0.7)
    mix_l[start:end] += seg * gl
    mix_r[start:end] += seg * gr


def env_ar(n: int, attack: float, release: float) -> np.ndarray:
    """Attack/Release-Hüllkurve in Sekunden."""
    env = np.ones(n)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    env[:a] = np.linspace(0, 1, a)
    env[-r:] *= np.linspace(1, 0, r)
    return env


def lowpass(sig: np.ndarray, cutoff: float) -> np.ndarray:
    """Einfacher One-Pole-Tiefpass."""
    alpha = 1.0 - np.exp(-2.0 * np.pi * cutoff / SR)
    out = np.empty_like(sig)
    acc = 0.0
    for i, x in enumerate(sig):
        acc += alpha * (x - acc)
        out[i] = acc
    return out


def highpass(sig: np.ndarray, cutoff: float) -> np.ndarray:
    return sig - lowpass(sig, cutoff)


def tone(freq: float, dur: float, harmonics: list[tuple[float, float]]) -> np.ndarray:
    """Additiver Ton: Liste aus (Vielfaches, Amplitude)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for mult, amp in harmonics:
        sig += amp * np.sin(2 * np.pi * freq * mult * t)
    return sig


# ---------- 1. Auftakt-Whoosh (f4-f10): Luft reißt auf, bevor er einschlägt ----------
def whoosh(dur: float, f_from: float, f_to: float) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # gleitender Bandpass: Tiefpass mit wanderndem Cutoff minus Tiefpass darunter
    steps = 24
    out = np.zeros(n)
    for i in range(steps):
        s0, s1 = i * n // steps, (i + 1) * n // steps
        c = f_from + (f_to - f_from) * (i / steps)
        chunk = lowpass(noise[s0:s1], c * 1.6) - lowpass(noise[s0:s1], c * 0.5)
        out[s0:s1] = chunk
    out *= np.linspace(0.15, 1.0, n) ** 2
    return out * env_ar(n, 0.02, 0.05)


add(whoosh(f2s(6), 300, 3200), f2s(4), gain=0.35)

# ---------- 2. Blitzeinschlag (f8): Crack + Donner + Sub-Boom ----------
crack_n = int(0.05 * SR)
crack = highpass(rng.standard_normal(crack_n), 1800) * env_ar(crack_n, 0.001, 0.04)
add(crack, f2s(8), gain=1.1)

thunder_n = int(1.6 * SR)
thunder_noise = rng.standard_normal(thunder_n)
decay = np.exp(-np.arange(thunder_n) / (0.38 * SR))
# Cutoff fällt von hell nach dumpf — das „Wegrollen" des Donners
steps = 32
thunder = np.zeros(thunder_n)
for i in range(steps):
    s0, s1 = i * thunder_n // steps, (i + 1) * thunder_n // steps
    c = 2400 * (1 - i / steps) ** 2 + 120
    thunder[s0:s1] = lowpass(thunder_noise[s0:s1], c)
thunder *= decay
add(thunder, f2s(8.5), gain=1.25)
add(thunder * 0.6, f2s(8.5) + 0.013, gain=0.75, pan=0.6)  # Stereo-Breite

sub_n = int(1.0 * SR)
t_sub = np.arange(sub_n) / SR
sub_freq = 52 * np.exp(-t_sub * 1.8) + 34
sub = np.sin(2 * np.pi * np.cumsum(sub_freq) / SR) * np.exp(-t_sub / 0.32)
add(sub, f2s(8), gain=1.0)

# ---------- 3. Zündflackern (f14-44): Buzz exakt auf den Leucht-Intervallen ----------
LIT_INTERVALS = [(14, 15), (18, 19), (23, 24), (28, 31), (34, 44)]
LIT_POWER = [0.5, 0.6, 0.7, 0.85, 0.95]


def neon_buzz(dur: float, level: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for mult, amp in [(1, 1.0), (2, 0.55), (3, 0.35), (4, 0.18), (6, 0.10)]:
        sig += amp * np.sin(2 * np.pi * 100 * mult * t + rng.uniform(0, 6.28))
    sig += 0.35 * (lowpass(rng.standard_normal(n), 900) - lowpass(rng.standard_normal(n), 200))
    return sig * level * env_ar(n, 0.004, 0.012)


for (a, b), power in zip(LIT_INTERVALS, LIT_POWER):
    add(neon_buzz(f2s(b - a), power), f2s(a), gain=0.16)
    tick_n = int(0.012 * SR)
    tick = highpass(rng.standard_normal(tick_n), 2500) * env_ar(tick_n, 0.001, 0.01)
    add(tick, f2s(a), gain=0.10)

# ---------- 4. Röhren-Grundbrummen (f44-475), atmet im 3-Sekunden-Takt ----------
hum_dur = f2s(475 - 44)
hum_n = int(hum_dur * SR)
t_hum = np.arange(hum_n) / SR
hum = np.zeros(hum_n)
for mult, amp in [(1, 1.0), (2, 0.4), (3, 0.22), (5, 0.08)]:
    hum += amp * np.sin(2 * np.pi * 100 * mult * t_hum)
hum *= 1.0 + 0.25 * np.sin(2 * np.pi * t_hum / 3.0)  # Atmen wie der Glow
hum *= env_ar(hum_n, 0.4, 0.6)
add(hum, f2s(44), gain=0.022)

# ---------- 5. Synth-Bett (f70-415): dunkler Puls alle 16 Frames ----------
bed_dur = f2s(415 - 70)
bed_n = int(bed_dur * SR)
t_bed = np.arange(bed_n) / SR


def detuned_saw(freq: float, t: np.ndarray, detune: float) -> np.ndarray:
    out = np.zeros(len(t))
    for d in (-detune, 0.0, detune):
        phase = (freq * (1 + d)) * t
        out += 2.0 * (phase % 1.0) - 1.0
    return out / 3.0


pad = detuned_saw(55.0, t_bed, 0.004) * 0.6 + detuned_saw(82.41, t_bed, 0.005) * 0.4
pad = lowpass(pad, 260)
pulse_period = f2s(16)
pump = 0.55 + 0.45 * np.clip(np.cos(2 * np.pi * (t_bed % pulse_period) / pulse_period * 0.5), 0, 1)
pad *= pump
pad *= env_ar(bed_n, 1.2, 2.0)
add(pad, f2s(70), gain=0.16)

# ---------- 6. Szenen-Whooshes ----------
add(whoosh(0.45, 500, 1800), f2s(68), gain=0.16)   # Logo dockt an
add(whoosh(0.40, 300, 2400), f2s(189), gain=0.20)  # Wischer Szene 3
add(whoosh(0.30, 800, 2000), f2s(294), gain=0.14)  # Schnitt zu Szene 4

# ---------- 7. WhatsApp-Pill (f304/308): zwei Pops ----------
def pop(f_start: float, f_end: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = f_start + (f_end - f_start) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_ar(n, 0.003, dur * 0.7)


add(pop(620, 320, 0.07), f2s(304), gain=0.28)
add(pop(680, 340, 0.09), f2s(308), gain=0.42)

# ---------- 8. Nummern-Klacks (f312/316/320/324) wie eine Anzeigetafel ----------
for i, fr in enumerate([312, 316, 320, 324]):
    n = int(0.045 * SR)
    body = np.sin(2 * np.pi * (900 - i * 60) * np.arange(n) / SR)
    clack = (highpass(rng.standard_normal(n), 1200) * 0.7 + body * 0.5) * env_ar(n, 0.001, 0.035)
    add(clack, f2s(fr), gain=0.30, pan=(-0.25 + i * 0.17))

# ---------- 9. Merk-dir-das-Ping (f335) + Tipp-Impulse (f360/f390) ----------
ping = tone(880, 0.5, [(1, 1.0), (2.01, 0.3), (3.0, 0.12)]) * env_ar(int(0.5 * SR), 0.004, 0.42)
add(ping, f2s(335), gain=0.11)
for fr in (360, 390):
    tick = tone(1320, 0.12, [(1, 1.0), (2.7, 0.2)]) * env_ar(int(0.12 * SR), 0.003, 0.1)
    add(tick, f2s(fr), gain=0.06)

# ---------- 10. Claim-Zündflackern (f434-442) ----------
for fr, dur, lvl in [(434, 2, 0.6), (438, 2, 0.75), (442, 4, 0.9)]:
    add(neon_buzz(f2s(dur), lvl), f2s(fr), gain=0.13)

# ---------- 11. Power-Down (f475) + Funken (f479) + Fizzle (f479-487) ----------
pd_n = int(0.45 * SR)
t_pd = np.arange(pd_n) / SR
pd_freq = 100 * np.exp(-t_pd * 9) + 28
powerdown = np.sin(2 * np.pi * np.cumsum(pd_freq) / SR) * np.exp(-t_pd / 0.16)
add(powerdown, f2s(475), gain=0.5)

spark_n = int(0.03 * SR)
spark = highpass(rng.standard_normal(spark_n), 3000) * env_ar(spark_n, 0.001, 0.025)
add(spark, f2s(479), gain=0.22)

fizz_n = int(f2s(8) * SR)
fizz = highpass(rng.standard_normal(fizz_n), 4000)
fizz *= np.exp(-np.arange(fizz_n) / (0.09 * SR)) * (0.55 + 0.45 * rng.random(fizz_n))
add(fizz, f2s(479), gain=0.14)

# ---------- Master: sanft sättigen, normalisieren, Rampen an den Loop-Nähten ----------
stereo = np.stack([mix_l, mix_r])
stereo = np.tanh(stereo * 1.15)  # weiche Sättigung statt harter Clips
peak = np.max(np.abs(stereo))
stereo *= 0.89 / peak

fade_n = int(0.04 * SR)  # 40 ms Sicherheit an Anfang und Ende
stereo[:, :fade_n] *= np.linspace(0, 1, fade_n)
stereo[:, -fade_n:] *= np.linspace(1, 0, fade_n)

out_path = Path(__file__).resolve().parent.parent / "public" / "audio" / "story-sound.wav"
out_path.parent.mkdir(parents=True, exist_ok=True)
pcm = (stereo.T * 32767).astype(np.int16)
with wave.open(str(out_path), "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())

print(f"OK {out_path} — {DUR:.2f}s, Peak {np.max(np.abs(stereo)):.2f}")
