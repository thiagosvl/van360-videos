import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import PassageiroCarteirinha from "@/pages/PassageiroCarteirinha";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { RevisarSolicitacaoDialog } from "@/components/dialogs/RevisarSolicitacaoDialog";
import PassageiroExternalForm from "@/pages/PassageiroExternalForm";
import { buildPrePassageiroShareMessage } from "@/utils/whatsappTemplates";
import { PhoneScreen } from "../components/PhoneScreen";
import { WhatsAppChat } from "../components/WhatsAppChat";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { VideoStateProvider } from "../mocks/videoState";
import { MOCK_PROFILE } from "../mocks/useProfile";
import { LINK_DOMINIO, MOTORISTA, NOVO_ALUNO, PASSAGEIROS, PEDRO_ID, PRE_PASSAGEIRO } from "../mocks/data";

/**
 * Tutorial: "O pai cadastra, você só aprova" (aba Solicitações da tela de Alunos).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Cadastrar aluno por aluno toma tempo. Deixe que os **pais** façam isso.", from: 0, duration: 150 },
  { text: "Envie o **link** de cadastro pelo WhatsApp.", from: 150, duration: 100 },
  { text: "O pai preenche os dados do filho pelo **celular** dele, sem você digitar nada.", from: 250, duration: 165 },
  { text: "O pedido chega na hora no seu aplicativo.", from: 415, duration: 105 },
  { text: "Você confere, coloca o valor e o vencimento, e **aprova**. Só isso.", from: 520, duration: 150 },
  { text: "A **carteirinha digital** sai na hora. E o pai acessa pelo app.", from: 670, duration: 140 },
  { text: "As **parcelas** já aparecem. Contrato e rotas, a um toque.", from: 810, duration: 140 },
  { text: "Menos tempo com cadastro, mais tempo para **você**.", from: 950, duration: 130 },
]
export const TUTORIAL_ALUNOS_SOLICITACOES_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const noop = () => {};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18; // frames de troca de celular

/* ------------------------------------------------------------------ */
/* trechos: cada um é "um celular" em cena                             */
/* ------------------------------------------------------------------ */
type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "app-link", from: 0, to: B[2], label: "Seu celular" },
  { id: "whatsapp", from: B[2], to: B[3], label: "Seu WhatsApp" },
  { id: "form-pai", from: B[3], to: B[4], label: "Celular do pai" },
  { id: "app-solic", from: B[4], to: B[6], label: "Seu celular" },
  { id: "app-cart", from: B[6], to: TUTORIAL_ALUNOS_SOLICITACOES_DURATION, label: "Seu celular" },
];

