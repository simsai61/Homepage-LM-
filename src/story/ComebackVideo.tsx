import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BRAND,
  BRAND_GRADIENT,
  CLAIM,
  CONTACT,
  FONT_BODY,
  FONT_HEADING,
  FONT_MONO,
} from "./brand";
import { BoltSignet } from "./BoltSignet";
import { WhatsAppIcon } from "./ContactPills";
import { FullLogo } from "./FullLogo";
import { loadBrandFonts } from "./fonts";

// Comeback-Video („Das Schild ist wieder an", Variante 4): S1 Blitz & Zünden
// 0-70 · S2 Ansage 70-200 · S3 Datum 200-320 · S4 Nummer 320-440 ·
// S5 leuchtender Schluss 440-510. Kein Blackout — das Schild bleibt an.
export const COMEBACK_DURATION = 510;

const AB_LABEL = "AB MONTAG";
const AB_DATUM = "17.08.";

const LOGO_W = 880;
const LOGO_RATIO = 97.23 / 324.66;
const LOGO_H = LOGO_W * LOGO_RATIO;
const LOGO_X = (1080 - LOGO_W) / 2;
const LOGO_CENTER_Y = 900;
const LOGO_TOP = LOGO_CENTER_Y - LOGO_H / 2;
const DOCK_SCALE = 0.4;
const DOCK_SHIFT = 330 - LOGO_CENTER_Y;
const BOLT_CX = LOGO_X + (107.5 / 324.66) * LOGO_W;
const BOLT_CY = LOGO_TOP + (84.9 / 97.23) * LOGO_H;

const stepAt = (frame: number, steps: Array<[number, number]>, before = 0) => {
  let value = before;
  for (const [at, v] of steps) {
    if (frame >= at) {
      value = v;
    }
  }
  return value;
};

const logoLitAt = (frame: number): number =>
  stepAt(frame, [
    [14, 0.5],
    [15, 0],
    [18, 0.6],
    [19, 0],
    [23, 0.7],
    [24, 0],
    [28, 0.85],
    [31, 0],
    [34, 0.95],
    [44, 1],
  ]);

const mono = (size: number, ls = "0.25em"): React.CSSProperties => ({
  fontFamily: `'${FONT_MONO}', monospace`,
  fontSize: size,
  letterSpacing: ls,
  textTransform: "uppercase",
  fontWeight: 500,
});

const heading = (size: number, weight = 600): React.CSSProperties => ({
  fontFamily: `'${FONT_HEADING}', sans-serif`,
  fontSize: size,
  fontWeight: weight,
  lineHeight: 1.08,
});

