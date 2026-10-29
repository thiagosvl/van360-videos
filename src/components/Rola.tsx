import React, { useLayoutEffect, useRef } from "react";

/**
 * "Rola" um elemento da tela do celular movendo-o para cima (translate), sem scrollTop:
 * o print do quadro sempre pega a posição certa. `seletor` é procurado dentro do celular.
 */
export const RolaElemento: React.FC<{ seletor: string; y: number }> = ({ seletor, y }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current?.closest(".phone-screen")?.querySelector<HTMLElement>(seletor);
    if (el) el.style.translate = `0px ${-y}px`;
  });
  return <div ref={ref} />;
};
