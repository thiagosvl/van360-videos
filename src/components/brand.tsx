import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

// Mesmas fontes do app (index.css: --font-headline Manrope, --font-body Inter).
// Arquivos locais (variáveis, todos os pesos): o render não depende de internet.
loadFont({ family: "Manrope", url: staticFile("fonts/Manrope.woff2"), weight: "200 800" });
loadFont({ family: "Inter", url: staticFile("fonts/Inter.woff2"), weight: "100 900" });

/** Cores oficiais do app (design.md / index.css). */
export const BRAND = {
  navy: "#0b1a2e",
  blue: "#2563eb",
  blueHover: "#1d4ed8",
  ink: "#0a0a0a",
  muted: "#737373",
  canvas: "#f5f5f5",
  whatsapp: "#25d366",
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Fundo claro com um brilho azul suave, igual ao clima do app. */
export const BrandBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 60% at 50% 0%, #e8efff 0%, #f5f5f5 55%, #f5f5f5 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * Título da cena: entra de baixo com fade.
 * Use **palavra** para destacar em azul.
 */
export const Headline: React.FC<{
  text: string;
  delay?: number;
  top?: number;
  size?: number;
}> = ({ text, delay = 0, top = 130, size = 88 }) => {
  const frame = useCurrentFrame();
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
        color: BRAND.navy,
        opacity: interpolate(frame, [delay, delay + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [delay, delay + 20], ["0px 40px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        }),
      }}
    >
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <span key={i} style={{ color: BRAND.blue }}>
            {p.slice(2, -2)}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </div>
  );
};

/** Celular subindo de baixo para dentro do quadro. */
export const usePhoneRise = (delay = 6) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + 26], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
};