/** Entra deslizando da direita e sai pela esquerda. */
const SegmentShell: React.FC<{ seg: Segment; first: boolean; last: boolean; children: React.ReactNode }> = ({
  seg,
  first,
  last,
  children,
}) => {
  const frame = useCurrentFrame(); // relativo ao início do trecho
  const len = seg.to - seg.from;
  const rise = usePhoneRise(4);
  const enter = first ? 0 : interpolate(frame, [0, SLIDE], [1150, 0], { ...clamp, easing: ease });
  const exit = last ? 0 : interpolate(frame, [len, len + SLIDE], [0, -1150], { ...clamp, easing: ease });
  const labelIn = interpolate(frame, [first ? 20 : 6, (first ? 20 : 6) + 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ translate: `${enter + exit}px 0px` }}>
      <div
        style={{
          position: "absolute",
          top: PHONE_TOP - 74,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: labelIn,
        }}
      >
        <div
          style={{
            padding: "10px 26px",
            borderRadius: 999,
            background: seg.label === "Celular do pai" ? "#ecfdf5" : "#eef3ff",
            color: seg.label === "Celular do pai" ? "#047857" : BRAND.blue,
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

/* tempos das ações (usados pelas telas e pelos efeitos sonoros) */
const T = {
  tocaLink: 100, // relativo ao início
  enviaWhats: 24, // relativo a B[2]
  form: { nome: 22, data: 68, escola: 92, periodo: 104, turma: 114 }, // relativo a B[3]
  cardChega: 20, // relativo a B[4]
  abreDialogo: 118, // relativo a B[4]
  valor: 30, // relativo a B[5]
  vencimento: 70, // relativo a B[5]
  confirma: 120, // relativo a B[5]
  trocaAba: 12, // relativo a B[7]
};

/* ------------------------------------------------------------------ */
/* telas                                                               */
/* ------------------------------------------------------------------ */

/** Topo da página de Alunos (abas + conteúdo), igual à Passageiros.tsx. */
const AlunosTabs: React.FC<{ tab: "alunos" | "solicitacoes"; badge: number; children: React.ReactNode }> = ({
  tab,
  badge,
  children,
}) => (
  <Tabs value={tab} className="w-full space-y-4">
    <AppTabNav
      activeTab={tab}
      items={[
        { value: "alunos", label: "Alunos" },
        { value: "solicitacoes", label: "Solicitações", badge },
      ]}
    />
    {children}
  </Tabs>
);

const TelaLink: React.FC = () => {
  return (
    <PhoneScreen
      route="/alunos"
      pageTitle="Alunos"
      scale={SCALE}
      overlay={<Finger showFrom={70} hideAt={125} steps={[{ at: 70, x: 195, y: 275 }, { at: T.tocaLink, x: 195, y: 275, tap: true }]} />}
    >
      <AlunosTabs tab="alunos" badge={0}>
        <div className="space-y-4">
          <QuickRegistrationLink profile={MOCK_PROFILE} pendingCount={0} />
          <PassageirosToolbar
            searchTerm=""
            onSearchChange={noop}
            selectedStatus="todos"
            onStatusChange={noop}
            selectedEscola="todas"
            onEscolaChange={noop}
            selectedVeiculo="todos"
            onVeiculoChange={noop}
            selectedPeriodo="todos"
            onPeriodoChange={noop}
            escolas={[]}
            veiculos={[]}
            onClearFilters={noop}
            hasActiveFilters={false}
            onApplyFilters={noop}
            onRegister={noop}
            searchPlaceholder="Buscar aluno ou responsável..."
          />
          <PassageirosList
            passageiros={PASSAGEIROS.slice(0, 4)}
            onHistorico={noop}
            onEdit={noop}
            onToggleClick={noop}
            onDeleteClick={noop}
          />
        </div>
      </AlunosTabs>
    </PhoneScreen>
  );
};

const TelaWhatsApp: React.FC = () => {
  // mesma mensagem e mesmo caminho do app (buildPrepassageiroLink); domínio do vídeo em data.ts
  const mensagem = buildPrePassageiroShareMessage(`${LINK_DOMINIO}/cadastro-passageiro/${MOTORISTA.id}`);
  return (
    <PhoneScreen route="/alunos" scale={SCALE} showChrome={false} contentClassName="">
      <WhatsAppChat contato="Carla (mãe do Pedro)" mensagem={mensagem} enviaEm={T.enviaWhats} />
    </PhoneScreen>
  );
};

/** O pai digitando: cada campo é "digitado" letra a letra. */
const TelaFormPai: React.FC = () => {
  const frame = useCurrentFrame();
  const digita = (texto: string, inicio: number, porLetra = 2) =>
    frame < inicio ? "" : texto.slice(0, Math.min(texto.length, Math.floor((frame - inicio) / porLetra) + 1));

  const values = {
    nome: digita(NOVO_ALUNO.nome, T.form.nome),
    data_nascimento: digita(NOVO_ALUNO.dataNascimento, T.form.data),
    escola_id: frame >= T.form.escola ? NOVO_ALUNO.escola.id : "",
    periodo: frame >= T.form.periodo ? NOVO_ALUNO.periodo : "",
    turma: digita(NOVO_ALUNO.turma, T.form.turma),
  };
  const scroll = interpolate(frame, [12, 40, 120, 160], [0, 330, 330, 640], { ...clamp, easing: ease });

  return (
    <VideoStateProvider value={{ externalForm: values }}>
      <PhoneScreen route="/cadastro-passageiro/mock" scale={SCALE} showChrome={false} contentClassName="" scrollY={scroll}>
        <PassageiroExternalForm />
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/** Solicitações + aprovação (diálogo real abrindo dentro do celular). */
const TelaSolicitacoes: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[4]
  const abreDialogo = T.abreDialogo; // toque no card
  const dialogo = frame >= abreDialogo + 8;
  const local = frame - (B[5] - B[4]); // relativo ao beat 5

  const digita = (texto: string, inicio: number) =>
    local < inicio ? "" : texto.slice(0, Math.min(texto.length, Math.floor((local - inicio) / 3) + 1));
  const revisar = {
    valor_cobranca: digita(NOVO_ALUNO.valor, T.valor),
    dia_vencimento: local >= T.vencimento ? NOVO_ALUNO.vencimento : "",
  };
  const confirma = B[5] - B[4] + T.confirma;

  return (
    <VideoStateProvider value={{ revisar }}>
      <PhoneScreen
        route="/alunos"
        pageTitle="Alunos"
        scale={SCALE}
        overlay={
          <>
          {dialogo && frame < confirma + 10 && (
            <RevisarSolicitacaoDialog isOpen prePassageiro={PRE_PASSAGEIRO} onClose={noop} />
          )}
          <Finger
            showFrom={88}
            hideAt={confirma + 12}
            steps={[
              { at: 88, x: 200, y: 236 },
              { at: abreDialogo, x: 200, y: 236, tap: true },
              { at: confirma - 2, x: 272, y: 744 },
              { at: confirma, x: 272, y: 744, tap: true },
            ]}
          />
          </>
        }
      >
        <AlunosTabs tab="solicitacoes" badge={1}>
          <div className="space-y-4">
            <div className="flex items-center justify-end px-0.5">
              <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">1 solicitação</span>
            </div>
            <div style={{ opacity: interpolate(frame, [20, 30], [0, 1], clamp) }}>
              <PrePassageiros profile={MOCK_PROFILE} prePassageiros={[PRE_PASSAGEIRO]} isLoading={false} />
            </div>
          </div>
        </AlunosTabs>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/** Seu celular: a carteirinha REAL do aluno recém-aprovado (visão do motorista). */
const TelaCarteirinha: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[6]
  const tab = frame >= B[7] - B[6] + T.trocaAba ? "contrato" : "parcelas";
  const route = `/alunos/${PEDRO_ID}?tab=${tab}&ano=2026`;
  // na aba Parcelas, desce um pouco para mostrar as parcelas já geradas
  const scroll = tab === "parcelas" ? interpolate(frame, [70, 130], [0, 300], { ...clamp, easing: ease }) : 0;
  return (
    <PhoneScreen key={route} route={route} pageTitle="Carteirinha" scale={SCALE} scrollY={scroll}>
      <Routes>
        <Route path="/alunos/:passageiro_id" element={<PassageiroCarteirinha />} />
      </Routes>
    </PhoneScreen>
  );
};

const TELAS: Record<string, React.FC> = {
  "app-link": TelaLink,
  whatsapp: TelaWhatsApp,
  "form-pai": TelaFormPai,
  "app-solic": TelaSolicitacoes,
  "app-cart": TelaCarteirinha,
};

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
/** um "tec" a cada 2 letras digitadas */
const teclas = (inicio: number, texto: string, porLetra: number): SfxEvent[] =>
  Array.from({ length: Math.ceil(texto.length / 2) }, (_, i) => ({ at: inicio + i * 2 * porLetra, sfx: "select", volume: 0.3 }));

const SFX: SfxEvent[] = [
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  { at: T.tocaLink, sfx: "tap" },
  // trocas de celular
  ...SEGMENTS.slice(0, -1).map((s): SfxEvent => ({ at: s.to, sfx: "whoosh", volume: 0.55 })),
  // mensagem enviada no WhatsApp
  { at: B[2] + T.enviaWhats, sfx: "pop", volume: 0.6 },
  // o pai preenche
  ...teclas(B[3] + T.form.nome, NOVO_ALUNO.nome, 2),
  ...teclas(B[3] + T.form.data, NOVO_ALUNO.dataNascimento, 2),
  { at: B[3] + T.form.escola, sfx: "select", volume: 0.6 },
  { at: B[3] + T.form.periodo, sfx: "select", volume: 0.6 },
  ...teclas(B[3] + T.form.turma, NOVO_ALUNO.turma, 2),
  // o pedido chega
  { at: B[4] + T.cardChega, sfx: "vibra", volume: 0.45 },
  { at: B[4] + T.cardChega + 2, sfx: "notif", volume: 0.8 },
  // revisar e aprovar
  { at: B[4] + T.abreDialogo, sfx: "tap" },
  { at: B[4] + T.abreDialogo + 8, sfx: "open", volume: 0.6 },
  ...teclas(B[5] + T.valor, NOVO_ALUNO.valor, 3),
  { at: B[5] + T.vencimento, sfx: "select", volume: 0.6 },
  { at: B[5] + T.confirma, sfx: "tap" },
  { at: B[5] + T.confirma + 6, sfx: "success", volume: 0.7 },
  // carteirinha: troca de aba
  { at: B[7] + T.trocaAba, sfx: "select", volume: 0.6 },
  // logo
  { at: B[8] + 20, sfx: "chime", volume: 0.6 },
];

export const TutorialAlunosSolicitacoes: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[8] + 20, B[8] + 40], [0, 1], clamp);

  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <Narracao pasta="solicitacoes" beats={BEATS} />
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

