import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
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

// Ablauf (30 fps): S1 Blitz 0-70 · S2 Ansage 70-190 · S3 Klartext 190-295 ·
// S4 Nummer 295-415 · S5 Absender & Blackout 415-495. Loop-Naht: 488-495 = 0-7.
export const STORY_DURATION = 495;
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const STORY_FPS = 30;

// ---------- Layout-Konstanten ----------
// Logo-Schild: Szene 1/5 mittig in voller Größe, Szenen 2-4 oben angedockt.
const LOGO_W = 880;
const LOGO_RATIO = 97.23 / 324.66; // Seitenverhältnis aus der viewBox
const LOGO_H = LOGO_W * LOGO_RATIO; // ≈ 263 px
const LOGO_X = (STORY_WIDTH - LOGO_W) / 2;
const LOGO_CENTER_Y = 900;
const LOGO_TOP = LOGO_CENTER_Y - LOGO_H / 2;
const DOCK_SCALE = 0.4;
const DOCK_CENTER_Y = 330;
const DOCK_SHIFT = DOCK_CENTER_Y - LOGO_CENTER_Y;

// Blitz-Position innerhalb des Logos (aus den Signet-Polygonen in logo.svg):
// x 99.45–115.5 von 324.66, y 71.64–98.23 von 97.23.
const BOLT_CX = LOGO_X + (107.5 / 324.66) * LOGO_W;
const BOLT_CY = LOGO_TOP + (84.9 / 97.23) * LOGO_H;

// ---------- Hilfen ----------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Stufenschaltung wie eine Neonröhre: Wert hält bis zum nächsten Schaltpunkt.
const stepAt = (frame: number, steps: Array<[number, number]>, before = 0) => {
  let value = before;
  for (const [at, v] of steps) {
    if (frame >= at) {
      value = v;
    }
  }
  return value;
};

// Zündflackern des Logos (Frames 14-44, unregelmäßig, mit wachsender Kraft),
// ab 44 stabil. Liefert die Leuchtstärke 0..1.
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

// Blackout am Schluss: Stufen-Kollaps 475-478, Halb-Aufblitzen bei 479, dann aus.
const powerAt = (frame: number): number =>
  frame < 475
    ? 1
    : stepAt(frame, [
        [475, 0.55],
        [476, 0.3],
        [477, 0.15],
        [478, 0.05],
        [479, 0.45],
        [480, 0],
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

// ---------- Szene 2: Die Ansage (70-190) ----------
const SceneAnsage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const rise = (from: number) =>
    spring({ frame: frame - from, fps, config: { damping: 16 }, durationInFrames: 24 });
  const label = "UPGRADE LÄUFT";
  const chars = Math.floor(interpolate(frame, [78, 88], [0, label.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const r1 = rise(90);
  const r2 = rise(98);
  const subIn = interpolate(frame, [106, 116], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shimmerX = interpolate(frame, [112, 148], [-160, 680], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 660 }}>
      <div style={{ ...mono(34, "0.35em"), color: BRAND.glow, minHeight: 44 }}>
        {label.slice(0, chars)}
      </div>
      <div style={{ marginTop: 44, overflow: "hidden" }}>
        <div
          style={{
            ...heading(84),
            color: BRAND.text,
            textShadow: "0 0 40px rgba(232,98,143,.25)",
            transform: `translateY(${(1 - r1) * 90}px)`,
            opacity: r1,
            whiteSpace: "nowrap",
          }}
        >
          Wir transferieren
        </div>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            ...heading(84),
            color: BRAND.text,
            textShadow: "0 0 40px rgba(232,98,143,.25)",
            transform: `translateY(${(1 - r2) * 90}px)`,
            opacity: r2,
            whiteSpace: "nowrap",
          }}
        >
          unsere Homepage.
        </div>
      </div>
      <div
        style={{
          marginTop: 48,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 8}px)`,
        }}
      >
        <div
          style={{
            ...mono(36, "0.06em"),
            color: BRAND.muted,
            textTransform: "none",
            whiteSpace: "nowrap",
          }}
        >
          {CONTACT.domain} bekommt ein Upgrade.
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 38,
              marginLeft: 16,
              verticalAlign: "-4px",
              background: BRAND.glow,
              opacity: cursorOn ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            width: 660,
            height: 3,
            background: BRAND.line,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 150,
              height: 3,
              background: BRAND_GRADIENT,
              transform: `translateX(${shimmerX}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ---------- Szene 3: Status-Paar (190-295) ----------
// Zwei Zustände wie am Sicherungskasten: die tote Röhre (Offline, gedimmt)
// und die lebendige (WhatsApp und Telefon, leuchtend).
const SceneKlartext: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const wipe = interpolate(frame, [190, 200], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = (from: number) =>
    spring({ frame: frame - from, fps, config: { damping: 16 }, durationInFrames: 24 });
  const r1 = rise(204);
  const r2 = rise(228);
  const underline = interpolate(frame, [244, 258], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - (1 - t) * (1 - t),
  });

  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        clipPath: `inset(${wipe}% 0 0 0)`,
      }}
    >
      <div style={{ position: "absolute", left: 120, right: 120, top: 620 }}>
        {frame >= 200 ? (
          <div style={{ ...mono(30), color: BRAND.muted }}>
            E-MAIL UND WEBSITE
          </div>
        ) : (
          <div style={{ minHeight: 40 }} />
        )}
        <div style={{ marginTop: 24, overflow: "hidden", paddingBottom: 6 }}>
          <div
            style={{
              ...heading(88),
              color: BRAND.muted,
              transform: `translateY(${(1 - r1) * 80}px)`,
              opacity: r1 * 0.85,
              whiteSpace: "nowrap",
            }}
          >
            Offline.
          </div>
        </div>
        <div style={{ marginTop: 64 }}>
          {frame >= 224 ? (
            <div style={{ ...mono(30), color: BRAND.glow }}>
              ERREICHBAR ÜBER
            </div>
          ) : (
            <div style={{ minHeight: 40 }} />
          )}
        </div>
        <div style={{ marginTop: 24, overflow: "hidden", paddingBottom: 16 }}>
          <div
            style={{
              ...heading(76),
              color: BRAND.text,
              textShadow: "0 0 36px rgba(232,98,143,.3)",
              transform: `translateY(${(1 - r2) * 80}px)`,
              opacity: r2,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ position: "relative", display: "inline-block" }}>
              WhatsApp
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -10,
                  width: "100%",
                  height: 6,
                  background: BRAND.whatsapp,
                  transform: `scaleX(${underline})`,
                  transformOrigin: "left",
                }}
              />
            </span>{" "}
            und Telefon.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Szene 4: Die Nummer (295-415) ----------
