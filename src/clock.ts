/**
 * Relógio fixo do vídeo: "hoje" é sempre 12/03/2026 às 10h (horário de Brasília).
 * Deixa os vídeos determinísticos: vencimentos, "há 2 min", mês atual e ano
 * letivo saem iguais em qualquer dia que o vídeo for renderizado.
 * Para mudar a data de todos os vídeos, troque VIDEO_NOW.
 */
export const VIDEO_NOW = new Date("2026-03-12T13:00:00Z").getTime();

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
    if (typeof args[0] === "object" && args[0]) args[0] = { ...args[0], behavior: "auto" };
    return original.apply(this, args);
  } as any;
}
