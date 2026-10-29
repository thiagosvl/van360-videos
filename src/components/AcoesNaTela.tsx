import React, { useEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";

/**
 * Faz na tela o que a pessoa faria (tocar num botão, escolher numa lista, digitar),
 * para diálogos do app cujo estado é interno (useState).
 *
 * Uso: monte o diálogo e este componente com a MESMA `key` (o passo atual) e passe
 * TODOS os passos até ali: a cada passo o diálogo nasce de novo e refaz o caminho,
 * então qualquer quadro sai igual, renderizado em qualquer ordem.
 * O quadro só é fotografado depois que todos os passos terminaram (delayRender).
 */
export type Acao =
  | { tocar: string; dentro?: string } // texto visível do botão/opção
  | { tocarTexto: string } // qualquer elemento com esse texto (ex.: o card de um aluno)
  | { tocarSeletor: string; indice?: number } // seletor CSS (ex.: '[role="radio"]')
  | { escolher: number; valor: string } // n-ésimo <select> do diálogo
  | { digitar: string; valor: string }; // placeholder do campo

/** onde procurar: o diálogo aberto (padrão), um seletor, ou "tela" (o celular inteiro) */
const raiz = (de: HTMLElement | null, dentro?: string) => {
  const tela = de?.closest<HTMLElement>(".phone-screen") ?? null;
  if (dentro === "tela") return tela;
  return tela?.querySelector<HTMLElement>(dentro ?? '[role="dialog"]') ?? null;
};

function executa(base: HTMLElement, a: Acao) {
  if ("tocar" in a) {
    const alvos = Array.from(base.querySelectorAll<HTMLElement>("button, label, [role='option'], [role='menuitem'], a"));
    const alvo = alvos.find((el) => el.textContent?.trim() === a.tocar) ?? alvos.find((el) => el.textContent?.includes(a.tocar));
    alvo?.click();
  } else if ("tocarTexto" in a) {
    // fora de diálogos, e o elemento mais interno com esse texto (o clique sobe até quem trata)
    const todos = Array.from(base.querySelectorAll<HTMLElement>("*")).filter(
      (el) => el.textContent?.trim() === a.tocarTexto && !el.closest('[role="dialog"]'),
    );
    todos.find((el) => !Array.from(el.children).some((c) => c.textContent?.trim() === a.tocarTexto))?.click();
  } else if ("tocarSeletor" in a) {
    base.querySelectorAll<HTMLElement>(a.tocarSeletor)[a.indice ?? 0]?.click();
  } else if ("escolher" in a) {
    const sel = base.querySelectorAll("select")[a.escolher];
    if (sel) {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!.call(sel, a.valor);
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else if ("digitar" in a) {
    const campo = base.querySelector<HTMLInputElement>(`input[placeholder="${a.digitar}"]`);
    if (campo) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(campo, a.valor);
      campo.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

export const AcoesNaTela: React.FC<{ passos: Acao[]; dentro?: string }> = ({ passos, dentro }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = delayRender("Ações na tela");
    let i = 0;
    let raf = 0;
    let tentativas = 0;
    // um passo por quadro do navegador: cada um vê a tela já atualizada pelo anterior
    const proximo = () => {
      const base = raiz(ref.current, dentro);
      if (!base && tentativas++ < 30) {
        raf = requestAnimationFrame(proximo); // o diálogo ainda está abrindo
        return;
      }
      if (i < passos.length && base) executa(base, passos[i++]);
      if (i < passos.length && base) raf = requestAnimationFrame(proximo);
      else raf = requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
    };
    raf = requestAnimationFrame(proximo);
    return () => {
      cancelAnimationFrame(raf);
      continueRender(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={ref} />;
};
