// Corporate Design von Ländle Blitz Marketing — Quelle: homepage-lm (CSS-Variablen,
// in jeder Datei identisch) und UEBERGABE-AN-NEUEN-CLAUDE.md, Abschnitt 5.
export const BRAND = {
  bg: "#14171F",
  surface: "#1B1F2A",
  surface2: "#20252F",
  glow: "#E8628F",
  glowDim: "#6B3346",
  peach: "#F2A65A",
  magenta: "#C93C77",
  text: "#F2F1EA",
  muted: "#8A8F9E",
  line: "#2C3140",
  whatsapp: "#25D366",
} as const;

export const BRAND_GRADIENT =
  "linear-gradient(135deg, #F2A65A 0%, #E8628F 55%, #C93C77 100%)";

export const FONT_HEADING = "Space Grotesk";
export const FONT_BODY = "Inter";
export const FONT_MONO = "IBM Plex Mono";

export const CONTACT = {
  phoneDisplay: "+43 664 372 48 08",
  phoneTel: "+436643724808",
  whatsapp: "wa.me/436643724808",
  instagram: "@laendleblitzmarketing",
  domain: "lm-agentur.at",
} as const;

export const CLAIM = "Wer nicht wirbt, stirbt.";

// Instagram-Story-Raster: 1080×1920, UI-Zonen oben/unten freihalten.
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = 320;
