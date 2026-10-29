import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ease } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Círculo "à mão" em volta de algo (px do celular), desenhado em ~12 quadros. */
export const Circulo: React.FC<{ x: number; y: number; w: number; h: number; desde: number; ate: number; cor?: string }> = ({
  x,
  y,
  w,
  h,
  desde,
  ate,
  cor = "#2563eb",
}) => {
  const frame = useCurrentFrame();
  const traco = interpolate(frame, [desde, desde + 12], [0, 1], { ...clamp, easing: ease });
  const opacity = interpolate(frame, [ate - 8, ate], [1, 0], clamp);
  if (frame < desde || frame > ate) return null;
  // elipse levemente aberta e inclinada, como um risco de caneta
  const d = `M ${w * 0.92} ${h * 0.22} C ${w * 0.7} ${-h * 0.12}, ${w * 0.08} ${h * 0.02}, ${w * 0.04} ${h * 0.5} C ${0} ${h * 1.02}, ${w * 0.9} ${h * 1.08}, ${w * 0.98} ${h * 0.5} C ${w * 1.02} ${h * 0.24}, ${w * 0.8} ${h * 0.06}, ${w * 0.62} ${h * 0.04}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, overflow: "visible", opacity, zIndex: 90 }}>
      <path d={d} fill="none" stroke={cor} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traco} />
    </svg>
  );
};

/** Confetes saindo de um ponto (px do celular). Determinístico: mesmo quadro, mesmo desenho. */
export const Confetes: React.FC<{ x: number; y: number; desde: number; quantidade?: number }> = ({ x, y, desde, quantidade = 36 }) => {
  const frame = useCurrentFrame();
  const t = frame - desde;
  if (t < 0 || t > 60) return null;
  const cores = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#facc15"];
  // pseudo-aleatório fixo por índice
  const r = (i: number, k: number) => {
    const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 95, pointerEvents: "none" }}>
      {Array.from({ length: quantidade }, (_, i) => {
        const ang = -Math.PI / 2 + (r(i, 1) - 0.5) * Math.PI * 1.4;
        const vel = 4 + r(i, 2) * 5;
        const px = x + Math.cos(ang) * vel * t;
        const py = y + Math.sin(ang) * vel * t + 0.12 * t * t; // gravidade
        const giro = (r(i, 3) - 0.5) * 40 * t;
        const op = interpolate(t, [0, 6, 45, 60], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 6 + r(i, 4) * 4,
              height: 3 + r(i, 5) * 3,
              background: cores[i % cores.length],
              borderRadius: 1,
              rotate: `${giro}deg`,
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
};
