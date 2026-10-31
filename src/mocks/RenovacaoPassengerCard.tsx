// Card REAL do aluno na Renovação, com o "aberto/fechado" decidido pelo vídeo.
// O original guarda isso em estado interno: renderizando em várias abas, cada quadro
// tinha um histórico diferente e o card piscava (abria e fechava). Aqui, antes de cada
// quadro ser pintado, o card é tocado se não estiver como o vídeo pede (VideoState.cardAberto).
import React, { useLayoutEffect, useRef } from "react";
import { useVideoState } from "@mocks/videoState";
import { RenovacaoPassengerCard as Original } from "@/components/features/renovacao/RenovacaoPassengerCard.tsx?original";

export * from "@/components/features/renovacao/RenovacaoPassengerCard.tsx?original";

export const RenovacaoPassengerCard = (props: React.ComponentProps<typeof Original>) => {
  const ref = useRef<HTMLDivElement>(null);
  const { cardAberto } = useVideoState();
  const quer = cardAberto === props.item.nome;
  useLayoutEffect(() => {
    const card = ref.current?.firstElementChild as HTMLElement | null;
    const cabecalho = card?.firstElementChild as HTMLElement | null;
    if (!card || !cabecalho) return;
    const aberto = card.children.length > 1;
    if (aberto !== quer) cabecalho.click();
  });
  return (
    <div ref={ref} style={{ display: "contents" }}>
      <Original {...props} />
    </div>
  );
};
