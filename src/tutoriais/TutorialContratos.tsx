import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import Contratos from "@/pages/Contratos";
import ConfigurarModeloContrato from "@/pages/ConfigurarModeloContrato";
import AssinarContrato from "@/pages/AssinarContrato";
import { ConfirmarGerarContratoDialog } from "@/components/dialogs/ConfirmarGerarContratoDialog";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { ContratoActions } from "../components/ContratoActions";
import { BotaoLink, WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { MOTORISTA, PEDRO_ID, PEDRO_SEM_CONTRATO } from "../mocks/data";

/**
 * Tutorial: Contratos digitais (do modelo à assinatura do pai pelo celular).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Contrato assinado **sem papel** e sem ir até a casa do pai.", from: 0, duration: 150 },
  { text: "Você ajusta o modelo **uma vez**: cláusulas, multas e sua assinatura.", from: 150, duration: 195 },
  { text: "Depois, é só **gerar o contrato** do aluno.", from: 345, duration: 195 },
  { text: "O pai recebe o link na hora, **no WhatsApp**.", from: 540, duration: 135 },
  { text: "Lê o contrato pelo próprio **celular**.", from: 675, duration: 120 },
  { text: "E assina com o **dedo**, ali mesmo na tela.", from: 795, duration: 180 },
  { text: "Pronto: contrato assinado e com **validade jurídica**.", from: 975, duration: 135 },
  { text: "E você acompanha tudo na aba **Assinados**.", from: 1110, duration: 135 },
  { text: "Contrato em dia, **sem papelada**.", from: 1245, duration: 120 },
];
export const TUTORIAL_CONTRATOS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};

const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;

/* ------------------------------------------------------------------ */
/* trechos: cada um é "um celular" em cena                             */
/* ------------------------------------------------------------------ */
type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "app", from: 0, to: B[4], label: "Seu celular" },
  { id: "whatsapp", from: B[4], to: B[5], label: "Celular do pai" },
  { id: "assinar", from: B[5], to: B[8], label: "Celular do pai" },
  { id: "app-fim", from: B[8], to: TUTORIAL_CONTRATOS_DURATION, label: "Seu celular" },
];

const SegmentShell: React.FC<{ seg: Segment; first: boolean; last: boolean; children: React.ReactNode }> = ({ seg, first, last, children }) => {
  const frame = useCurrentFrame();
  const len = seg.to - seg.from;
  const rise = usePhoneRise(4);
  const enter = first ? 0 : interpolate(frame, [0, SLIDE], [1150, 0], { ...clamp, easing: ease });
  const exit = last ? 0 : interpolate(frame, [len, len + SLIDE], [0, -1150], { ...clamp, easing: ease });
  const labelIn = interpolate(frame, [first ? 20 : 6, (first ? 20 : 6) + 10], [0, 1], clamp);
  const pai = seg.label === "Celular do pai";
  return (
    <AbsoluteFill style={{ translate: `${enter + exit}px 0px` }}>
      <div style={{ position: "absolute", top: PHONE_TOP - 74, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: labelIn }}>
        <div
          style={{
            padding: "10px 26px",
            borderRadius: 999,
            background: pai ? "#ecfdf5" : "#eef3ff",
            color: pai ? "#047857" : BRAND.blue,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.02em",
          }}
        >
          {seg.label}
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: PHONE_TOP }}>
        <div style={{ translate: first ? `0px ${rise}px` : undefined }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * "Rola" o <main> da página (páginas com rolagem interna, como a de assinatura).
 * Move o conteúdo em vez de usar scrollTop: o print do quadro nem sempre pega a rolagem.
 */
const RolaMain: React.FC<{ y: number }> = ({ y }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const main = ref.current?.closest(".phone-screen")?.querySelector("main");
    const conteudo = main?.firstElementChild as HTMLElement | null;
    if (!main || !conteudo) return;
    const max = Math.max(0, conteudo.offsetHeight + 128 - main.clientHeight); // 128 = pb-32 do main
    conteudo.style.translate = `0px ${-Math.min(y, max)}px`;
  });
  return <div ref={ref} />;
};

