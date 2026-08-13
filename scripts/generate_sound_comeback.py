#!/usr/bin/env python3
"""Sound-Design für das Comeback-Video (510 Frames @ 30 fps = 17 s).

Erzeugt public/audio/comeback-sound.wav — gleiche Klangwelt wie das
Transfer-Video (scripts/generate_sound.py), aber ohne Power-Down:
das Schild bleibt am Ende an, der Ton läuft warm aus.

  f0-7     Stille, ab f4 aufsteigender Whoosh
  f8-13    Blitzeinschlag: Crack + Donner + Sub-Boom
  f14-44   Neon-Zündflackern (Buzz-Bursts auf den Leucht-Intervallen)
  f44-498  Röhren-Grundbrummen, atmet im 3-s-Takt
  f70-440  dunkles Synth-Bett mit Puls alle 16 Frames
  f48/198/318  Szenen-Whooshes
  f208     Datum landet: tiefer Snap
  f328/332 WhatsApp-Pill: zwei Pops
  f338-350 Nummern-Klacks
  f456-464 Claim-Zündflackern
  f498-510 warmer Ausklang (Fade, keine Abschaltung)
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
FPS = 30
FRAMES = 510
DUR = FRAMES / FPS
N = int(SR * DUR)

rng = np.random.default_rng(1708)  # fester Seed, reproduzierbar

mix_l = np.zeros(N)
mix_r = np.zeros(N)


def f2s(frame: float) -> float:
    return frame / FPS


def add(sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
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
    env = np.ones(n)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    env[:a] = np.linspace(0, 1, a)
    env[-r:] *= np.linspace(1, 0, r)
    return env


def lowpass(sig: np.ndarray, cutoff: float) -> np.ndarray:
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
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for mult, amp in harmonics:
        sig += amp * np.sin(2 * np.pi * freq * mult * t)
    return sig


def whoosh(dur: float, f_from: float, f_to: float) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    steps = 24
    out = np.zeros(n)
    for i in range(steps):
        s0, s1 = i * n // steps, (i + 1) * n // steps
        c = f_from + (f_to - f_from) * (i / steps)
        out[s0:s1] = lowpass(noise[s0:s1], c * 1.6) - lowpass(noise[s0:s1], c * 0.5)
    out *= np.linspace(0.15, 1.0, n) ** 2
    return out * env_ar(n, 0.02, 0.05)


def neon_buzz(dur: float, level: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for mult, amp in [(1, 1.0), (2, 0.55), (3, 0.35), (4, 0.18), (6, 0.10)]:
        sig += amp * np.sin(2 * np.pi * 100 * mult * t + rng.uniform(0, 6.28))
    sig += 0.35 * (lowpass(rng.standard_normal(n), 900) - lowpass(rng.standard_normal(n), 200))
    return sig * level * env_ar(n, 0.004, 0.012)


def pop(f_start: float, f_end: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = f_start + (f_end - f_start) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_ar(n, 0.003, dur * 0.7)


# 1. Auftakt-Whoosh und Blitzeinschlag
add(whoosh(f2s(6), 300, 3200), f2s(4), gain=0.35)

crack_n = int(0.05 * SR)
crack = highpass(rng.standard_normal(crack_n), 1800) * env_ar(crack_n, 0.001, 0.04)
add(crack, f2s(8), gain=1.1)

thunder_n = int(1.6 * SR)
thunder_noise = rng.standard_normal(thunder_n)
decay = np.exp(-np.arange(thunder_n) / (0.38 * SR))
steps = 32
thunder = np.zeros(thunder_n)
for i in range(steps):
    s0, s1 = i * thunder_n // steps, (i + 1) * thunder_n // steps
    c = 2400 * (1 - i / steps) ** 2 + 120
    thunder[s0:s1] = lowpass(thunder_noise[s0:s1], c)
thunder *= decay
add(thunder, f2s(8.5), gain=1.25)
add(thunder * 0.6, f2s(8.5) + 0.013, gain=0.75, pan=0.6)

sub_n = int(1.0 * SR)
t_sub = np.arange(sub_n) / SR
sub_freq = 52 * np.exp(-t_sub * 1.8) + 34
sub = np.sin(2 * np.pi * np.cumsum(sub_freq) / SR) * np.exp(-t_sub / 0.32)
add(sub, f2s(8), gain=1.0)

# 2. Zündflackern
LIT_INTERVALS = [(14, 15), (18, 19), (23, 24), (28, 31), (34, 44)]
LIT_POWER = [0.5, 0.6, 0.7, 0.85, 0.95]
for (a, b), power in zip(LIT_INTERVALS, LIT_POWER):
    add(neon_buzz(f2s(b - a), power), f2s(a), gain=0.16)
    tick_n = int(0.012 * SR)
    tick = highpass(rng.standard_normal(tick_n), 2500) * env_ar(tick_n, 0.001, 0.01)
    add(tick, f2s(a), gain=0.10)

# 3. Grundbrummen bis zum Schluss (kein Power-Down)
hum_dur = f2s(498 - 44)
hum_n = int(hum_dur * SR)
t_hum = np.arange(hum_n) / SR
hum = np.zeros(hum_n)
for mult, amp in [(1, 1.0), (2, 0.4), (3, 0.22), (5, 0.08)]:
    hum += amp * np.sin(2 * np.pi * 100 * mult * t_hum)
hum *= 1.0 + 0.25 * np.sin(2 * np.pi * t_hum / 3.0)
hum *= env_ar(hum_n, 0.4, 1.2)
add(hum, f2s(44), gain=0.022)

# 4. Synth-Bett
bed_dur = f2s(440 - 70)
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

# 5. Szenen-Whooshes
add(whoosh(0.45, 500, 1800), f2s(48), gain=0.16)
add(whoosh(0.40, 300, 2400), f2s(198), gain=0.20)
add(whoosh(0.30, 800, 2000), f2s(318), gain=0.14)

# 6. Datum landet (f208): tiefer Snap + kurzer Glitzer
add(pop(240, 90, 0.16), f2s(208), gain=0.55)
shimmer = tone(1760, 0.35, [(1, 0.6), (1.5, 0.3), (2.0, 0.2)]) * env_ar(int(0.35 * SR), 0.004, 0.3)
add(shimmer, f2s(210), gain=0.07)

# 7. WhatsApp-Pill + Nummern-Klacks
add(pop(620, 320, 0.07), f2s(328), gain=0.28)
add(pop(680, 340, 0.09), f2s(332), gain=0.42)
for i, fr in enumerate([338, 342, 346, 350]):
    n = int(0.045 * SR)
    body = np.sin(2 * np.pi * (900 - i * 60) * np.arange(n) / SR)
    clack = (highpass(rng.standard_normal(n), 1200) * 0.7 + body * 0.5) * env_ar(n, 0.001, 0.035)
    add(clack, f2s(fr), gain=0.30, pan=(-0.25 + i * 0.17))

# 8. Claim-Zündflackern
for fr, dur, lvl in [(456, 2, 0.6), (460, 2, 0.75), (464, 4, 0.9)]:
    add(neon_buzz(f2s(dur), lvl), f2s(fr), gain=0.13)

# Master
stereo = np.stack([mix_l, mix_r])
stereo = np.tanh(stereo * 1.15)
peak = np.max(np.abs(stereo))
stereo *= 0.89 / peak

fade_in = int(0.04 * SR)
stereo[:, :fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(f2s(12) * SR)  # warmer Ausklang über die letzten 12 Frames
stereo[:, -fade_out:] *= np.linspace(1, 0, fade_out)

out_path = Path(__file__).resolve().parent.parent / "public" / "audio" / "comeback-sound.wav"
out_path.parent.mkdir(parents=True, exist_ok=True)
pcm = (stereo.T * 32767).astype(np.int16)
with wave.open(str(out_path), "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())

print(f"OK {out_path} — {DUR:.2f}s, Peak {np.max(np.abs(stereo)):.2f}")
