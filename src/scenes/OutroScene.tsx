import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, BrandBackground, ease } from "../components/brand";

const fadeUp = (frame: number, start: number) => ({
  opacity: interpolate(frame, [start, start + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  translate: interpolate(frame, [start, start + 20], ["0px 36px", "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  }),
});

/** Fechamento: marca, slogan e chamada para o teste grátis. */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 200 } });

  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 70, padding: 80 }}>
        <Img
          src={staticFile("logo-van360-horizontal.png")}
          style={{ width: 760, height: "auto", scale: String(interpolate(logo, [0, 1], [0.85, 1])), opacity: logo }}
        />
        <div
          style={{
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: BRAND.navy,
            textAlign: "center",
            ...fadeUp(frame, 14),
          }}
        >
          Você dirige.
          <br />
          <span style={{ color: BRAND.blue }}>A gente organiza.</span>
        </div>
        <div
          style={{
            marginTop: 30,
            padding: "34px 64px",
            borderRadius: 999,
            background: BRAND.blue,
            color: "white",
            fontFamily: "Manrope",
            fontWeight: 700,
            fontSize: 52,
            boxShadow: "0 24px 50px -18px rgba(37,99,235,0.7)",
            ...fadeUp(frame, 30),
          }}
        >
          Teste grátis no van360.com.br
        </div>
      </AbsoluteFill>
    </BrandBackground>
  );
};