/* ------------------------------------------------------------------ */
/* pontos de toque (px do celular 390x844), conferidos em stills       */
/* ------------------------------------------------------------------ */
const P = {
  config: { x: 317, y: 194 },
  pedro: { x: 195, y: 312 },
  gerar: { x: 195, y: 648 },
  gerarEnviar: { x: 281, y: 584 },
  abaPendentes: { x: 203, y: 138 },
  abaAssinados: { x: 323, y: 138 },
  assinar: { x: 195, y: 790 },
  tocarParaAssinar: { x: 195, y: 420 },
  confirmar: { x: 293, y: 692 },
};

/* ------------------------------------------------------------------ */
/* Seu celular: modelo, Contratos e geração                             */
/* ------------------------------------------------------------------ */
const T = {
  tocaConfig: B[2] - 14,
  abreModelo: B[2] - 6,
  abaMultas: B[2] + 70,
  abaAssinatura: B[2] + 130,
  volta: B[3],
  tocaPedro: B[3] + 26,
  tocaGerar: B[3] + 70,
  tocaGerarEnviar: B[3] + 130,
  gerado: B[3] + 138,
  tocaPendentes: B[3] + 160,
};

const TelaApp: React.FC = () => {
  const frame = useCurrentFrame();
  const noModelo = frame >= T.abreModelo && frame < T.volta;
  const aba = frame >= T.abaAssinatura ? "identity" : frame >= T.abaMultas ? "fees" : "clauses";
  const etapa = frame >= T.gerado ? 1 : 0;
  const tab = frame >= T.tocaPendentes + 4 ? "pendentes" : "sem_contrato";
  const route = noModelo ? `/contratos/modelo#${aba}` : `/contratos?tab=${tab}`;

  const sheetOpen = frame >= T.tocaPedro + 6 && frame < T.tocaGerar + 6;
  const dialogOpen = frame >= T.tocaGerar + 6 && frame < T.gerado;

  // na aba Cláusulas, desce um pouco para mostrar o modelo pronto
  const scroll = noModelo && aba === "clauses" ? interpolate(frame, [T.abreModelo + 30, T.abaMultas - 10], [0, 180], { ...clamp, easing: ease }) : 0;

  return (
    <VideoStateProvider value={{ contratos: { etapa }, abaForcada: noModelo ? aba : undefined }}>
      <PhoneScreen
        key={route}
        route={route.split("#")[0]}
        pageTitle={noModelo ? "Modelo de Contrato" : "Contratos"}
        scale={SCALE}
        scrollY={scroll}
        overlay={
          <>
            <ContratoActions item={PEDRO_SEM_CONTRATO} open={sheetOpen} />
            {dialogOpen && (
              <ConfirmarGerarContratoDialog
                open
                onOpenChange={noop}
                passageiro={{ ...PEDRO_SEM_CONTRATO, ano_letivo: 2026 } as any}
                valorMensal={280}
                diaVencimento={10}
                ano={2026}
              />
            )}
            <Finger showFrom={T.tocaConfig - 30} hideAt={T.tocaConfig + 8} steps={[{ at: T.tocaConfig - 30, ...P.config }, { at: T.tocaConfig, ...P.config, tap: true }]} />
            <Finger
              showFrom={T.volta + 4}
              hideAt={T.tocaPendentes + 12}
              steps={[
                { at: T.volta + 4, ...P.pedro },
                { at: T.tocaPedro, ...P.pedro, tap: true },
                { at: T.tocaGerar, ...P.gerar, tap: true },
                { at: T.tocaGerarEnviar, ...P.gerarEnviar, tap: true },
                { at: T.tocaPendentes, ...P.abaPendentes, tap: true },
              ]}
            />
          </>
        }
      >
        <Routes>
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/contratos/modelo" element={<ConfigurarModeloContrato />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: a mensagem automática (modelo real do WhatsApp)     */
/* ------------------------------------------------------------------ */
const TOQUE_LINK = 92;
const TelaWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.7 } });
  return (
    <div style={{ width: 891, height: 1000, position: "relative" }}>
      <div style={{ width: 330, scale: String(2.7 * pop), transformOrigin: "50% 0%", position: "absolute", left: (891 - 330) / 2, top: 80 }}>
        <WabaMessage motorista={MOTORISTA.apelido} hora="10:02" botao={<BotaoLink texto="Assinar Contrato" />}>
          {WABA_MODELOS.contrato({ responsavel: "Carla", aluno: "Pedro" })}
        </WabaMessage>
      </div>
      <Finger showFrom={50} hideAt={TOQUE_LINK + 10} steps={[{ at: 50, x: 445, y: 668 }, { at: TOQUE_LINK, x: 445, y: 700, tap: true }]} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: lê e assina (página pública real)                   */
/* ------------------------------------------------------------------ */
const A = {
  tocaAssinar: B[6] - B[5] + 16,
  abreDialogo: B[6] - B[5] + 22,
  tocaQuadro: B[6] - B[5] + 46,
  desenhaDe: B[6] - B[5] + 56,
  desenhaAte: B[6] - B[5] + 128,
  tocaConfirmar: B[6] - B[5] + 150,
  assinado: B[6] - B[5] + 158,
};

const TelaAssinar: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[5]
  const assinado = frame >= A.assinado;
  const dialogo = frame >= A.abreDialogo && frame < A.assinado;
  const editando = frame >= A.tocaQuadro + 4;
  const progresso = interpolate(frame, [A.desenhaDe, A.desenhaAte], [0, 1], clamp);
  const local7 = frame - (B[7] - B[5]);

  const y = assinado
    ? interpolate(local7, [20, 80], [0, 1400], { ...clamp, easing: ease })
    : interpolate(frame, [24, 110, A.tocaAssinar - 10, A.tocaAssinar], [0, 640, 640, 640], { ...clamp, easing: ease });

  return (
    <VideoStateProvider value={{ assinar: { assinado }, assinatura: { editando, progresso } }}>
      <PhoneScreen
        key={`${assinado}-${dialogo}-${editando}`}
        route={`/assinar/tk-${PEDRO_ID}`}
        scale={SCALE}
        showChrome={false}
        contentClassName="tela-cheia"
        overlay={
          <>
            <RolaMain y={y} />
            {dialogo && <SignatureDialog isOpen onClose={noop} onAssinar={noop} isSigning={false} sigCanvas={{ current: null }} />}
            <Finger
              showFrom={A.tocaAssinar - 24}
              hideAt={A.tocaQuadro + 8}
              steps={[
                { at: A.tocaAssinar - 24, ...P.assinar },
                { at: A.tocaAssinar, ...P.assinar, tap: true },
                { at: A.tocaQuadro, ...P.tocarParaAssinar, tap: true },
              ]}
            />
            <Finger showFrom={A.desenhaAte + 4} hideAt={A.tocaConfirmar + 8} steps={[{ at: A.desenhaAte + 4, ...P.confirmar }, { at: A.tocaConfirmar, ...P.confirmar, tap: true }]} />
          </>
        }
      >
        <Routes>
          <Route path="/assinar/:token" element={<AssinarContrato />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Seu celular: o contrato do Pedro já em Assinados                    */
/* ------------------------------------------------------------------ */
const TOQUE_ASSINADOS = 30;
const TelaAssinados: React.FC = () => {
  const frame = useCurrentFrame();
  const tab = frame >= TOQUE_ASSINADOS + 4 ? "assinados" : "pendentes";
  const route = `/contratos?tab=${tab}`;
  return (
    <VideoStateProvider value={{ contratos: { etapa: 2 } }}>
      <PhoneScreen
        key={route}
        route={route}
        pageTitle="Contratos"
        scale={SCALE}
        overlay={<Finger showFrom={8} hideAt={TOQUE_ASSINADOS + 10} steps={[{ at: 8, ...P.abaAssinados }, { at: TOQUE_ASSINADOS, ...P.abaAssinados, tap: true }]} />}
      >
        <Routes>
          <Route path="/contratos" element={<Contratos />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

const TELAS: Record<string, React.FC> = {
  app: TelaApp,
  whatsapp: TelaWhatsApp,
  assinar: TelaAssinar,
  "app-fim": TelaAssinados,
};

/* ------------------------------------------------------------------ */

export const TutorialContratos: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[9] + 20, B[9] + 40], [0, 1], clamp);
  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      {SEGMENTS.map((seg, i) => {
        const Tela = TELAS[seg.id];
        const last = i === SEGMENTS.length - 1;
        return (
          <Sequence key={seg.id} from={seg.from} durationInFrames={seg.to - seg.from + (last ? 0 : SLIDE)} name={seg.id}>
            <SegmentShell seg={seg} first={i === 0} last={last}>
              <Tela />
            </SegmentShell>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};
