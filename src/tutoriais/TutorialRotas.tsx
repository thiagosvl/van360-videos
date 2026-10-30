import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Rotas from "@/pages/Rotas";
import { ActiveRouteExecutionView } from "@/components/features/active-route/ActiveRouteExecutionView";
import { ChamadaRapidaDialog } from "@/components/dialogs/ChamadaRapidaDialog";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { Circulo } from "../components/Circulo";
import { AcoesNaTela } from "../components/AcoesNaTela";
import { TelaBloqueio, Notificacao } from "../components/TelaBloqueio";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { usarLarguraDeCelular } from "../viewport";
import { ESCOLAS_CHAMADA, execucaoIda } from "../mocks/rotas";

/**
 * Tutorial: Rotas (itinerário, execução parada a parada, chamada na escola, avisos e faltas dos pais).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Suas rotas e itinerários **no celular**, sem papel colado no painel da van.", from: 0, duration: 165 },
  { text: "Cada rota com as paradas **na ordem certa**: alunos e escolas.", from: 165, duration: 180 },
  { text: "Iniciou a rota? Os pais **são avisados na hora**.", from: 345, duration: 165 },
  { text: "Parada por parada: embarcou ou faltou, **um toque**. Nenhum aluno esquecido.", from: 510, duration: 195 },
  { text: "Na porta da escola, a **chamada de embarque** sai em segundos.", from: 705, duration: 165 },
  { text: "E o pai acompanha tudo: **embarque e desembarque** confirmados.", from: 870, duration: 165 },
  { text: "Filho não vai? O pai avisa e a **falta já aparece** na sua rota.", from: 1035, duration: 225 },
  { text: "Rota organizada, **dia mais tranquilo**.", from: 1260, duration: 120 },
];
export const TUTORIAL_ROTAS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const asyncNoop = async () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;

/* ------------------------------------------------------------------ */
/* trechos: cada um é "um celular" em cena                             */
/* ------------------------------------------------------------------ */
type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "rotas", from: 0, to: B[3] + 50, label: "Seu celular" },
  { id: "aviso-inicio", from: B[3] + 50, to: B[4], label: "Celular do pai" },
  { id: "execucao", from: B[4], to: B[6], label: "Seu celular" },
  { id: "aviso-embarque", from: B[6], to: B[7], label: "Celular do pai" },
  { id: "falta-pai", from: B[7], to: B[7] + 120, label: "Celular do pai" },
  { id: "falta-rota", from: B[7] + 120, to: TUTORIAL_ROTAS_DURATION, label: "Seu celular" },
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

/** A tela da rota (a mesma do app: prévia antes de iniciar, execução depois). */
const TelaRota: React.FC<{ estado: ReturnType<typeof execucaoIda>; preview?: boolean }> = ({ estado, preview }) => (
  <ActiveRouteExecutionView
    {...estado}
    isLoading={false}
    handleStep={asyncNoop}
    handleFinalizarRota={asyncNoop}
    handleCancel={asyncNoop}
    handleReordenar={asyncNoop}
    isPreview={!!preview}
    onBack={noop}
    iniciarMutation={{ mutate: noop, mutateAsync: asyncNoop, isPending: false }}
  />
);

/* pontos de toque (px do celular 390x844), conferidos em stills */
const P = {
  idaManha: { x: 195, y: 272 },
  endereco: { x: 341, y: 354 },
  iniciar: { x: 257, y: 270 },
  continuar: { x: 265, y: 461 },
  continuar2: { x: 265, y: 543 },
  alunoChamada: { x: 195, y: 430 },
  salvarChamada: { x: 297, y: 627 },
  dataAusencia: { x: 195, y: 532 },
  salvarAusencia: { x: 316, y: 677 },
};

/* ------------------------------------------------------------------ */
/* Seu celular: rotas, itinerário e início                             */
/* ------------------------------------------------------------------ */
const T1 = {
  tocaIda: B[1] + 125,
  abreRota: B[1] + 131,
  tocaEndereco: B[2] + 122,
  abreEndereco: B[2] + 128,
  fechaEndereco: B[3] - 6,
  tocaIniciar: B[3] + 25,
  iniciada: B[3] + 31,
};

