// Quadro de assinatura REAL do app, controlado pelo vídeo:
// - VideoState.assinatura.editando: entra no modo de desenho (como o toque em "Toque para assinar")
// - VideoState.assinatura.progresso: desenha a assinatura da mãe traço a traço, com o dedo na ponta
// - com assinatura salva (initialValue), segura o quadro até a imagem aparecer no canvas
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import { useVideoState } from "@mocks/videoState";
import ASSINATURAS from "@mocks/assinaturas.json";
import { SignaturePad as OriginalPad } from "@/components/common/SignaturePad.tsx?original";

export * from "@/components/common/SignaturePad.tsx?original";

type Pt = [number, number];
const TRACOS = ASSINATURAS.responsavel as Pt[][];
const comp = (t: Pt[]) => t.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - t[i][0], p[1] - t[i][1]), 0);
const TOTAL = TRACOS.reduce((s, t) => s + comp(t), 0);

/** Traços até a fração `f` do comprimento total, e a ponta da caneta. */
function parcial(f: number): { d: string; ponta: Pt | null } {
  let resta = f * TOTAL;
  const partes: string[] = [];
  let ponta: Pt | null = null;
  for (const t of TRACOS) {
    if (resta <= 0) break;
    const pts: Pt[] = [t[0]];
    for (let i = 1; i < t.length && resta > 0; i++) {
      const seg = Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1]);
      if (seg <= resta) {
        pts.push(t[i]);
        resta -= seg;
      } else {
        const k = resta / seg;
        pts.push([t[i - 1][0] + (t[i][0] - t[i - 1][0]) * k, t[i - 1][1] + (t[i][1] - t[i - 1][1]) * k]);
        resta = 0;
      }
    }
    partes.push("M" + pts.map((p) => p.join(" ")).join(" L"));
    ponta = pts[pts.length - 1];
  }
  return { d: partes.join(" "), ponta };
}

const SignaturePad = forwardRef<any, any>((props, ref) => {
  const { assinatura } = useVideoState();
  const box = useRef<HTMLDivElement>(null);

  // entra no modo de desenho tocando no botão real
  useLayoutEffect(() => {
    if (!assinatura?.editando) return;
    const botao = Array.from(box.current?.querySelectorAll("button") ?? []).find((b) => b.textContent?.includes("Toque para assinar"));
    botao?.click();
  }, [assinatura?.editando]);

  // assinatura salva: o app desenha a imagem no canvas quando ela carrega
  useEffect(() => {
    if (!props.initialValue) return;
    const handle = delayRender("Assinatura salva no quadro");
    const inicio = performance.now();
    let raf = 0;
    const confere = () => {
      const c = box.current?.querySelector("canvas");
      const ctx = c?.getContext("2d");
      const tem = ctx && c!.width > 0 && ctx.getImageData(0, 0, c!.width, c!.height).data.some((v, i) => i % 4 === 3 && v > 0);
      if (tem || performance.now() - inicio > 3000) continueRender(handle);
      else raf = requestAnimationFrame(confere);
    };
    raf = requestAnimationFrame(confere);
    return () => {
      cancelAnimationFrame(raf);
      continueRender(handle);
    };
  }, [props.initialValue]);

  const prog = assinatura?.progresso ?? 0;
  const { d, ponta } = prog > 0 ? parcial(Math.min(1, prog)) : { d: "", ponta: null };
  // área do desenho dentro do quadro (h-48 = 192px), acima da linha tracejada
  const AREA = { left: 13, top: 34, width: 300, height: 100 };

  return (
    <div ref={box} style={{ position: "relative" }}>
      <OriginalPad ref={ref} {...props} />
      {prog > 0 && (
        <div style={{ position: "absolute", ...AREA, zIndex: 30, pointerEvents: "none" }}>
          <svg width={AREA.width} height={AREA.height} viewBox="0 0 300 100" style={{ overflow: "visible" }}>
            <path d={d} fill="none" stroke="#0a0a0a" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {ponta && prog < 1 && (
            <div
              style={{
                position: "absolute",
                left: ponta[0] - 17,
                top: ponta[1] - 17,
                width: 34,
                height: 34,
                borderRadius: 99,
                background: "rgba(255,255,255,0.6)",
                border: "3px solid #2563eb",
                boxShadow: "0 6px 16px rgba(11,26,46,0.35)",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
});
SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
export default SignaturePad;
