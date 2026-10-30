import React from "react";
import { continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { BRAND, ease } from "./brand";

/* ------------------------------------------------------------------ */
/* Dedo tocando na tela                                                */
/* ------------------------------------------------------------------ */

export type FingerStep = {
  /** frame em que o dedo chega neste ponto */
  at: number;
  /** posição em px do celular (390 x 844) */
  x: number;
  y: number;
  /** toca ao chegar */
  tap?: boolean;
};

const TAP_FRAMES = 14;

/**
 * Indicador de toque. Vai de um ponto a outro e "aperta" onde tap=true.
 * Use dentro do `overlay` do PhoneScreen.
 */
export const Finger: React.FC<{ steps: FingerStep[]; showFrom: number; hideAt: number }> = ({
  steps,
  showFrom,
  hideAt,
}) => {
  const frame = useCurrentFrame();
  if (frame < showFrom - 8 || frame > hideAt + 8 || steps.length === 0) return null;

  // posição: interpola entre o passo anterior e o próximo
  let x = steps[0].x;
  let y = steps[0].y;
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i];
    const b = steps[i + 1];
    const travelStart = b.at - 16;
    if (frame >= a.at && frame <= b.at) {
      const t = interpolate(frame, [Math.max(a.at, travelStart), b.at], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      });
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
    } else if (frame > b.at) {
      x = b.x;
      y = b.y;
    }
  }

  const tap = steps.find((s) => s.tap && frame >= s.at && frame < s.at + TAP_FRAMES);
  const tf = tap ? frame - tap.at : -1;
  const press = tap ? interpolate(tf, [0, 4, 10], [1, 0.82, 1], { extrapolateRight: "clamp" }) : 1;
  const ripple = tap ? interpolate(tf, [0, TAP_FRAMES], [0.4, 1.6], { extrapolateRight: "clamp" }) : 0;
  const rippleOpacity = tap ? interpolate(tf, [0, TAP_FRAMES], [0.5, 0], { extrapolateRight: "clamp" }) : 0;

  const opacity = interpolate(frame, [showFrom - 8, showFrom, hideAt, hideAt + 8], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity, pointerEvents: "none", zIndex: 100 }}>
      {tap && (
        <div
          style={{
            position: "absolute",
            width: 56,
            height: 56,
            left: -28,
            top: -28,
            borderRadius: 99,
            background: BRAND.blue,
            opacity: rippleOpacity,
            scale: String(ripple),
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          width: 34,
          height: 34,
          left: -17,
          top: -17,
          borderRadius: 99,
          background: "rgba(255,255,255,0.85)",
          border: `3px solid ${BRAND.blue}`,
          boxShadow: "0 6px 16px rgba(11,26,46,0.35)",
          scale: String(press),
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Legendas                                                            */
/* ------------------------------------------------------------------ */

/** Trechos de tutoriais reaproveitados em outro vídeo: as legendas originais somem. */
export const SemLegenda = React.createContext(false);

export type Beat = {
  /** texto da fala; **palavra** fica azul */
  text: string;
  from: number;
  duration: number;
};

/**
 * Legenda da fala atual, numa faixa que o player de stories não cobre
 * (abaixo da barra de progresso/título, acima da faixa do botão).
 */
export const Caption: React.FC<{ beats: Beat[]; top?: number }> = ({ beats, top = 230 }) => {
  const frame = useCurrentFrame();
  if (React.useContext(SemLegenda)) return null;
  const beat = beats.find((b) => frame >= b.from && frame < b.from + b.duration);
  if (!beat) return null;

  const local = frame - beat.from;
  const opacity = interpolate(local, [0, 8, beat.duration - 8, beat.duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const parts = beat.text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 60,
        lineHeight: 1.12,
        letterSpacing: "-0.025em",
        color: BRAND.navy,
        opacity,
        translate: interpolate(local, [0, 14], ["0px 24px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        }),
      }}
    >
      <span>
        {parts.map((p, i) =>
          p.startsWith("**") ? (
            <span key={i} style={{ color: BRAND.blue }}>
              {p.slice(2, -2)}
            </span>
          ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
          ),
        )}
      </span>
    </div>
  );
};

/** Duração total de uma lista de falas. */
export const beatsDuration = (beats: Beat[]) =>
  Math.max(...beats.map((b) => b.from + b.duration));

/* ------------------------------------------------------------------ */
/* Espera imagens de diálogos do app carregarem antes de fotografar     */
/* ------------------------------------------------------------------ */

/**
 * Componentes do app mostram "Carregando..." até o onLoad da imagem (ex.: recibo).
 * Enquanto `ativo`, segura o quadro até toda imagem dentro de diálogos estar
 * carregada e visível, para nenhum quadro sair com o carregamento na tela.
 */
export const useImagensProntas = (ativo: boolean) => {
  React.useLayoutEffect(() => {
    if (!ativo) return;
    const handle = delayRender("Esperando imagem do diálogo");
    let vivo = true;
    const checa = () => {
      if (!vivo) return;
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".phone-screen [role='dialog'] img"));
      const prontas = imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0 && !i.className.includes("opacity-0"));
      if (prontas) continueRender(handle);
      else requestAnimationFrame(checa);
    };
    requestAnimationFrame(checa);
    return () => {
      vivo = false;
      continueRender(handle);
    };
  });
};
