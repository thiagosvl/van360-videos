// Barra de abas REAL do app, com a rolagem fixada pelo vídeo.
// O original centraliza a aba ativa 50ms depois de montar, com rolagem suave:
// cada quadro do vídeo é fotografado num momento diferente desse timer, e a
// barra "pisca" (às vezes a aba ativa aparece, às vezes não). Aqui a mesma
// conta (offsetLeft, sem escala) roda antes de cada quadro, sem timer.
import React, { useLayoutEffect, useRef } from "react";
import { AppTabNav as Original } from "@/components/ui/AppTabNav.tsx?original";

export * from "@/components/ui/AppTabNav.tsx?original";

export function AppTabNav(props: React.ComponentProps<typeof Original>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    // o container rolável é o primeiro elemento do AppTabNav (div com overflow-x-auto)
    const container = root?.firstElementChild as HTMLElement | null;
    const ativo = container?.querySelector<HTMLElement>('[data-state="active"]');
    if (!container || !ativo) return;
    // posição sem a escala/zoom do celular no vídeo
    const c = container.getBoundingClientRect();
    const a = ativo.getBoundingClientRect();
    const escala = c.width / container.offsetWidth || 1;
    const x = (a.left - c.left) / escala + container.scrollLeft;
    container.scrollLeft = Math.max(0, x - container.clientWidth / 2 + ativo.offsetWidth / 2);
  });
  return (
    <div ref={ref} data-video-scroll-lock style={{ display: "contents" }}>
      <Original {...props} />
    </div>
  );
}
