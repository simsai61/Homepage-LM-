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

// Urlaubs-Info als Standbild für Instagram — Feed (1080×1350) und Story (1080×1920).
// Layout nach der bereits geposteten Betriebsurlaub-Story (31.07.), aber mit
// korrigiertem Kontaktblock: E-Mail ist wegen des Domain-Umzugs offline,
// erreichbar ist WhatsApp/Telefon.
export type UrlaubBildProps = {
  zeitraum: string; // z. B. "31.07. — 14.08."
  jahr: string; // z. B. "2026"
  zurueckTag: string; // z. B. "Montag, 17.08."
};

const monoLabel = (size: number, color: string): React.CSSProperties => ({
  fontFamily: `'${FONT_MONO}', monospace`,
  fontSize: size,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  fontWeight: 500,
  color,
});

export const UrlaubBild: React.FC<UrlaubBildProps> = ({
  zeitraum,
  jahr,
  zurueckTag,
}) => {
  const { height } = useVideoConfig();
  const story = height >= 1600; // Story-Format: mehr Luft für die Instagram-UI
  const pad = story ? 250 : 100;

  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {/* Warmer Lichtschein unten wie im Original */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 42% at 50% 88%, rgba(201,60,119,.16), transparent 70%)",
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
        {/* Logo als weiße Röhren-Outline + Claim */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ width: 460 }}>
            <FullLogo mode="outline" color={BRAND.text} />
          </div>
          <div style={monoLabel(26, BRAND.muted)}>{CLAIM}</div>
        </div>

        {/* BETRIEBS / URLAUB mit Markenverlauf */}
        <div style={{ textAlign: "center", lineHeight: 1.02 }}>
          <div
            style={{
              fontFamily: `'${FONT_HEADING}', sans-serif`,
              fontWeight: 700,
              fontSize: 138,
              letterSpacing: "0.02em",
              color: BRAND.text,
            }}
          >
            BETRIEBS
          </div>
          <div
            style={{
              fontFamily: `'${FONT_HEADING}', sans-serif`,
              fontWeight: 700,
              fontSize: 138,
              letterSpacing: "0.02em",
              backgroundImage: BRAND_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            URLAUB
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

        {/* Zeitraum */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={monoLabel(28, BRAND.glow)}>Geschlossen</div>
          <div
            style={{
              fontFamily: `'${FONT_HEADING}', sans-serif`,
              fontWeight: 700,
              fontSize: 112,
              color: BRAND.text,
              whiteSpace: "nowrap",
            }}
          >
            {zeitraum}
          </div>
          <div style={monoLabel(30, BRAND.muted)}>{jahr}</div>
          <div
            style={{
              marginTop: 22,
              fontFamily: `'${FONT_BODY}', sans-serif`,
              fontSize: 42,
              lineHeight: 1.45,
              textAlign: "center",
              color: BRAND.text,
            }}
          >
            Ab <span style={{ color: BRAND.peach, fontWeight: 600 }}>{zurueckTag}</span>
            <br />
            sind wir wieder für Sie da.
          </div>
        </div>

        {/* Kontaktkarte — WhatsApp statt E-Mail (Domain-Umzug!) */}
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
              padding: "38px 60px",
              borderRadius: 22,
              background: "rgba(27,31,42,.85)",
              border: `1px solid ${BRAND.line}`,
            }}
          >
            <div style={monoLabel(26, BRAND.muted)}>Erreichbar per WhatsApp</div>
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
              Schreiben Sie uns jederzeit — wir melden uns
              <br />
              der Reihe nach zurück. E-Mail &amp; Website sind
              <br />
              wegen Umzugs gerade offline.
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
