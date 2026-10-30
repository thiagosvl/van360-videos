import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND } from "../components/brand";
import { SemLegenda } from "../components/tutorial";
import { TutorialParcelas } from "../tutoriais/TutorialParcelas";

/**
 * Capa do vídeo de apresentação (miniatura do WhatsApp).
 * Renderizar o quadro 230 (tela do painel). Usar como primeiro quadro do vídeo (~0,5s) no CapCut.
 * O centro fica livre de texto: o WhatsApp põe o botão de play ali.
 */
export const Capa: React.FC = () => (
  <AbsoluteFill>
    {/* tela real do painel de parcelas */}
    <SemLegenda.Provider value>
      <TutorialParcelas />
    </SemLegenda.Provider>

    {/* faixa de cima: cobre o título do tutorial */}
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
      Sua van escolar <span style={{ color: BRAND.blue }}>organizada</span> no celular
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
        <span style={{ fontSize: 44 }}>▶</span> Veja como funciona
      </div>
      <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 40, fontWeight: 600 }}>
        Em 1 minuto e meio
      </div>
    </div>
  </AbsoluteFill>
);
