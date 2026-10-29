import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

/**
 * Peças visuais das imagens das lojas.
 * Tudo em "u" (1u = 1px numa tela de 1290 de largura): o mesmo slide serve aos
 * dois tamanhos; no Android (mais curto) só corta a parte de baixo.
 */

export const NAVY = "#0b1a2e";
export const AMBER = "#FFB300";
export const BLUE = "#2563eb";
export const GREEN = "#10b981";
export const RED = "#ef4444";
export const WHATS = "#25d366";

export const useU = () => {
  const { width } = useVideoConfig();
  return width / 1290;
};

export const Fundo: React.FC = () => {
  const u = useU();
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 1150 * u,
          width: 1700 * u,
          height: 1700 * u,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0.18) 38%, rgba(11,26,46,0) 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)",
          backgroundSize: `${34 * u}px ${34 * u}px`,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 45%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Título: **palavra** em âmbar; "\n" quebra a linha. */
export const Titulo: React.FC<{ titulo: string; sub?: string; top?: number }> = ({ titulo, sub, top = 150 }) => {
  const u = useU();
  const parts = titulo.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div style={{ position: "absolute", top: top * u, left: 70 * u, right: 70 * u, textAlign: "center" }}>
      <div
        style={{
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 118 * u,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: "white",
          textWrap: "balance",
          whiteSpace: "pre-line",
        }}
      >
        {parts.map((p, i) =>
          p.startsWith("**") ? (
            <span key={i} style={{ color: AMBER }}>
              {p.slice(2, -2)}
            </span>
          ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
          ),
        )}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 34 * u,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 46 * u,
            lineHeight: 1.3,
            color: "rgba(226,234,246,0.82)",
            textWrap: "balance",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/** Celular (PhoneScreen com scale=1, 414x868) posicionado no slide. */
export const Celular: React.FC<{
  top?: number;
  escala?: number;
  x?: number;
  rot?: number;
  children: React.ReactNode;
}> = ({ top = 760, escala = 2.3, x = 0, rot = 0, children }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        top: top * u,
        left: "50%",
        translate: `calc(-50% + ${x * u}px) 0px`,
        rotate: `${rot}deg`,
        transformOrigin: "50% 0%",
        filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.35))",
      }}
    >
      <div style={{ width: 414, height: 868, scale: String(escala * u), transformOrigin: "50% 0%" }}>{children}</div>
    </div>
  );
};

/** Etiqueta acima do celular: "Celular do pai", "Seu celular". */
export const Rotulo: React.FC<{ x: number; y: number; texto: string; cor?: "verde" | "azul" }> = ({
  x,
  y,
  texto,
  cor = "azul",
}) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        translate: "-50% 0",
        padding: `${16 * u}px ${36 * u}px`,
        borderRadius: 999,
        background: cor === "verde" ? "#d1fae5" : "#dbe6ff",
        color: cor === "verde" ? "#047857" : BLUE,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 40 * u,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

/** Cartão flutuante por cima do celular. */
export const Destaque: React.FC<{
  x: number;
  y: number;
  rot?: number;
  cor: string;
  icone: React.ElementType;
  titulo: string;
  texto?: string;
}> = ({ x, y, rot = 0, cor, icone: I, titulo, texto }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        rotate: `${rot}deg`,
        display: "flex",
        alignItems: "center",
        gap: 26 * u,
        padding: `${28 * u}px ${42 * u}px ${28 * u}px ${28 * u}px`,
        borderRadius: 40 * u,
        background: "white",
        boxShadow: "0 30px 60px -18px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: 92 * u,
          height: 92 * u,
          borderRadius: 28 * u,
          background: cor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
        }}
      >
        <I style={{ width: 50 * u, height: 50 * u }} strokeWidth={2.4} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 * u }}>
        <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 46 * u, color: NAVY, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
          {titulo}
        </span>
        {texto && <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 34 * u, color: "#6b7280", whiteSpace: "nowrap" }}>{texto}</span>}
      </div>
    </div>
  );
};

/** Elemento solto (ex.: bolha do WhatsApp) desenhado em px de celular e ampliado. */
export const Ampliado: React.FC<{
  x: number;
  y: number;
  largura: number;
  escala: number;
  rot?: number;
  children: React.ReactNode;
}> = ({ x, y, largura, escala, rot = 0, children }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        width: largura,
        scale: String(escala * u),
        transformOrigin: "0 0",
        rotate: `${rot}deg`,
        filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))",
      }}
    >
      {children}
    </div>
  );
};

/** Selo de teste grátis. */
export const SeloTeste: React.FC<{ y: number }> = ({ y }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: y * u, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: `${24 * u}px ${48 * u}px`,
          borderRadius: 999,
          background: AMBER,
          color: NAVY,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 46 * u,
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
        }}
      >
        Teste grátis por 15 dias
      </div>
    </div>
  );
};
