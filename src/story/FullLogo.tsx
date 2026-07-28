import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Volles Logo (BLIT⚡MARKETING mit Rahmenbox) aus homepage-lm assets/logo.svg.
// Wird als Inline-SVG eingebettet, damit fill="currentColor" die CSS-Farbe erbt.
export const FullLogo: React.FC<{
  style?: React.CSSProperties;
  color?: string;
}> = ({ style, color }) => {
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

  return (
    <div
      style={{ color, lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
