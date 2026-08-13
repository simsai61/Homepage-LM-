import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  BRAND,
  BRAND_GRADIENT,
  CLAIM,
  CONTACT,
  FONT_BODY,
  FONT_HEADING,
  FONT_MONO,
} from "./brand";
import { WhatsAppIcon } from "./ContactPills";
import { FullLogo } from "./FullLogo";

// „Wir sind zurück"-Post für nach dem Betriebsurlaub — gleiches Design-System
// wie die Urlaubs-Info (weiße Zeile / Verlaufs-Zeile). Zwei Textvarianten über
// Props, Feed 4:5 und Story 9:16. Das Logo leuchtet wieder: das Schild ist an.
export type ComebackBildProps = {
  kicker: string; // z. B. "WIR SIND ZURÜCK"
  zeile1: string; // große weiße Zeile
  zeile2: string; // große Zeile im Markenverlauf
  abDatum: string; // z. B. "Montag, 17.08."
  sub: string; // Satz unter dem Datum
};

const monoLabel = (size: number, color: string): React.CSSProperties => ({
  fontFamily: `'${FONT_MONO}', monospace`,
  fontSize: size,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  fontWeight: 500,
  color,
});

const bigLine: React.CSSProperties = {
  fontFamily: `'${FONT_HEADING}', sans-serif`,
  fontWeight: 700,
  fontSize: 132,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
};

export const ComebackBild: React.FC<ComebackBildProps> = ({
  kicker,
  zeile1,
  zeile2,
  abDatum,
  sub,
}) => {
  const { height } = useVideoConfig();
  const story = height >= 1600;
  const pad = story ? 250 : 100;

  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {/* Warmer Lichtschein — beim Comeback kräftiger als beim Urlaubs-Bild */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 46% at 50% 84%, rgba(201,60,119,.22), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: pad,
          bottom: pad,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo — wieder „eingeschaltet": leuchtend statt Outline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ position: "relative", width: 460 }}>
            <FullLogo mode="outline" color={BRAND.line} />
            <FullLogo
              mode="fill"
              color={BRAND.peach}
              style={{
                position: "absolute",
                inset: 0,
                filter:
                  "drop-shadow(0 0 18px rgba(242,166,90,.65)) drop-shadow(0 0 52px rgba(232,98,143,.5))",
              }}
            />
          </div>
          <div style={monoLabel(26, BRAND.muted)}>{CLAIM}</div>
        </div>

        {/* Kicker + große Doppelzeile mit Markenverlauf */}
        <div style={{ textAlign: "center", lineHeight: 1.02 }}>
          <div style={{ ...monoLabel(30, BRAND.glow), marginBottom: 38 }}>
            {kicker}
          </div>
          <div style={{ ...bigLine, color: BRAND.text }}>{zeile1}</div>
          <div
            style={{
              ...bigLine,
              backgroundImage: BRAND_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {zeile2}
          </div>
          <div
            style={{
              width: 190,
              height: 5,
              margin: "44px auto 0",
              borderRadius: 3,
              background: BRAND_GRADIENT,
            }}
          />
        </div>

        {/* Ab-Datum + Begleitzeile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={monoLabel(28, BRAND.peach)}>Ab {abDatum}</div>
          <div
            style={{
              fontFamily: `'${FONT_BODY}', sans-serif`,
              fontSize: 42,
              lineHeight: 1.45,
              textAlign: "center",
              color: BRAND.text,
              maxWidth: 860,
            }}
          >
            {sub}
          </div>
        </div>

        {/* Direkter Draht + Absender */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "34px 60px",
              borderRadius: 22,
              background: "rgba(27,31,42,.85)",
              border: `1px solid ${BRAND.line}`,
            }}
          >
            <div style={monoLabel(26, BRAND.muted)}>Der direkte Draht</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontFamily: `'${FONT_HEADING}', sans-serif`,
                fontWeight: 700,
                fontSize: 58,
                color: BRAND.peach,
                whiteSpace: "nowrap",
              }}
            >
              <WhatsAppIcon size={52} color={BRAND.whatsapp} />
              {CONTACT.phoneDisplay}
            </div>
            <div
              style={{
                fontFamily: `'${FONT_BODY}', sans-serif`,
                fontSize: 33,
                lineHeight: 1.5,
                textAlign: "center",
                color: BRAND.muted,
                maxWidth: 720,
              }}
            >
              Schreiben Sie uns — wir legen gleich los.
            </div>
          </div>
          <div style={monoLabel(26, BRAND.muted)}>
            {CONTACT.instagram} · Meiningen
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
