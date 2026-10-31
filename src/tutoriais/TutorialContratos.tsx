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
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { VideoStateProvider } from "../mocks/videoState";
import { MOTORISTA, PEDRO_ID, PEDRO_SEM_CONTRATO } from "../mocks/data";

/**
 * Tutorial: Contratos digitais (do modelo à assinatura do pai pelo celular).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Contrato assinado **sem papel** e sem ir até a casa do pai.", from: 0, duration: 130 },
  { text: "Você ajusta o modelo **uma vez**: as cláusulas,", from: 130, duration: 112 },
  { text: "a **multa e os juros** por atraso,", from: 242, duration: 88 },
  { text: "e a **sua assinatura**, que entra em todo contrato.", from: 330, duration: 112 },
  { text: "Depois, é só **gerar o contrato** do aluno: escolhe o aluno, confere os dados e envia pro pai.", from: 442, duration: 192 },
  { text: "O pai recebe o link na hora, **no WhatsApp**, e toca para abrir.", from: 634, duration: 125 },
  { text: "Lê o contrato inteiro pelo próprio **celular**, sem precisar imprimir nada.", from: 759, duration: 150 },
  { text: "E assina com o **dedo**, ali mesmo na tela, do jeito que assina no papel.", from: 909, duration: 140 },
  { text: "Pronto: contrato assinado e com **validade jurídica**.", from: 1049, duration: 122 },
  { text: "E você acompanha tudo na aba **Assinados**.", from: 1171, duration: 102 },
  { text: "Contrato em dia, **sem papelada**.", from: 1273, duration: 110 },
]
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
  { id: "app", from: 0, to: B[6], label: "Seu celular" },
  { id: "whatsapp", from: B[6], to: B[7], label: "Celular do pai" },
  { id: "assinar", from: B[7], to: B[10], label: "Celular do pai" },
  { id: "app-fim", from: B[10], to: TUTORIAL_CONTRATOS_DURATION, label: "Seu celular" },
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
  abaMultas: { x: 194, y: 158 }, // abas do modelo com Cláusulas já rolada
  abaAssinatura: { x: 286, y: 188 },
  voltar: { x: 39, y: 134 },
};

/** Close (zoom de câmera) nos blocos do modelo: y = centro do bloco, em px a partir do topo do celular. */
const ZOOM = { multa: { y: 677, s: 1.42 }, assinatura: { y: 597, s: 1.38 } };

