import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Volles Logo (BLIT⚡MARKETING mit Rahmenbox) aus homepage-lm assets/logo.svg.
// Inline-SVG, damit fill="currentColor" die CSS-Farbe erbt. Der Outline-Modus
// zeichnet nur die Konturen — das Logo als ausgeschaltetes Neonschild.
export const FullLogo: React.FC<{
  style?: React.CSSProperties;
  color?: string;
  mode?: "fill" | "outline";
}> = ({ style, color, mode = "fill" }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [handle] = useState(() => delayRender("Logo-SVG laden"));

  useEffect(() => {
    let active = true;
    fetch(staticFile("logo.svg"))
      .then((res) => res.text())
      .then((text) => {
        if (!active) {
          return;
        }
        setSvg(text);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    return () => {
      active = false;
    };
  }, [handle]);

  if (svg === null) {
    return null;
  }

  const attrs =
    mode === "outline"
      ? 'fill="none" stroke="currentColor" stroke-width="0.8"'
      : 'fill="currentColor"';
  const processed = svg
    .replace('fill="currentColor"', attrs)
    .replace("<svg ", '<svg style="width:100%;height:auto;display:block" ');

  return (
    <div
      style={{ color, lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};
