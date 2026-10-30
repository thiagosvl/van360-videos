import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { AMBER, NAVY, useU } from "../loja/base";

/**
 * Peças dos posts do feed (1080x1350, 4:5).
 * Medidas em "u" como nas imagens da loja (1u = 1px numa largura de 1290),
 * então o post tem 1290 x 1612u.
 * Ver a lista de posts em ./Posts.tsx.
 */

export const ALTURA = 1612;
export const BRANCO_SUAVE = "rgba(226,234,246,0.82)";

/** **palavra** em âmbar; "\n" quebra a linha. */
export const Destacado: React.FC<{ texto: string; cor?: string }> = ({ texto, cor = AMBER }) => (
  <>
    {texto.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") ? (
        <span key={i} style={{ color: cor }}>
          {p.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/** Fundo navy com brilho azul (posição do brilho ajustável) e pontinhos no topo. */
export const FundoPost: React.FC<{ brilhoY?: number; claro?: boolean }> = ({ brilhoY = 1150, claro = false }) => {
  const u = useU();
  if (claro) {
    return (
      <AbsoluteFill style={{ background: "#f4f7fc", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: brilhoY * u,
            width: 1600 * u,
            height: 1600 * u,
            translate: "-50% -50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0.05) 40%, rgba(244,247,252,0) 70%)",
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: brilhoY * u,
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
          maskImage: "linear-gradient(to bottom, black 0%, transparent 40%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Moldura de todo slide: fundo, logo e @ no rodapé, contador "2/6" e "arrasta" na capa. */
export const Post: React.FC<{
  children: React.ReactNode;
  pagina?: [number, number];
  claro?: boolean;
  brilhoY?: number;
  arrasta?: boolean;
  /** elementos desenhados por cima do esmaecido do rodapé (ex.: cartão Destaque perto do fim) */
  sobre?: React.ReactNode;
}> = ({ children, pagina, claro = false, brilhoY, arrasta = false, sobre }) => {
  const u = useU();
  const corTexto = claro ? "#64748b" : "rgba(226,234,246,0.7)";
  return (
    <AbsoluteFill>
      <FundoPost claro={claro} brilhoY={brilhoY} />
      {children}
      {/* esmaece o que passa por baixo do rodapé (celulares cortados) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 300 * u,
          background: claro
            ? "linear-gradient(to bottom, rgba(244,247,252,0), #f4f7fc 70%)"
            : "linear-gradient(to bottom, rgba(11,26,46,0), #0b1a2e 70%)",
        }}
      />
      {sobre}
      <div
        style={{
          position: "absolute",
          left: 70 * u,
          right: 70 * u,
          bottom: 56 * u,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 * u }}>
          <div
            style={{
              background: "white",
              borderRadius: 18 * u,
              padding: `${12 * u}px ${18 * u}px`,
              boxShadow: claro ? "0 4px 14px rgba(15,23,42,0.08)" : "none",
            }}
          >
            <Img src={staticFile("logo-van360-horizontal.png")} style={{ height: 42 * u, display: "block" }} />
          </div>
          <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 32 * u, color: corTexto }}>@van360.oficial</span>
        </div>
        {arrasta ? (
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 36 * u, color: claro ? NAVY : AMBER }}>
            Arrasta pro lado →
          </span>
        ) : pagina ? (
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32 * u, color: corTexto }}>
            {pagina[0]}/{pagina[1]}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Etiqueta pequena acima do título ("DICA 1", "ANTES"). */
export const Etiqueta: React.FC<{ texto: string; cor?: string; fundo?: string; style?: React.CSSProperties }> = ({
  texto,
  cor = NAVY,
  fundo = AMBER,
  style,
}) => {
  const u = useU();
  return (
    <span
      style={{
        display: "inline-block",
        padding: `${12 * u}px ${30 * u}px`,
        borderRadius: 999,
        background: fundo,
        color: cor,
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 34 * u,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {texto}
    </span>
  );
};

/** Bloco de texto: título grande + parágrafo. Alinhado à esquerda (carrossel) ou centro (estático). */
export const Texto: React.FC<{
  titulo: string;
  sub?: string;
  top: number;
  tamanho?: number;
  centro?: boolean;
  claro?: boolean;
  etiqueta?: React.ReactNode;
}> = ({ titulo, sub, top, tamanho = 112, centro = false, claro = false, etiqueta }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 90 * u, right: 90 * u, textAlign: centro ? "center" : "left" }}>
      {etiqueta && <div style={{ marginBottom: 40 * u }}>{etiqueta}</div>}
      <div
        style={{
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: tamanho * u,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          color: claro ? NAVY : "white",
          textWrap: "balance",
          whiteSpace: "pre-line",
        }}
      >
        <Destacado texto={titulo} cor={claro ? "#2563eb" : AMBER} />
      </div>
      {sub && (
        <div
          style={{
            marginTop: 40 * u,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 48 * u,
            lineHeight: 1.38,
            color: claro ? "#475569" : BRANCO_SUAVE,
            textWrap: "pretty",
            whiteSpace: "pre-line",
          }}
        >
          <Destacado texto={sub} cor={claro ? NAVY : "white"} />
        </div>
      )}
    </div>
  );
};

/** Linha de lista com ícone num quadrado colorido. */
export const Item: React.FC<{
  icone: React.ElementType;
  cor: string;
  titulo: string;
  texto?: string;
  claro?: boolean;
}> = ({ icone: I, cor, titulo, texto, claro = false }) => {
  const u = useU();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34 * u,
        padding: `${30 * u}px ${36 * u}px`,
        borderRadius: 36 * u,
        background: claro ? "white" : "rgba(255,255,255,0.06)",
        border: claro ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: claro ? "0 10px 30px -14px rgba(15,23,42,0.18)" : "none",
      }}
    >
      <div
        style={{
          width: 96 * u,
          height: 96 * u,
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
      <div style={{ display: "flex", flexDirection: "column", gap: 6 * u, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 50 * u,
            letterSpacing: "-0.02em",
            color: claro ? NAVY : "white",
            lineHeight: 1.15,
          }}
        >
          {titulo}
        </span>
        {texto && (
          <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 38 * u, color: claro ? "#64748b" : BRANCO_SUAVE, lineHeight: 1.3 }}>
            {texto}
          </span>
        )}
      </div>
    </div>
  );
};

export const Lista: React.FC<{ top: number; gap?: number; children: React.ReactNode }> = ({ top, gap = 26, children }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 90 * u, right: 90 * u, display: "flex", flexDirection: "column", gap: gap * u }}>
      {children}
    </div>
  );
};

/** Botão/selo âmbar de chamada. */
export const Chamada: React.FC<{ texto: string; top: number }> = ({ texto, top }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: `${30 * u}px ${60 * u}px`,
          borderRadius: 999,
          background: AMBER,
          color: NAVY,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 50 * u,
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
        }}
      >
        {texto}
      </div>
    </div>
  );
};
