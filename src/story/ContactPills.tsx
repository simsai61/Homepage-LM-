import React from "react";
import { BRAND, FONT_HEADING, FONT_MONO } from "./brand";

// WhatsApp-Glyphe (Markenzeichen, Vektorpfad wie auf der Homepage üblich als Inline-SVG).
export const WhatsAppIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "#fff",
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export const PhoneIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "#fff",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// Kontakt-Knopf im Stil der Homepage-CTAs: Pille, kräftige Fläche, klare Typo.
export const ContactPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  background: string;
  valueColor?: string;
  width?: number;
}> = ({ icon, label, value, background, valueColor = "#fff", width = 760 }) => (
  <div
    style={{
      width,
      display: "flex",
      alignItems: "center",
      gap: 28,
      background,
      borderRadius: 26,
      padding: "30px 40px",
      boxShadow: "0 18px 50px rgba(0,0,0,.35)",
    }}
  >
    <div
      style={{
        width: 86,
        height: 86,
        borderRadius: 22,
        background: "rgba(255,255,255,.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          fontFamily: `'${FONT_MONO}', monospace`,
          fontSize: 26,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.75)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: `'${FONT_HEADING}', sans-serif`,
          fontWeight: 700,
          fontSize: 56,
          color: valueColor,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export const contactPillDefaults = {
  whatsappBackground: BRAND.whatsapp,
  surfaceBackground: BRAND.surface2,
};
