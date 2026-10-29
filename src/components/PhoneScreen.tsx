import React from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { AppProviders } from "./AppProviders";

/** Tamanho lógico de um celular comum (iPhone 14/15). */
export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BEZEL = 12;
const STATUS_BAR = 30;
const HOME_INDICATOR = 20;

const StatusBar: React.FC = () => (
  <div
    className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between px-7 text-[13px] font-semibold text-[#0a0a0a]"
    style={{ height: STATUS_BAR, fontFamily: "Inter" }}
  >
    <span>7:30</span>
    <div className="flex items-center gap-1.5">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#0a0a0a">
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#0a0a0a" opacity="0.4" />
        <rect x="2" y="2" width="16" height="8" rx="1.8" fill="#0a0a0a" />
        <rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="#0a0a0a" opacity="0.4" />
      </svg>
    </div>
  </div>
);

/**
 * Moldura de celular que roda as telas REAIS do Van360:
 * navbar do app em cima, menu inferior do app embaixo, conteúdo no meio.
 *
 * - route: rota "aberta" (destaca a aba certa)
 * - scale: quanto ampliar o celular dentro do vídeo de 1080px
 * - scrollY: rolagem do conteúdo (pode ser animada por frame)
 */
export const PhoneScreen: React.FC<{
  route: string;
  pageTitle?: string;
  scale?: number;
  scrollY?: number;
  showChrome?: boolean;
  style?: React.CSSProperties;
  /** Camada por cima da tela inteira (dedo, gaveta de filtros...), em px do celular. */
  overlay?: React.ReactNode;
  /** padding do conteúdo; use "" para telas que já têm o próprio layout */
  contentClassName?: string;
  children: React.ReactNode;
}> = ({ route, pageTitle, scale = 2, scrollY = 0, showChrome = true, style, overlay, contentClassName = "px-4 pt-4 pb-6", children }) => {
  return (
    <div
      style={{
        width: SCREEN_W + BEZEL * 2,
        height: SCREEN_H + BEZEL * 2,
        padding: BEZEL,
        borderRadius: 56,
        background: "#0b0f17",
        boxShadow:
          "0 40px 80px -20px rgba(11,26,46,0.45), 0 0 0 1.5px rgba(255,255,255,0.08) inset",
        scale: String(scale),
        transformOrigin: "top center",
        ...style,
      }}
    >
      <div
        className="phone-screen relative overflow-hidden bg-background font-body"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 44,
          // vira o "viewport" das partes fixed (navbar e menu inferior)
          transform: "translateZ(0)",
          // as variáveis de safe-area que o app já usa
          ["--safe-area-top" as string]: `${STATUS_BAR}px`,
          ["--safe-area-bottom" as string]: `${HOME_INDICATOR}px`,
        }}
      >
        <AppProviders route={route} pageTitle={pageTitle}>
          <StatusBar />
          {showChrome && <AppNavbar role="motorista" />}
          <div
            className="absolute inset-x-0"
            style={{
              top: showChrome ? 64 + STATUS_BAR : STATUS_BAR,
              bottom: showChrome ? 64 + HOME_INDICATOR : 0,
              overflow: "hidden",
            }}
          >
            <div className={contentClassName} style={{ translate: `0px ${-scrollY}px`, minHeight: "100%" }}>
              {children}
            </div>
          </div>
          {showChrome && <BottomNavbar />}
          {overlay && <div className="absolute inset-0 z-[70]">{overlay}</div>}
          <div className="absolute bottom-2 left-1/2 z-[60] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[#0a0a0a]" />
        </AppProviders>
      </div>
    </div>
  );
};
