import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ease } from "./brand";

/**
 * Conversa de WhatsApp (tela do motorista enviando a mensagem ao pai).
 * Não é tela do Van360: é uma representação simples do WhatsApp,
 * com o papel de parede que o próprio app usa nas prévias.
 */
export const WhatsAppChat: React.FC<{
  contato: string;
  mensagem: string;
  /** frame em que a mensagem aparece */
  enviaEm: number;
  /** desce a conversa (px), para mensagens longas */
  rolagem?: number;
}> = ({ contato, mensagem, enviaEm, rolagem = 0 }) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [enviaEm, enviaEm + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // links em azul, _itálico_ do WhatsApp
  const linhas = mensagem.split("\n");

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Inter" }}>
      {/* topo */}
      <div className="flex items-center gap-3 px-3 pb-2.5 bg-[#f0f2f5] border-b border-[#e5e5e5]" style={{ paddingTop: 38 }}>
        <span className="text-[#54656f] text-xl leading-none">‹</span>
        <div className="h-9 w-9 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] text-sm font-semibold">
          {contato.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#111b21] leading-tight">{contato}</span>
          <span className="text-[11px] text-[#667781]">online</span>
        </div>
      </div>

      {/* conversa */}
      <div className="relative flex-1 bg-[#efeae2] px-3 pt-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/assets/whatsapp-wallpaper.png')" }}
        />
        <div
          className="relative ml-auto max-w-[300px] rounded-[8px] rounded-tr-none bg-[#d9fdd3] px-2.5 pt-1.5 pb-1 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21]"
          style={{
            opacity: show,
            translate: `0px ${(1 - show) * 30}px`,
            scale: String(0.96 + 0.04 * show),
            transformOrigin: "100% 100%",
            marginTop: -rolagem,
          }}
        >
          <div className="text-[12.5px] leading-[17px] space-y-0">
            {linhas.map((l, i) =>
              l.trim() === "" ? (
                <div key={i} className="h-2.5" />
              ) : l.startsWith("http") ? (
                <div key={i} className="text-[#027eb5] underline break-all">
                  {l}
                </div>
              ) : (
                <div key={i}>{renderItalico(l)}</div>
              ),
            )}
          </div>
          <div className="flex justify-end items-center gap-1 text-[10px] text-[#667781] mt-0.5">
            07:42 <span className="text-[#53bdeb] font-bold tracking-[-3px]">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** _itálico_ e *negrito* do WhatsApp */
const renderItalico = (texto: string) =>
  texto.split(/(_[^_]+_|\*[^*]+\*)/g).map((p, i) =>
    p.length > 2 && p.startsWith("_") && p.endsWith("_") ? (
      <em key={i}>{p.slice(1, -1)}</em>
    ) : p.length > 2 && p.startsWith("*") && p.endsWith("*") ? (
      <strong key={i}>{p.slice(1, -1)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