const TelaRotas: React.FC = () => {
  const frame = useCurrentFrame();
  const naRota = frame >= T1.abreRota;
  const iniciada = frame >= T1.iniciada;
  const enderecoAberto = frame >= T1.abreEndereco && frame < T1.fechaEndereco;
  // passeia pelas paradas da rota (alunos e a escola no fim)
  const rola = naRota && !iniciada ? interpolate(frame, [B[2] + 10, B[2] + 60, B[2] + 75, B[2] + 100], [0, 420, 420, 0], { ...clamp, easing: ease }) : 0;
  const route = naRota ? "/rotas/executar/r1" : "/rotas";
  return (
    <PhoneScreen
      key={`${route}-${iniciada}`}
      route={route}
      pageTitle={naRota ? "Ida Manhã" : "Rotas"}
      scale={SCALE}
      scrollY={rola}
      overlay={
        <>
          {/* endereço da parada: abre no Google Maps ou no Waze */}
          {enderecoAberto && <AcoesNaTela key="endereco" dentro="tela" passos={[{ tocarSeletor: '[title="Ver endereço e detalhes da parada"]' }]} />}
          <Finger
            showFrom={T1.tocaIda - 22}
            hideAt={T1.tocaIniciar + 8}
            steps={[
              { at: T1.tocaIda - 22, ...P.idaManha },
              { at: T1.tocaIda, ...P.idaManha, tap: true },
              { at: T1.tocaEndereco, ...P.endereco, tap: true },
              { at: T1.tocaIniciar, ...P.iniciar, tap: true },
            ]}
          />
        </>
      }
    >
      <Routes>
        <Route path="/rotas" element={<Rotas />} />
        <Route path="/rotas/executar/r1" element={<TelaRota estado={execucaoIda({ preview: !iniciada })} preview={!iniciada} />} />
      </Routes>
    </PhoneScreen>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: avisos (textos reais das notificações do app)       */
/* ------------------------------------------------------------------ */
const AVISO_INICIO: Notificacao[] = [
  { titulo: "Rota Iniciada! 🚌", corpo: "A van iniciou a rota de ida para a escola às 06:35. Avisaremos quando estiver a caminho da sua residência!", chegaEm: 14, hora: "06:35" },
  { titulo: "Van a Caminho! 🚌", corpo: "A van está a caminho para buscar o Pedro.", chegaEm: 70 },
];
const AVISO_EMBARQUE: Notificacao[] = [
  { titulo: "Embarque Confirmado ✅", corpo: "O Pedro embarcou na van às 06:52 a caminho da escola!", chegaEm: 16, hora: "06:52" },
  { titulo: "Voltando para Casa! 🏡", corpo: "A van saiu da escola com o Pedro às 12:10 e iniciou o trajeto de volta!", chegaEm: 62, hora: "12:10" },
  { titulo: "Desembarque Confirmado ✅", corpo: "O Pedro desembarcou com segurança às 12:41!", chegaEm: 108 },
];

const TelaAviso: React.FC<{ hora: string; avisos: Notificacao[] }> = ({ hora, avisos }) => (
  <PhoneScreen route="/" scale={SCALE} showChrome={false} contentClassName="">
    <TelaBloqueio hora={hora} data="quinta-feira, 12 de março" notificacoes={avisos} />
  </PhoneScreen>
);

/* ------------------------------------------------------------------ */
/* Seu celular: parada por parada e a chamada na porta da escola       */
/* ------------------------------------------------------------------ */
const T2 = {
  tocaContinuar1: 40, // relativo a B[4]
  tocaContinuar2: 110,
  abreChamada: B[5] - B[4] + 10,
  passosChamada: [B[5] - B[4] + 60],
  tocaSalvar: B[5] - B[4] + 130,
};

const TelaExecucao: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[4]
  const feitas = frame >= T2.tocaContinuar2 + 4 ? 2 : frame >= T2.tocaContinuar1 + 4 ? 1 : 0;
  const chamada = frame >= T2.abreChamada && frame < T2.tocaSalvar + 6;
  const passo = T2.passosChamada.filter((t) => frame >= t).length;
  return (
    <PhoneScreen
      route="/rotas/executar/r1"
      pageTitle="Ida Manhã"
      scale={SCALE}
      overlay={
        <>
          {chamada && (
            <React.Fragment key={`chamada-${passo}`}>
              <ChamadaRapidaDialog open onOpenChange={noop} escolas={ESCOLAS_CHAMADA as any} onSalvar={noop} />
              {/* o Davi não está na saída hoje: um toque e ele fica ausente */}
              <AcoesNaTela passos={[{ tocarTexto: "Davi Santos" }].slice(0, passo) as any} />
            </React.Fragment>
          )}
          <Finger
            showFrom={T2.tocaContinuar1 - 22}
            hideAt={T2.tocaContinuar2 + 8}
            steps={[
              { at: T2.tocaContinuar1 - 22, ...P.continuar },
              { at: T2.tocaContinuar1, ...P.continuar, tap: true },
              { at: T2.tocaContinuar2, ...P.continuar2, tap: true },
            ]}
          />
          <Finger
            showFrom={T2.passosChamada[0] - 22}
            hideAt={T2.tocaSalvar + 8}
            steps={[
              { at: T2.passosChamada[0] - 22, ...P.alunoChamada },
              { at: T2.passosChamada[0] - 2, ...P.alunoChamada, tap: true },
              { at: T2.tocaSalvar, ...P.salvarChamada, tap: true },
            ]}
          />
        </>
      }
    >
      <Routes>
        <Route path="/rotas/executar/r1" element={<TelaRota estado={execucaoIda({ feitas, ausentes: [] })} />} />
      </Routes>
    </PhoneScreen>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: registra a falta                                     */
/* ------------------------------------------------------------------ */
const T3 = { passos: [20, 40], tocaSalvar: 92 };
const TelaFaltaPai: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[7]
  const passo = T3.passos.filter((t) => frame >= t).length;
  const aberto = frame < T3.tocaSalvar + 6;
  return (
    <PhoneScreen route="/" scale={SCALE} showChrome={false} contentClassName="">
      <div className="absolute inset-0 bg-[#f5f5f5]" />
      {aberto && (
        <React.Fragment key={`falta-${passo}`}>
          <ResponsavelNotificarAusenciaDialog
            open
            onOpenChange={noop}
            passageiroId="p4"
            passageiroNome="Miguel Oliveira"
            rotas={[{ id: "r1", nome: "Ida Manhã", periodo: "manha" }]}
            token="video"
          />
          <AcoesNaTela passos={([{ tocar: "dd/mm/aaaa" }, { tocar: "12" }] as any).slice(0, passo)} />
        </React.Fragment>
      )}
      <div className="absolute inset-0 z-[70]">
        <Finger
          showFrom={8}
          hideAt={T3.tocaSalvar + 8}
          steps={[
            { at: 8, ...P.dataAusencia },
            { at: T3.passos[0] - 2, ...P.dataAusencia, tap: true },
            { at: T3.tocaSalvar, ...P.salvarAusencia, tap: true },
          ]}
        />
      </div>
    </PhoneScreen>
  );
};

/** De volta ao tio: ao iniciar a rota, o Miguel já aparece como ausente (falta avisada pelo pai). */
const TelaFaltaRota: React.FC = () => (
  <PhoneScreen
    route="/rotas/executar/r1"
    pageTitle="Ida Manhã"
    scale={SCALE}
    overlay={<Circulo x={200} y={330} w={340} h={58} desde={30} ate={TUTORIAL_ROTAS_DURATION - B[7] - 120 - 8} />}
  >
    <Routes>
      <Route path="/rotas/executar/r1" element={<TelaRota estado={execucaoIda({ ausentes: ["p4"] })} />} />
    </Routes>
  </PhoneScreen>
);

const TELAS: Record<string, React.FC> = {
  rotas: TelaRotas,
  "aviso-inicio": () => <TelaAviso hora="6:35" avisos={AVISO_INICIO} />,
  execucao: TelaExecucao,
  "aviso-embarque": () => <TelaAviso hora="12:41" avisos={AVISO_EMBARQUE} />,
  "falta-pai": TelaFaltaPai,
  "falta-rota": TelaFaltaRota,
};

/* ------------------------------------------------------------------ */

export const TutorialRotas: React.FC = () => {
  usarLarguraDeCelular();
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[8] + 20, B[8] + 40], [0, 1], clamp);
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
