import { MotionGlobalConfig } from "framer-motion";
/**
 * Relógio fixo do vídeo: "hoje" é sempre 12/03/2026 às 10h (horário de Brasília).
 * Deixa os vídeos determinísticos: vencimentos, "há 2 min", mês atual e ano
 * letivo saem iguais em qualquer dia que o vídeo for renderizado.
 * Para mudar a data de todos os vídeos, troque VIDEO_NOW.
 */
export const VIDEO_NOW_PADRAO = new Date("2026-03-12T13:00:00Z").getTime();
export let VIDEO_NOW = VIDEO_NOW_PADRAO;

/**
 * Troca o "hoje" de UM vídeo (ex.: Renovação acontece em dezembro).
 * Chame no corpo do componente da composição, antes de renderizar as telas:
 * cada aba do navegador renderiza só uma composição, então não vaza para outras.
 */
export function usarHoje(iso: string) {
  VIDEO_NOW = new Date(iso).getTime();
}

const RealDate = Date;
class VideoDate extends RealDate {
  constructor(...args: any[]) {
    if (args.length === 0) super(VIDEO_NOW);
    else super(...(args as [any]));
  }
  static now() {
    return VIDEO_NOW;
  }
}
(globalThis as any).Date = VideoDate;

// Rolagens "smooth" do app acontecem no relógio real; no vídeo, são instantâneas.
if (typeof Element !== "undefined") {
  const original = Element.prototype.scrollTo as any;
  Element.prototype.scrollTo = function (this: Element, ...args: any[]) {
    // componentes com rolagem controlada pelo vídeo ignoram rolagens do app
    if (this.closest?.("[data-video-scroll-lock]")) return;
    if (typeof args[0] === "object" && args[0]) args[0] = { ...args[0], behavior: "instant" };
    return original.apply(this, args);
  } as any;
}

// Animações do framer-motion (ex.: lista de parcelas da carteirinha entrando com fade)
// também rodam no relógio real e "piscam" entre quadros. No vídeo, vão direto ao estado final.
MotionGlobalConfig.skipAnimations = true;