const NUMBER_BLOCKS: Array<{ text: string; at: number; line: 0 | 1 }> = [
  { text: "+43", at: 312, line: 0 },
  { text: "664", at: 316, line: 0 },
  { text: "372", at: 320, line: 1 },
  { text: "48 08", at: 324, line: 1 },
];

const SceneNummer: React.FC<{ frame: number }> = ({ frame }) => {
  const label = "DER DIREKTE DRAHT";
  const chars = Math.floor(interpolate(frame, [298, 310], [0, label.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const pillLit = stepAt(frame, [
    [304, 1],
    [306, 0.25],
    [308, 1],
  ]);
  // Merk-dir-das-Puls auf der Nummer (335-347), danach Ruhe.
  const pulse = interpolate(frame, [335, 341, 347], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subIn = interpolate(frame, [340, 352], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Sanfter Tipp-mich-Impuls der Sprechblase bei Frame 360 und 390.
  const glyphPulse =
    0.06 * Math.sin(Math.PI * clamp01((frame - 360) / 14)) +
    0.06 * Math.sin(Math.PI * clamp01((frame - 390) / 14));
  const fadeOut = interpolate(frame, [410, 418], [1, 0], {
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
          top: 560,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ ...mono(28), color: BRAND.glow, minHeight: 38 }}>
          {label.slice(0, chars)}
        </div>
        <div
          style={{
            marginTop: 56,
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
          <div style={{ transform: `scale(${1 + glyphPulse})` }}>
            <WhatsAppIcon size={52} color={BRAND.whatsapp} />
          </div>
          <span style={{ ...mono(36, "0.2em"), color: BRAND.whatsapp }}>WhatsApp</span>
        </div>
        <div
          style={{
            marginTop: 52,
            ...heading(136, 700),
            lineHeight: 1.06,
            color: BRAND.text,
            textAlign: "center",
            textShadow: `0 0 30px rgba(37,211,102,${(0.18 + pulse).toFixed(3)})`,
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
            marginTop: 56,
            fontFamily: `'${FONT_BODY}', sans-serif`,
            fontSize: 40,
            color: BRAND.text,
            opacity: subIn,
          }}
        >
          Schreiben Sie kurz. Ich meld mich.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Szene 5: Absender & Claim (415-495) ----------
const SceneAbsender: React.FC<{ frame: number }> = ({ frame }) => {
  const power = powerAt(frame);
  const claimLit = stepAt(frame, [
    [434, 0.85],
    [436, 0.2],
    [438, 1],
    [440, 0.45],
    [442, 1],
  ]);
  const handleIn = interpolate(frame, [448, 458], [0, 1], {
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
          opacity: claimLit * power,
          textShadow:
            "0 0 34px rgba(242,166,90,.55), 0 0 70px rgba(232,98,143,.5)",
        }}
      >
        {CLAIM}
      </div>
      <div
        style={{
          ...mono(34),
          color: BRAND.muted,
          opacity: handleIn * power,
        }}
      >
        {CONTACT.instagram}
      </div>
    </div>
  );
};

// ---------- Hauptkomposition ----------
export const StoryVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [fontHandle] = useState(() => delayRender("Markenschriften laden"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(fontHandle));
  }, [fontHandle]);

  // Logo-Fahrt: Mitte → oben angedockt (70-90) → zurück zur Mitte (415-432).
  const dockIn = spring({
    frame: frame - 70,
    fps,
    config: { damping: 14 },
    durationInFrames: 26,
  });
  const dockOut = spring({
    frame: frame - 415,
    fps,
    config: { damping: 15 },
    durationInFrames: 26,
  });
  // Ab Frame 470 hart auf 0, damit die Loop-Naht (488-495 = 0-7) pixelgenau ist.
  const dock = frame < 70 ? 0 : frame >= 470 ? 0 : dockIn * (1 - dockOut);
  const logoScale = 1 - (1 - DOCK_SCALE) * dock;
  const logoShift = DOCK_SHIFT * dock;

  const lit = logoLitAt(frame) * powerAt(frame);
  // Glow-Atmen im stabilen Betrieb (44-475), sonst statisch.
  const breathe =
    frame >= 44 && frame < 475
      ? 1 + 0.08 * Math.sin(((frame - 44) / 90) * Math.PI * 2)
      : 1;
  const logoGlow =
    lit > 0
      ? `drop-shadow(0 0 ${18 * breathe * lit}px rgba(242,166,90,${0.65 * lit})) drop-shadow(0 0 ${52 * breathe * lit}px rgba(232,98,143,${0.5 * lit}))`
      : "none";

  // Blitzeinschlag (Frames 8-10) und Vollbild-Flash (10-13) mit Screen-Shake.
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

  // Label unter dem Schild (Szene 1): flackert bei 46 ein, geht mit dem Andocken.
  const labelLit =
    stepAt(frame, [
      [46, 1],
      [48, 0.2],
      [50, 1],
    ]) *
    interpolate(frame, [70, 78], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Restglut des Signets nach dem Blackout (479-487).
  const ember = interpolate(frame, [479, 487], [0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emberVisible = frame >= 479 && frame < 487;

  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        {/* Szenen-Inhalte unter dem Logo-Schild */}
        {frame >= 70 && frame < 202 ? <SceneAnsage frame={frame} /> : null}
        {frame >= 190 && frame < 295 ? <SceneKlartext frame={frame} /> : null}
        {frame >= 295 && frame < 419 ? <SceneNummer frame={frame} /> : null}
        {frame >= 432 ? <SceneAbsender frame={frame} /> : null}

        {/* Das Logo-Schild — läuft als eine durchgehende Ebene durch alle Szenen */}
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

        {/* Label unter dem Schild in Szene 1 */}
        {frame < 80 ? (
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
            WERBEAGENTUR · VORARLBERG
          </div>
        ) : null}

        {/* Einschlagender Blitz */}
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

        {/* Restglut des Signets */}
        {emberVisible ? (
          <div
            style={{
              position: "absolute",
              left: BOLT_CX - 22,
              top: BOLT_CY - 37,
              width: 44,
              opacity: ember,
              filter: `drop-shadow(0 0 ${ember * 40}px rgba(201,60,119,.8))`,
            }}
          >
            <BoltSignet color={BRAND.magenta} style={{ width: "100%" }} />
          </div>
        ) : null}
      </AbsoluteFill>

      {/* Vollbild-Flash über allem */}
      {flash > 0 ? (
        <AbsoluteFill style={{ background: "#FFF3E6", opacity: flash }} />
      ) : null}
    </AbsoluteFill>
  );
};