// ---------- Szene 2: „Das Schild ist wieder an" (70-200) ----------
const SceneAnsage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const label = "DAS SCHILD IST WIEDER AN";
  const chars = Math.floor(interpolate(frame, [76, 92], [0, label.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const rise = (from: number) =>
    spring({ frame: frame - from, fps, config: { damping: 16 }, durationInFrames: 24 });
  const r1 = rise(96);
  const r2 = rise(104);
  const divider = interpolate(frame, [118, 134], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - (1 - t) * (1 - t),
  });
  const fadeOut = interpolate(frame, [192, 200], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 640,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ ...mono(30, "0.3em"), color: BRAND.glow, minHeight: 40 }}>
          {label.slice(0, chars)}
        </div>
        <div style={{ marginTop: 40, overflow: "hidden" }}>
          <div
            style={{
              ...heading(126, 700),
              letterSpacing: "0.02em",
              color: BRAND.text,
              transform: `translateY(${(1 - r1) * 100}px)`,
              opacity: r1,
              whiteSpace: "nowrap",
            }}
          >
            ZURÜCK AUS
          </div>
        </div>
        <div style={{ overflow: "hidden", paddingBottom: 10 }}>
          <div
            style={{
              ...heading(126, 700),
              letterSpacing: "0.02em",
              backgroundImage: BRAND_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              transform: `translateY(${(1 - r2) * 100}px)`,
              opacity: r2,
              whiteSpace: "nowrap",
            }}
          >
            DEM URLAUB.
          </div>
        </div>
        <div
          style={{
            width: 190,
            height: 5,
            marginTop: 40,
            borderRadius: 3,
            background: BRAND_GRADIENT,
            transform: `scaleX(${divider})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Szene 3: Das Datum (200-320) ----------
const SceneDatum: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const settle = spring({
    frame: frame - 208,
    fps,
    config: { damping: 13 },
    durationInFrames: 26,
  });
  const subIn = interpolate(frame, [226, 238], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [312, 320], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 700,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        {frame >= 204 ? (
          <div style={{ ...mono(32, "0.32em"), color: BRAND.glow }}>{AB_LABEL}</div>
        ) : (
          <div style={{ minHeight: 42 }} />
        )}
        <div
          style={{
            ...heading(210, 700),
            color: BRAND.peach,
            textShadow:
              "0 0 40px rgba(242,166,90,.55), 0 0 90px rgba(232,98,143,.4)",
            transform: `scale(${0.8 + 0.2 * settle})`,
            opacity: settle,
          }}
        >
          {AB_DATUM}
        </div>
        <div style={{ ...mono(30, "0.3em"), color: BRAND.muted, opacity: settle }}>
          2026
        </div>
        <div
          style={{
            fontFamily: `'${FONT_BODY}', sans-serif`,
            fontSize: 44,
            color: BRAND.text,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 8}px)`,
          }}
        >
          Der Laden läuft — es geht wieder los.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Szene 4: Der direkte Draht (320-440) ----------
const NUMBER_BLOCKS: Array<{ text: string; at: number; line: 0 | 1 }> = [
  { text: "+43", at: 338, line: 0 },
  { text: "664", at: 342, line: 0 },
  { text: "372", at: 346, line: 1 },
  { text: "48 08", at: 350, line: 1 },
];

const SceneNummer: React.FC<{ frame: number }> = ({ frame }) => {
  const label = "DER DIREKTE DRAHT";
  const chars = Math.floor(interpolate(frame, [324, 336], [0, label.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const pillLit = stepAt(frame, [
    [328, 1],
    [330, 0.25],
    [332, 1],
  ]);
  const subIn = interpolate(frame, [358, 370], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [432, 440], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blockSpan = (b: (typeof NUMBER_BLOCKS)[number]) => {
    if (frame < b.at) {
      return null;
    }
    const settle = interpolate(frame, [b.at, b.at + 4], [1.06, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <span key={b.text} style={{ display: "inline-block", transform: `scale(${settle})` }}>
        {b.text}
      </span>
    );
  };

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ ...mono(30, "0.3em"), color: BRAND.glow, minHeight: 40 }}>
          {label.slice(0, chars)}
        </div>
        <div
          style={{
            marginTop: 52,
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "26px 52px",
            borderRadius: 999,
            border: `3px solid ${BRAND.whatsapp}`,
            background: BRAND.surface,
            opacity: pillLit,
            boxShadow:
              pillLit === 1
                ? "0 0 34px rgba(37,211,102,.35), inset 0 0 24px rgba(37,211,102,.12)"
                : "none",
          }}
        >
          <WhatsAppIcon size={52} color={BRAND.whatsapp} />
          <span style={{ ...mono(36, "0.2em"), color: BRAND.whatsapp }}>WhatsApp</span>
        </div>
        <div
          style={{
            marginTop: 52,
            ...heading(136, 700),
            lineHeight: 1.06,
            color: BRAND.text,
            textAlign: "center",
            textShadow: "0 0 30px rgba(37,211,102,.18)",
          }}
        >
          <div style={{ display: "flex", gap: 44, justifyContent: "center" }}>
            {NUMBER_BLOCKS.filter((b) => b.line === 0).map(blockSpan)}
          </div>
          <div style={{ display: "flex", gap: 44, justifyContent: "center" }}>
            {NUMBER_BLOCKS.filter((b) => b.line === 1).map(blockSpan)}
          </div>
        </div>
        <div
          style={{
            marginTop: 52,
            fontFamily: `'${FONT_BODY}', sans-serif`,
            fontSize: 40,
            color: BRAND.text,
            opacity: subIn,
          }}
        >
          Schreiben Sie uns — wir legen gleich los.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Szene 5: Leuchtender Schluss (440-510) ----------
const SceneSchluss: React.FC<{ frame: number }> = ({ frame }) => {
  const claimLit = stepAt(frame, [
    [456, 0.85],
    [458, 0.2],
    [460, 1],
    [462, 0.45],
    [464, 1],
  ]);
  const handleIn = interpolate(frame, [470, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: LOGO_TOP + LOGO_H + 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44,
      }}
    >
      <div
        style={{
          ...heading(84, 500),
          color: BRAND.text,
          opacity: claimLit,
          textShadow:
            "0 0 34px rgba(242,166,90,.55), 0 0 70px rgba(232,98,143,.5)",
        }}
      >
        {CLAIM}
      </div>
      <div style={{ ...mono(34), color: BRAND.muted, opacity: handleIn }}>
        {CONTACT.instagram}
      </div>
    </div>
  );
};

// ---------- Hauptkomposition ----------
export const ComebackVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [fontHandle] = useState(() => delayRender("Markenschriften laden"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(fontHandle));
  }, [fontHandle]);

  // Logo-Fahrt: Mitte → oben angedockt (50-70) → zurück zur Mitte (438-464).
  const dockIn = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14 },
    durationInFrames: 26,
  });
  const dockOut = spring({
    frame: frame - 438,
    fps,
    config: { damping: 15 },
    durationInFrames: 26,
  });
  const dock = frame < 50 ? 0 : frame >= 498 ? 0 : dockIn * (1 - dockOut);
  const logoScale = 1 - (1 - DOCK_SCALE) * dock;
  const logoShift = DOCK_SHIFT * dock;

  const lit = logoLitAt(frame);
  const breathe =
    frame >= 44 ? 1 + 0.08 * Math.sin(((frame - 44) / 90) * Math.PI * 2) : 1;
  const logoGlow =
    lit > 0
      ? `drop-shadow(0 0 ${18 * breathe * lit}px rgba(242,166,90,${0.65 * lit})) drop-shadow(0 0 ${52 * breathe * lit}px rgba(232,98,143,${0.5 * lit}))`
      : "none";

  const strikeY = interpolate(frame, [8, 10], [-1400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strikeVisible = frame >= 8 && frame <= 12;
  const flash = stepAt(frame, [
    [10, 0.9],
    [11, 0.9],
    [12, 0.4],
    [13, 0.12],
    [14, 0],
  ]);
  const shake: Record<number, [number, number]> = {
    10: [3, -2],
    11: [-3, 2],
    12: [2, -1],
    13: [-1, 1],
  };
  const [shakeX, shakeY] = shake[frame] ?? [0, 0];

  // Claim unter dem Schild in Szene 1, geht mit dem Andocken.
  const labelLit =
    stepAt(frame, [
      [46, 1],
      [48, 0.2],
      [50, 1],
    ]) *
    interpolate(frame, [50, 58], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {/* Framegenau synthetisiertes Sound-Design, siehe scripts/generate_sound_comeback.py */}
      <Audio src={staticFile("audio/comeback-sound.wav")} />
      {/* Warmer Lichtschein wie bei den Comeback-Bildern */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 46% at 50% 84%, rgba(201,60,119,.18), transparent 70%)",
        }}
      />
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        {frame >= 70 && frame < 200 ? <SceneAnsage frame={frame} /> : null}
        {frame >= 200 && frame < 320 ? <SceneDatum frame={frame} /> : null}
        {frame >= 320 && frame < 440 ? <SceneNummer frame={frame} /> : null}
        {frame >= 450 ? <SceneSchluss frame={frame} /> : null}

        <div
          style={{
            position: "absolute",
            left: LOGO_X,
            top: LOGO_TOP,
            width: LOGO_W,
            transform: `translateY(${logoShift}px) scale(${logoScale})`,
          }}
        >
          <div style={{ position: "relative" }}>
            <FullLogo mode="outline" color={BRAND.line} />
            <FullLogo
              mode="fill"
              color={BRAND.peach}
              style={{
                position: "absolute",
                inset: 0,
                opacity: lit,
                filter: logoGlow,
              }}
            />
          </div>
        </div>

        {frame < 60 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: LOGO_TOP + LOGO_H + 70,
              textAlign: "center",
              ...mono(30, "0.3em"),
              color: BRAND.muted,
              opacity: labelLit,
            }}
          >
            {CLAIM}
          </div>
        ) : null}

        {strikeVisible ? (
          <div
            style={{
              position: "absolute",
              left: BOLT_CX - 130,
              top: BOLT_CY - 420,
              width: 260,
              transform: `translateY(${strikeY}px)`,
              filter:
                "drop-shadow(0 0 30px rgba(242,166,90,.8)) drop-shadow(0 0 80px rgba(232,98,143,.5))",
            }}
          >
            <BoltSignet color={BRAND.peach} style={{ width: "100%" }} />
          </div>
        ) : null}
      </AbsoluteFill>

      {flash > 0 ? (
        <AbsoluteFill style={{ background: "#FFF3E6", opacity: flash }} />
      ) : null}
    </AbsoluteFill>
  );
};
