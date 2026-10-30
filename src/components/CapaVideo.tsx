import React from "react";
import { AbsoluteFill, Freeze, Img, staticFile } from "remotion";
import { BRAND } from "./brand";
import { SemLegenda } from "./tutorial";

export type CapaProps = {
  /** vídeo de onde sai a tela de fundo */
  Video: React.FC;
  /** quadro do vídeo usado de fundo (a tela que aparece no celular) */
  quadro: number;
  /** título; **palavra** fica azul */
  titulo: string;
  /** texto do botão (padrão "Veja como funciona") */
  botao?: string;
  /** ícone antes do texto do botão: texto/emoji ou elemento; null tira (padrão ▶) */
  icone?: React.ReactNode;
  /** linha embaixo do botão, ex.: "Em 45 segundos"; vazio tira */
  subtitulo?: string;
};

/**
 * Capa (miniatura) de qualquer vídeo: um quadro real do vídeo, logo e título em cima,
 * botão embaixo. Tudo configurável por vídeo. O centro fica livre (o WhatsApp põe o play ali).
 * Registrar no Root com `capa(...)` (pasta "Capas") e gerar com `npx remotion still`.
 */
export const CapaVideo: React.FC<CapaProps> = ({ Video, quadro, titulo, botao = "Veja como funciona", icone = "▶", subtitulo }) => (
  <AbsoluteFill>
    <Freeze frame={quadro}>
      <SemLegenda.Provider value>
        <Video />
      </SemLegenda.Provider>
    </Freeze>

    {/* faixa de cima: cobre legenda e rótulo do celular */}
    <AbsoluteFill
      style={{
        height: 465,
        background: "linear-gradient(180deg, #eef3ff 0%, #f5f5f5 80%, rgba(245,245,245,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ height: 84 }} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 240,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 82,
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
        color: BRAND.navy,
      }}
    >
      {titulo.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") ? (
          <span key={i} style={{ color: BRAND.blue }}>
            {p.slice(2, -2)}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </div>

    {/* faixa de baixo: chamada para o play */}
    <AbsoluteFill
      style={{
        top: "auto",
        height: 560,
        background: "linear-gradient(180deg, rgba(11,26,46,0) 0%, rgba(11,26,46,0.85) 45%, #0b1a2e 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        fontFamily: "Manrope",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: BRAND.blue,
          color: "white",
          fontWeight: 800,
          fontSize: 54,
          padding: "26px 52px",
          borderRadius: 999,
          boxShadow: "0 20px 40px -12px rgba(37,99,235,0.6)",
        }}
      >
        {icone != null && <span style={{ fontSize: 44, display: "flex" }}>{icone}</span>}
        {botao}
      </div>
      {subtitulo && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 40, fontWeight: 600 }}>{subtitulo}</div>}
    </div>
  </AbsoluteFill>
);
