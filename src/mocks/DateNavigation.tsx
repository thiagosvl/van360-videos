// Barra de meses REAL do app, com a rolagem controlada pelo vídeo.
// O original centraliza o mês com getBoundingClientRect + scroll suave, o que
// "dança" quando o celular está ampliado/animado. Aqui a posição é calculada
// a cada quadro (sem escala) e só se move quando o vídeo troca de mês.
import React, { useLayoutEffect, useRef } from "react";
import { DateNavigation as Original } from "@/components/common/DateNavigation.tsx?original";
import { useVideoState } from "@mocks/videoState";

export function DateNavigation(props: React.ComponentProps<typeof Original>) {
  const ref = useRef<HTMLDivElement>(null);
  const { mesScroll } = useVideoState() as { mesScroll?: number };
  const alvo = mesScroll ?? props.mes;

  useLayoutEffect(() => {
    const container = ref.current?.querySelector<HTMLElement>(".overflow-x-auto");
    if (!container) return;
    const botoes = Array.from(container.querySelectorAll<HTMLElement>("button"));
    if (botoes.length === 0) return;
    const x0 = botoes[0].offsetLeft;
    const centro = (i: number) => {
      const b = botoes[Math.max(0, Math.min(botoes.length - 1, i))];
      return b.offsetLeft - x0 + b.offsetWidth / 2;
    };
    const i = alvo - 1;
    const a = Math.floor(i);
    const c = centro(a) + (centro(a + 1) - centro(a)) * (i - a);
    container.scrollLeft = Math.max(0, c - container.clientWidth / 2);
  });

  return (
    <div ref={ref} data-video-scroll-lock>
      <Original {...props} />
    </div>
  );
}
