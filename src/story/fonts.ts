import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Selbst gehostete Markenschriften aus homepage-lm (assets/fonts).
// Das Latin-Subset deckt Umlaute, ß und deutsche Anführungszeichen ab.
const FONTS: Array<{ family: string; file: string; weight: string }> = [
  { family: "Space Grotesk", file: "space-grotesk-500-latin.woff2", weight: "500" },
  { family: "Space Grotesk", file: "space-grotesk-600-latin.woff2", weight: "600" },
  { family: "Space Grotesk", file: "space-grotesk-700-latin.woff2", weight: "700" },
  { family: "Inter", file: "inter-400-latin.woff2", weight: "400" },
  { family: "Inter", file: "inter-500-latin.woff2", weight: "500" },
  { family: "Inter", file: "inter-600-latin.woff2", weight: "600" },
  { family: "IBM Plex Mono", file: "ibm-plex-mono-400-latin.woff2", weight: "400" },
  { family: "IBM Plex Mono", file: "ibm-plex-mono-500-latin.woff2", weight: "500" },
];

export const loadBrandFonts = () =>
  Promise.all(
    FONTS.map((f) =>
      loadFont({
        family: f.family,
        url: staticFile(`fonts/${f.file}`),
        weight: f.weight,
      }),
    ),
  );
