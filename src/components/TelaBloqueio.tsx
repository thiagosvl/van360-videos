import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Tela de bloqueio do celular do pai com as notificações do app Van360 chegando.
 * Não é tela do app: é a representação do celular, com os textos REAIS das
 * notificações (van360-backend: notifications/.../templates/passenger.template.ts).
 */
export type Notificacao = { titulo: string; corpo: string; chegaEm: number; hora?: string };

export const TelaBloqueio: React.FC<{ hora: string; data: string; notificacoes: Notificacao[] }> = ({ hora, data, notificacoes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      className="absolute inset-0 flex flex-col items-center"
      style={{ background: "linear-gradient(160deg, #1e3a8a 0%, #2563eb 45%, #60a5fa 100%)", fontFamily: "Inter" }}
    >
      <div style={{ marginTop: 70, color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600 }}>{data}</div>
      <div style={{ color: "white", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{hora}</div>
      <div className="w-full px-3 mt-8 flex flex-col gap-2">
        {/* a mais nova em cima */}
        {[...notificacoes]
          .filter((n) => frame >= n.chegaEm)
          .reverse()
          .map((n) => {
            const s = spring({ frame: frame - n.chegaEm, fps, config: { damping: 15, mass: 0.6 } });
            return (
              <div
                key={n.titulo + n.chegaEm}
                className="rounded-[22px] px-3.5 py-3 flex gap-3"
                style={{
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(20px)",
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  translate: `0px ${(1 - s) * -30}px`,
                  scale: String(0.96 + 0.04 * s),
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div className="h-9 w-9 rounded-[10px] bg-white flex items-center justify-center shrink-0 overflow-hidden">
                  <Img src={staticFile("logo-van360-3.png")} style={{ width: 30, height: 30, objectFit: "contain" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#111]">Van360</span>
                    <span className="text-[11px] text-[#555]">{n.hora ?? "agora"}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-[#111] leading-snug mt-0.5">{n.titulo}</div>
                  <div className="text-[13px] text-[#222] leading-snug">{n.corpo}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