/* ------------------------------------------------------------------ */
/* Seu celular: modelo, Contratos e geração                             */
/* ------------------------------------------------------------------ */
const T = {
  tocaConfig: B[2] - 14,
  abreModelo: B[2] - 6,
  abaMultas: B[3], // toque na aba Multas
  zoomMulta: [B[3] + 10, B[4] - 6] as const,
  abaAssinatura: B[4], // toque na aba Assinatura
  zoomAssinatura: [B[4] + 10, B[5] - 18] as const,
  tocaVoltar: B[5] - 12,
  volta: B[5],
  tocaPedro: B[5] + 26,
  tocaGerar: B[5] + 70,
  tocaGerarEnviar: B[5] + 130,
  gerado: B[5] + 138,
  tocaPendentes: B[5] + 160,
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
  const scroll = noModelo && aba === "clauses" ? interpolate(frame, [T.abreModelo + 30, T.abaMultas - 22], [0, 180], { ...clamp, easing: ease }) : 0;

  // close nos blocos de Multa e de Assinatura
  const zoomDe = (j: readonly [number, number], s: number) =>
    interpolate(frame, [j[0], j[0] + 12, j[1] - 12, j[1]], [1, s, s, 1], { ...clamp, easing: ease });
  const zm = zoomDe(T.zoomMulta, ZOOM.multa.s);
  const za = zoomDe(T.zoomAssinatura, ZOOM.assinatura.s);
  const zoom = Math.max(zm, za);
  const origemY = za > 1 ? ZOOM.assinatura.y : ZOOM.multa.y;

  return (
    <VideoStateProvider value={{ contratos: { etapa }, abaForcada: noModelo ? aba : undefined }}>
      {/* recorte: o celular ampliado não invade a legenda */}
      <div style={{ width: 1080, height: 1450, marginTop: -70, paddingTop: 70, boxSizing: "border-box", overflow: "hidden", display: "flex", justifyContent: "center" }}>
      <div style={{ scale: String(zoom), transformOrigin: `50% ${origemY}px` }}>
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
            <Finger showFrom={T.abaMultas - 20} hideAt={T.abaMultas + 8} steps={[{ at: T.abaMultas - 20, ...P.abaMultas }, { at: T.abaMultas, ...P.abaMultas, tap: true }]} />
            <Finger showFrom={T.abaAssinatura - 16} hideAt={T.abaAssinatura + 8} steps={[{ at: T.abaAssinatura - 16, ...P.abaAssinatura }, { at: T.abaAssinatura, ...P.abaAssinatura, tap: true }]} />
            <Finger showFrom={T.tocaVoltar - 14} hideAt={T.tocaVoltar + 8} steps={[{ at: T.tocaVoltar - 14, ...P.voltar }, { at: T.tocaVoltar, ...P.voltar, tap: true }]} />
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
      </div>
      </div>
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
  tocaAssinar: B[8] - B[7] + 16,
  abreDialogo: B[8] - B[7] + 22,
  tocaQuadro: B[8] - B[7] + 40,
  desenhaDe: B[8] - B[7] + 48,
  desenhaAte: B[8] - B[7] + 108,
  tocaConfirmar: B[8] - B[7] + 122,
  assinado: B[8] - B[7] + 130,
};

const TelaAssinar: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[7]
  const assinado = frame >= A.assinado;
  const dialogo = frame >= A.abreDialogo && frame < A.assinado;
  const editando = frame >= A.tocaQuadro + 4;
  const progresso = interpolate(frame, [A.desenhaDe, A.desenhaAte], [0, 1], clamp);
  const local7 = frame - (B[9] - B[7]);

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

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  // modelo
  { at: T.tocaConfig, sfx: "tap" },
  { at: T.abreModelo, sfx: "open", volume: 0.5 },
  { at: T.abaMultas, sfx: "tap" },
  { at: T.zoomMulta[0], sfx: "whoosh-soft", volume: 0.45 },
  { at: T.zoomMulta[1] - 12, sfx: "whoosh-soft", volume: 0.3 },
  { at: T.abaAssinatura, sfx: "tap" },
  { at: T.zoomAssinatura[0], sfx: "whoosh-soft", volume: 0.45 },
  { at: T.zoomAssinatura[1] - 12, sfx: "whoosh-soft", volume: 0.3 },
  { at: T.tocaVoltar, sfx: "tap" },
  // gerar
  { at: T.tocaPedro, sfx: "tap" },
  { at: T.tocaPedro + 6, sfx: "open", volume: 0.5 },
  { at: T.tocaGerar, sfx: "tap" },
  { at: T.tocaGerar + 6, sfx: "open", volume: 0.5 },
  { at: T.tocaGerarEnviar, sfx: "tap" },
  { at: T.gerado, sfx: "success", volume: 0.7 },
  { at: T.tocaPendentes, sfx: "tap" },
  // trocas de celular
  ...SEGMENTS.slice(0, -1).map((s): SfxEvent => ({ at: s.to, sfx: "whoosh", volume: 0.55 })),
  // WhatsApp do pai
  { at: B[6] + 10, sfx: "vibra", volume: 0.45 },
  { at: B[6] + 12, sfx: "notif", volume: 0.8 },
  { at: B[6] + TOQUE_LINK, sfx: "tap" },
  // assinatura do pai
  { at: B[7] + A.tocaAssinar, sfx: "tap" },
  { at: B[7] + A.abreDialogo, sfx: "open", volume: 0.5 },
  { at: B[7] + A.tocaQuadro, sfx: "tap" },
  { at: B[7] + A.tocaConfirmar, sfx: "tap" },
  { at: B[7] + A.assinado, sfx: "success", volume: 0.75 },
  // Assinados
  { at: B[10] + TOQUE_ASSINADOS, sfx: "tap" },
  // logo
  { at: B[11] + 20, sfx: "chime", volume: 0.6 },
];

export const TutorialContratos: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[11] + 20, B[11] + 40], [0, 1], clamp);
  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <Narracao pasta="contratos" beats={BEATS} />
      <Sfx events={SFX} />
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
