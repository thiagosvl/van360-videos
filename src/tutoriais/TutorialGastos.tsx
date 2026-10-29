import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Gastos from "@/pages/Gastos";
import Relatorios from "@/pages/Relatorios";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import { moneyMask } from "@/utils/masks";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { NOVO_GASTO, VEICULOS } from "../mocks/financeiro";

/**
 * Tutorial: Gastos (registrar, parcelado, por categoria) e o lucro real na Visão Geral.
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Você sabe quanto **sobra de verdade** no fim do mês?", from: 0, duration: 135 },
  { text: "Anote cada gasto da van: diesel, manutenção, seguro.", from: 135, duration: 165 },
  { text: "Comprou **parcelado**? Lança uma vez e o app divide nos meses.", from: 300, duration: 255 },
  { text: "E mostra **onde vai o dinheiro**, categoria por categoria.", from: 555, duration: 135 },
  { text: "E o app desconta os gastos do que os pais **pagaram**.", from: 690, duration: 165 },
  { text: "Esse é o seu **lucro real**, sem fazer conta.", from: 855, duration: 135 },
  { text: "Agora você sabe **quanto sobra**, todo mês.", from: 990, duration: 120 },
];
export const TUTORIAL_GASTOS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};

/**
 * "Rola" a área rolável de dentro de um diálogo movendo o conteúdo
 * (o print do quadro nem sempre pega scrollTop).
 */
const RolaDialogo: React.FC<{ y: number }> = ({ y }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const aplica = () => {
      const dialog = ref.current?.closest(".phone-screen")?.querySelector<HTMLElement>('[role="dialog"]');
      const corpo = dialog && [dialog, ...Array.from(dialog.querySelectorAll<HTMLElement>("*"))].find((el) => /(auto|scroll)/.test(getComputedStyle(el).overflowY));
      const conteudo = corpo?.firstElementChild as HTMLElement | null;
      if (!corpo || !conteudo) return;
      const max = Math.max(0, conteudo.offsetHeight + 48 - corpo.clientHeight); // 48 = padding do corpo
      conteudo.style.translate = `0px ${-Math.min(y, max)}px`;
    };
    aplica();
    // o formulário ainda re-renderiza com os valores do vídeo: aplica de novo quando assentar
    const handle = delayRender("Rolando o formulário");
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        aplica();
        continueRender(handle);
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      continueRender(handle);
    };
  });
  return <div ref={ref} />;
};

/** Desliza a fileira de números do topo (ela rola de lado no celular). */
const RolaKpis: React.FC<{ x: number }> = ({ x }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fileira = ref.current?.closest(".phone-screen")?.querySelector<HTMLElement>(".w-max");
    if (fileira) fileira.style.translate = `${-x}px 0px`;
  });
  return <div ref={ref} />;
};

/* pontos de toque (px do celular 390x844), conferidos em stills */
const P = {
  novoGasto: { x: 290, y: 238 },
  valor: { x: 195, y: 190 },
  parcelado: { x: 270, y: 290 },
  parcelas: { x: 195, y: 392 },
  total: { x: 195, y: 470 },
  salvar: { x: 280, y: 760 },
};

const T = {
  tocaNovo: B[3] + 30,
  abre: B[3] + 36,
  digitaDe: B[3] + 50,
  tocaParcelado: B[3] + 92,
  parcelas4: B[3] + 112,
  tocaTotal: B[3] + 132,
  rolaDe: B[3] + 145,
  categoria: B[3] + 172,
  data: B[3] + 180,
  veiculo: B[3] + 190,
  tocaSalvar: B[3] + 222,
  salvo: B[3] + 230,
  relatorios: B[5] + 10,
};

const SCALE = 1.45;

