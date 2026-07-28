import React from "react";
import { useCurrentFrame } from "remotion";
import { BRAND } from "./brand";

// Nachbau der signOn-Animation der Homepage (steps(1,end), 1,5 s):
// hartes Neon-Flackern, danach stabiles Leuchten in Peach mit Pink-Schein.
type Step = { at: number; opacity: number; shadow: string };

const STEPS: Step[] = [
  { at: 0.0, opacity: 0.18, shadow: "none" },
  { at: 0.12, opacity: 1, shadow: "0 0 22px rgba(242,166,90,.65)" },
  { at: 0.18, opacity: 0.2, shadow: "none" },
  { at: 0.26, opacity: 1, shadow: "0 0 26px rgba(242,166,90,.7)" },
  { at: 0.3, opacity: 0.35, shadow: "none" },
  {
    at: 0.38,
    opacity: 1,
    shadow: "0 0 30px rgba(242,166,90,.75), 0 0 62px rgba(232,98,143,.4)",
  },
  { at: 0.44, opacity: 0.6, shadow: "0 0 12px rgba(242,166,90,.4)" },
  {
    at: 1.0,
    opacity: 1,
    shadow: "0 0 34px rgba(242,166,90,.6), 0 0 78px rgba(232,98,143,.32)",
  },
];

export const neonStateAt = (
  frame: number,
  litFrom: number,
  flickerFrames = 45,
): { opacity: number; shadow: string } => {
  if (frame < litFrom) {
    return { opacity: 0.18, shadow: "none" };
  }
  const p = Math.min(1, (frame - litFrom) / flickerFrames);
  let current = STEPS[0];
  for (const step of STEPS) {
    if (p >= step.at) {
      current = step;
    }
  }
  return { opacity: current.opacity, shadow: current.shadow };
};

export const NeonText: React.FC<{
  children: React.ReactNode;
  litFrom: number;
  flickerFrames?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, litFrom, flickerFrames = 45, color = BRAND.peach, style }) => {
  const frame = useCurrentFrame();
  const { opacity, shadow } = neonStateAt(frame, litFrom, flickerFrames);
  return (
    <div style={{ color, opacity, textShadow: shadow, ...style }}>
      {children}
    </div>
  );
};
