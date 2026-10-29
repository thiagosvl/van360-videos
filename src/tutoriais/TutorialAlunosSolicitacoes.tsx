import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FileText, Receipt, Route } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { RevisarSolicitacaoDialog } from "@/components/dialogs/RevisarSolicitacaoDialog";
import PassageiroExternalForm from "@/pages/PassageiroExternalForm";
import { ResponsavelCarteirinhaHeader } from "@/components/features/responsavel/carteirinha/ResponsavelCarteirinhaHeader";
import { buildPrePassageiroShareMessage } from "@/utils/whatsappTemplates";
import { PhoneScreen } from "../components/PhoneScreen";
import { WhatsAppChat } from "../components/WhatsAppChat";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { MOCK_PROFILE } from "../mocks/useProfile";
import { CARTEIRINHA_NOVO_ALUNO, LINK_DOMINIO, MOTORISTA, NOVO_ALUNO, PASSAGEIROS, PRE_PASSAGEIRO } from "../mocks/data";

/**
 * Tutorial: "O pai cadastra, você só aprova" (aba Solicitações da tela de Alunos).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Cadastrar aluno por aluno toma tempo. Deixe que os **pais** façam isso.", from: 0, duration: 150 },
  { text: "Envie o **link** de cadastro pelo WhatsApp.", from: 150, duration: 150 },
  { text: "O pai preenche os dados do filho pelo **celular** dele.", from: 300, duration: 180 },
  { text: "O pedido chega na hora no seu aplicativo.", from: 480, duration: 150 },
  { text: "Você confere e **aprova**. Só isso.", from: 630, duration: 180 },
  { text: "A **carteirinha digital** sai na hora. E o pai acessa pelo app.", from: 810, duration: 180 },
  { text: "As **parcelas** já aparecem. Contrato e rotas, a um toque.", from: 990, duration: 180 },
  { text: "Menos tempo com cadastro, mais tempo para **você**.", from: 1170, duration: 120 },
];
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
  { id: "pai-cart", from: B[6], to: TUTORIAL_ALUNOS_SOLICITACOES_DURATION, label: "Celular do pai" },
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
      overlay={<Finger showFrom={70} hideAt={125} steps={[{ at: 70, x: 195, y: 275 }, { at: 100, x: 195, y: 275, tap: true }]} />}
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
      <WhatsAppChat contato="Carla (mãe do Pedro)" mensagem={mensagem} enviaEm={24} />
    </PhoneScreen>
  );
};

/** O pai digitando: cada campo é "digitado" letra a letra. */
const TelaFormPai: React.FC = () => {
  const frame = useCurrentFrame();
  const digita = (texto: string, inicio: number, porLetra = 2) =>
    frame < inicio ? "" : texto.slice(0, Math.min(texto.length, Math.floor((frame - inicio) / porLetra) + 1));

  const values = {
    nome: digita(NOVO_ALUNO.nome, 22),
    data_nascimento: digita(NOVO_ALUNO.dataNascimento, 68),
    escola_id: frame >= 92 ? NOVO_ALUNO.escola.id : "",
    periodo: frame >= 104 ? NOVO_ALUNO.periodo : "",
    turma: digita(NOVO_ALUNO.turma, 114),
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
  const abreDialogo = 118; // toque no card
  const dialogo = frame >= abreDialogo + 8;
  const local = frame - (B[5] - B[4]); // relativo ao beat 5

  const digita = (texto: string, inicio: number) =>
    local < inicio ? "" : texto.slice(0, Math.min(texto.length, Math.floor((local - inicio) / 3) + 1));
  const revisar = {
    valor_cobranca: digita(NOVO_ALUNO.valor, 30),
    dia_vencimento: local >= 70 ? NOVO_ALUNO.vencimento : "",
  };
  const confirma = B[5] - B[4] + 120;

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

/** Celular do pai: a carteirinha digital do filho (mesma página do app do responsável). */
const TelaCarteirinhaPai: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[6]
  const beneficios = [
    { icon: Receipt, titulo: "Parcelas", texto: "geradas automaticamente", at: B[7] - B[6] + 10 },
    { icon: FileText, titulo: "Contrato", texto: "pronto para gerar", at: B[7] - B[6] + 40 },
    { icon: Route, titulo: "Rotas", texto: "é só incluir o aluno", at: B[7] - B[6] + 70 },
  ];

  return (
    <PhoneScreen route="/responsavel/carteirinha" scale={SCALE} showChrome={false} contentClassName="">
      <div className="min-h-[844px] bg-[#f5f5f5] text-[#0a0a0a] flex flex-col">
        {/* mesmo cabeçalho da ResponsavelCarteirinhaBase.tsx */}
        <header className="border-b border-[#e5e5e5] bg-white px-4 pt-[calc(0.875rem+var(--safe-area-top))] pb-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <img src="/assets/logo-van360.webp" alt="Van360" className="h-8 w-auto" />
            <h1 className="text-sm font-bold text-[#0a0a0a] tracking-tight">Carteirinha Digital</h1>
            <div className="h-9 w-9" />
          </div>
        </header>
        <main className="flex-1 p-4 w-full space-y-4">
          <div
            style={{
              scale: String(interpolate(frame, [16, 34], [0.9, 1], { ...clamp, easing: ease })),
              opacity: interpolate(frame, [16, 28], [0, 1], clamp),
            }}
          >
            <ResponsavelCarteirinhaHeader carteirinha={CARTEIRINHA_NOVO_ALUNO} />
          </div>
          <div className="space-y-2.5">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className="bg-white rounded-[20px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-3.5 flex items-center gap-3"
                style={{
                  opacity: interpolate(frame, [b.at, b.at + 10], [0, 1], clamp),
                  translate: interpolate(frame, [b.at, b.at + 16], ["0px 16px", "0px 0px"], { ...clamp, easing: ease }),
                }}
              >
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 text-primary border border-primary/15 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#0a0a0a]">{b.titulo}</span>
                  <span className="text-xs text-[#737373]">{b.texto}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </PhoneScreen>
  );
};

const TELAS: Record<string, React.FC> = {
  "app-link": TelaLink,
  whatsapp: TelaWhatsApp,
  "form-pai": TelaFormPai,
  "app-solic": TelaSolicitacoes,
  "pai-cart": TelaCarteirinhaPai,
};

/* ------------------------------------------------------------------ */

export const TutorialAlunosSolicitacoes: React.FC = () => {
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