export const TutorialGastos: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(4);
  const logoIn = interpolate(frame, [B[7] + 20, B[7] + 40], [0, 1], clamp);

  /* ---------- formulário ---------- */
  const formAberto = frame >= T.abre && frame < T.salvo;
  const digitos = "160000";
  const nDig = frame < T.digitaDe ? 0 : Math.min(digitos.length, Math.floor((frame - T.digitaDe) / 5) + 1);
  const gastoForm: Record<string, unknown> = {};
  if (nDig > 0) gastoForm.valor = moneyMask(digitos.slice(0, nDig));
  if (frame >= T.tocaParcelado + 4) Object.assign(gastoForm, { parcelado: true, parcelas: frame >= T.parcelas4 ? 4 : 2 });
  if (frame >= T.tocaTotal + 4) gastoForm.tipo_calculo_parcela = "total";
  if (frame >= T.categoria) gastoForm.categoria = "manutencao";
  if (frame >= T.data) gastoForm.data = new Date(2026, 2, 12);
  if (frame >= T.veiculo) gastoForm.veiculo_id = "v1";
  if (frame >= T.veiculo + 4) gastoForm.descricao = "Pneus novos".slice(0, Math.floor((frame - T.veiculo - 4) / 2) + 1);
  const rolaForm = interpolate(frame, [T.rolaDe, T.rolaDe + 24, T.tocaSalvar - 30, T.tocaSalvar - 10], [0, 260, 260, 900], { ...clamp, easing: ease });

  /* ---------- tela ---------- */
  const naRelatorios = frame >= T.relatorios;
  const route = naRelatorios ? "/relatorios?tab=visao-geral" : "/gastos";
  const gastosExtras = frame >= T.salvo ? [NOVO_GASTO] : [];

  let scroll = 0;
  if (!naRelatorios) {
    if (frame < B[3]) scroll = interpolate(frame, [B[2] + 20, B[2] + 90, B[2] + 120, B[2] + 160], [0, 420, 420, 0], { ...clamp, easing: ease });
    else if (frame >= B[4]) scroll = 0;
  } else {
    scroll = interpolate(frame, [B[5] + 40, B[5] + 100], [0, 330], { ...clamp, easing: ease });
  }

  // "por categoria": a fileira de números desliza até o Maior Gasto
  const kpiX = !naRelatorios && frame >= B[4] ? interpolate(frame, [B[4] + 20, B[4] + 60], [0, 200], { ...clamp, easing: ease }) : 0;
  // lucro real: destaque na linha "Lucro Atual"
  const destaque = interpolate(frame, [B[6] + 10, B[6] + 22, B[7] - 10, B[7]], [0, 1, 1, 0], clamp);

  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <AbsoluteFill style={{ alignItems: "center", top: 540 }}>
        <div style={{ translate: `0px ${rise}px` }}>
          <VideoStateProvider value={{ gastoForm, gastosExtras }}>
            <PhoneScreen
              key={route}
              route={route}
              pageTitle={naRelatorios ? "Relatórios" : "Gastos"}
              scale={SCALE}
              scrollY={scroll}
              overlay={
                <>
                  {formAberto && <GastoFormDialog isOpen onClose={noop} veiculos={VEICULOS} allowBatchCreation />}
                  {formAberto && <RolaDialogo y={rolaForm} />}
                  {!naRelatorios && <RolaKpis x={kpiX} />}
                  {naRelatorios && destaque > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        top: 362,
                        height: 52,
                        borderRadius: 16,
                        border: "3px solid #2563eb",
                        boxShadow: "0 0 0 6px rgba(37,99,235,0.15)",
                        opacity: destaque,
                        scale: String(0.96 + 0.04 * destaque),
                      }}
                    />
                  )}
                  <Finger
                    showFrom={B[3] + 6}
                    hideAt={T.tocaSalvar + 10}
                    steps={[
                      { at: B[3] + 6, ...P.novoGasto },
                      { at: T.tocaNovo, ...P.novoGasto, tap: true },
                      { at: T.digitaDe - 4, ...P.valor, tap: true },
                      { at: T.tocaParcelado, ...P.parcelado, tap: true },
                      { at: T.parcelas4 - 6, ...P.parcelas, tap: true },
                      { at: T.tocaTotal, ...P.total, tap: true },
                      { at: T.tocaSalvar, ...P.salvar, tap: true },
                    ]}
                  />
                </>
              }
            >
              <Routes>
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Routes>
            </PhoneScreen>
          </VideoStateProvider>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};
