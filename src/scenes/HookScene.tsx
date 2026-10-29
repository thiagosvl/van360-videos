import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { BRAND, BrandBackground, ease } from "../components/brand";

/** 0–3s: gancho para o motorista parar de rolar o feed. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoPop = spring({ frame: frame - 2, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56, padding: 80 }}>
        <Img
          src={staticFile("logo-van360-3.png")}
          style={{
            width: 300,
            height: 300,
            scale: String(logoPop),
            rotate: `${interpolate(logoPop, [0, 1], [-25, 0])}deg`,
          }}
        />
        <div
          style={{
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            color: BRAND.navy,
            textAlign: "center",
            opacity: interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [10, 30], ["0px 50px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          Motorista de <span style={{ color: BRAND.blue }}>transporte escolar?</span>
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 50,
            color: BRAND.muted,
            textAlign: "center",
            opacity: interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [30, 48], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          Alunos e mensalidades organizados no celular.
        </div>
      </AbsoluteFill>
    </BrandBackground>
  );
};
