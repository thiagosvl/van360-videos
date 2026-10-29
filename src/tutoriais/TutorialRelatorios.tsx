import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Relatorios from "@/pages/Relatorios";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { NOVO_GASTO } from "../mocks/financeiro";

/**
 * Tutorial: Relatórios (Visão Geral, Entradas, Saídas, Operacional).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "O seu negócio inteiro, **num relance**.", from: 0, duration: 150 },
  { text: "Quanto vai entrar, quanto já entrou e **quanto falta**.", from: 150, duration: 165 },
  { text: "Como os pais pagam e **em que dia** o dinheiro cai.", from: 315, duration: 150 },
  { text: "Para onde vai cada real: **gasto por categoria**.", from: 465, duration: 150 },
  { text: "E quanto custa **cada van**.", from: 615, duration: 120 },
  { text: "Alunos por escola, por período e **por van**.", from: 735, duration: 165 },
  { text: "Decisão com **números**, não no achismo.", from: 900, duration: 120 },
];
export const TUTORIAL_RELATORIOS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* abas (px do celular 390x844), conferidas em stills */
const ABA = {
  entradas: { x: 144, y: 271 },
  saidas: { x: 227, y: 271 },
  operacional: { x: 311, y: 271 },
  geral: { x: 64, y: 271 },
};

const T = {
  entradas: B[2] + 20,
  saidas: B[4] + 16,
  operacional: B[6] + 16,
  geral: B[7] + 12,
};

export const TutorialRelatorios: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(4);
  const logoIn = interpolate(frame, [B[7] + 20, B[7] + 40], [0, 1], clamp);

  const tab =
    frame >= T.geral + 4 ? "visao-geral" : frame >= T.operacional + 4 ? "operacional" : frame >= T.saidas + 4 ? "saidas" : frame >= T.entradas + 4 ? "entradas" : "visao-geral";
  const route = `/relatorios?tab=${tab}`;

  // rolagem de cada aba (relativa ao toque que abriu a aba)
  let scroll = 0;
  if (frame < T.entradas) scroll = interpolate(frame, [50, 120], [0, 300], { ...clamp, easing: ease });
  else if (frame < T.saidas) scroll = interpolate(frame, [B[3] + 10, B[3] + 60, B[3] + 90, B[3] + 140], [0, 420, 420, 560], { ...clamp, easing: ease });
  else if (frame < T.operacional) scroll = interpolate(frame, [B[5] + 10, B[5] + 60], [0, 820], { ...clamp, easing: ease });
  else if (frame < T.geral) scroll = interpolate(frame, [B[6] + 50, B[6] + 110], [0, 600], { ...clamp, easing: ease });
  else scroll = interpolate(frame, [T.geral + 20, T.geral + 60], [0, 300], { ...clamp, easing: ease });

  // antes de tocar numa aba, a tela volta ao topo (as abas ficam lá em cima)
  const voltaTopo = (t: number) => (frame >= t - 24 && frame < t + 4 ? interpolate(frame, [t - 24, t - 8], [1, 0], { ...clamp, easing: ease }) : 1);
  scroll *= voltaTopo(T.entradas) * voltaTopo(T.saidas) * voltaTopo(T.operacional) * voltaTopo(T.geral);

  const toque = (t: number, p: { x: number; y: number }) => (
    <Finger showFrom={t - 20} hideAt={t + 8} steps={[{ at: t - 20, ...p }, { at: t, ...p, tap: true }]} />
  );

  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <AbsoluteFill style={{ alignItems: "center", top: 540 }}>
        <div style={{ translate: `0px ${rise}px` }}>
          <VideoStateProvider value={{ gastosExtras: [NOVO_GASTO] }}>
            <PhoneScreen
              key={route}
              route={route}
              pageTitle="Relatórios"
              scale={1.45}
              scrollY={scroll}
              overlay={
                <>
                  {toque(T.entradas, ABA.entradas)}
                  {toque(T.saidas, ABA.saidas)}
                  {toque(T.operacional, ABA.operacional)}
                  {toque(T.geral, ABA.geral)}
                </>
              }
            >
              <Routes>
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
