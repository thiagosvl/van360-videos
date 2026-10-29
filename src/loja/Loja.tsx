import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { Users, GraduationCap, Check, AlertCircle, MessageCircle, Sparkles } from "lucide-react";
import Cobrancas from "@/pages/Cobrancas";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { RevisarSolicitacaoDialog } from "@/components/dialogs/RevisarSolicitacaoDialog";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { SecondaryKPICard } from "@/components/features/home/SecondaryKPICard";
import { Banner } from "@/components/ui/Banner";
import { AcessoRapido } from "@/components/features/home/AcessoRapido";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { PhoneScreen } from "../components/PhoneScreen";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { useImagensProntas } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { MOCK_PROFILE } from "../mocks/useProfile";
import {
  ALUNO_PAGAMENTO,
  FINANCEIRO_MES,
  LEMBRETE_WHATSAPP,
  MARCO_A_RECEBER,
  MARCO_RECEBIDAS,
  MOTORISTA,
  NOVO_ALUNO,
  PASSAGEIROS,
  PRE_PASSAGEIRO,
  totaisParcelas,
} from "../mocks/data";

/**
 * Imagens das lojas (App Store e Play Store).
 * Tudo é desenhado em "u" (1u = 1px numa tela de 1290 de largura), então o mesmo
 * slide serve para os dois tamanhos: no Android (mais curto) só corta a parte de baixo.
 * Regra: nada importante abaixo de ~2200u.
 */

const noop = () => {};
const NAVY = "#0b1a2e";
const AMBER = "#FFB300";
const BLUE = "#2563eb";

const useU = () => {
  const { width } = useVideoConfig();
  return width / 1290;
};

/* ------------------------------------------------------------------ */
/* moldura do slide                                                     */
/* ------------------------------------------------------------------ */

const Fundo: React.FC<{ variante?: "escuro" | "claro" }> = ({ variante = "escuro" }) => {
  const u = useU();
  if (variante === "claro") {
    return (
      <AbsoluteFill
        style={{ background: "radial-gradient(110% 55% at 50% 0%, #dfe8ff 0%, #f3f6fb 55%, #eef2f8 100%)" }}
      />
    );
  }
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      {/* brilho azul atrás do celular */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 1150 * u,
          width: 1700 * u,
          height: 1700 * u,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0.18) 38%, rgba(11,26,46,0) 70%)",
        }}
      />
      {/* textura de pontos bem sutil */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)",
          backgroundSize: `${34 * u}px ${34 * u}px`,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 45%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Título: **palavra** fica em destaque. */
const Titulo: React.FC<{ titulo: string; sub?: string; variante?: "escuro" | "claro" }> = ({
  titulo,
  sub,
  variante = "escuro",
}) => {
  const u = useU();
  const escuro = variante === "escuro";
  const parts = titulo.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div style={{ position: "absolute", top: 150 * u, left: 70 * u, right: 70 * u, textAlign: "center" }}>
      <div
        style={{
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 118 * u,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: escuro ? "white" : NAVY,
          textWrap: "balance",
          whiteSpace: "pre-line",
        }}
      >
        {parts.map((p, i) =>
          p.startsWith("**") ? (
            <span key={i} style={{ color: escuro ? AMBER : BLUE }}>
              {p.slice(2, -2)}
            </span>
          ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
          ),
        )}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 34 * u,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 46 * u,
            lineHeight: 1.3,
            color: escuro ? "rgba(226,234,246,0.82)" : "#4b5563",
            textWrap: "balance",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/** Celular centralizado, saindo pela parte de baixo do slide. */
const Celular: React.FC<{
  top?: number;
  escala?: number;
  x?: number;
  rot?: number;
  children: React.ReactNode;
}> = ({ top = 690, escala = 2.3, x = 0, rot = 0, children }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        top: top * u,
        left: "50%",
        translate: `calc(-50% + ${x * u}px) 0px`,
        rotate: `${rot}deg`,
        transformOrigin: "50% 0%",
        filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.35))",
      }}
    >
      {/* PhoneScreen escala a partir do topo-centro */}
      <div style={{ width: 414, height: 868, scale: String(escala * u), transformOrigin: "50% 0%" }}>{children}</div>
    </div>
  );
};

/** Cartão flutuante por cima do celular (destaca o que importa, em tamanho legível). */
const Destaque: React.FC<{
  x: number;
  y: number;
  rot?: number;
  cor: string;
  icone: React.ReactNode;
  titulo: string;
  texto?: string;
}> = ({ x, y, rot = 0, cor, icone, titulo, texto }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        rotate: `${rot}deg`,
        display: "flex",
        alignItems: "center",
        gap: 26 * u,
        padding: `${28 * u}px ${42 * u}px ${28 * u}px ${28 * u}px`,
        borderRadius: 40 * u,
        background: "white",
        boxShadow: "0 30px 60px -18px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: 92 * u,
          height: 92 * u,
          borderRadius: 28 * u,
          background: cor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
        }}
      >
        {icone}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 * u }}>
        <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 46 * u, color: NAVY, letterSpacing: "-0.02em" }}>
          {titulo}
        </span>
        {texto && <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 34 * u, color: "#6b7280" }}>{texto}</span>}
      </div>
    </div>
  );
};

const Icone: React.FC<{ i: React.ElementType }> = ({ i: I }) => {
  const u = useU();
  return <I style={{ width: 50 * u, height: 50 * u }} strokeWidth={2.4} />;
};

/* ------------------------------------------------------------------ */
/* telas reais do app                                                   */
/* ------------------------------------------------------------------ */

const DAVI = MARCO_A_RECEBER.find((c) => c.passageiro_id === ALUNO_PAGAMENTO)!;
const DAVI_PAGO = {
  ...DAVI,
  status: "pago",
  tipo_pagamento: "PIX",
  data_pagamento: "2026-03-12T10:00:00",
  recibo_url: staticFile("recibos/recibo-davi-marco.png"),
};

const TelaParcelas: React.FC<{ recibo?: boolean }> = ({ recibo = false }) => {
  useImagensProntas(recibo);
  const aReceber = MARCO_A_RECEBER;
  const recebidas = MARCO_RECEBIDAS;
  const t = totaisParcelas(aReceber, recebidas);
  return (
    <VideoStateProvider
      value={{
        parcelas: {
          mesFilter: 3,
          activeTab: "areceber",
          buscaAReceber: "",
          cobrancasAReceber: aReceber,
          paginatedCobrancasAReceber: aReceber,
          cobrancasRecebidas: recebidas,
          paginatedCobrancasRecebidas: recebidas,
          countAReceber: aReceber.length,
          countRecebidos: recebidas.length,
          isPastMonth: false,
          isCurrentMonth: true,
          ...t,
        },
        mesScroll: 3,
      }}
    >
      <PhoneScreen
        route="/parcelas"
        pageTitle="Parcelas"
        scale={1}
        overlay={
          recibo ? (
            <ReceiptDialog
              isOpen
              onClose={noop}
              receiptUrl={DAVI_PAGO.recibo_url}
              cobrancaId={DAVI_PAGO.id}
              mes={3}
              ano={2026}
              passageiroId={DAVI_PAGO.passageiro_id}
              nomePassageiro={DAVI_PAGO.passageiro.nome}
              nomeResponsavel={DAVI_PAGO.passageiro.responsavel_principal.nome}
            />
          ) : undefined
        }
      >
        <Cobrancas />
      </PhoneScreen>
    </VideoStateProvider>
  );
};

const TelaInicio: React.FC = () => (
  <PhoneScreen route="/inicio" scale={1}>
    <div className="space-y-3.5">
      <div className="px-1">
        <p className="text-xs font-medium text-[#737373]">quinta-feira, 12 de março</p>
      </div>
      <section className="px-1">
        <Banner
          variant="danger"
          title="1 parcela em atraso"
          description="Referente ao mês de Março. Clique para ver agora."
          onClick={noop}
        />
      </section>
      <div className="px-1 grid grid-cols-1 gap-4">
        <FinancialDashboardCard
          totalEsperado={FINANCEIRO_MES.totalEsperado}
          recebido={FINANCEIRO_MES.recebido}
          pendente={FINANCEIRO_MES.pendente}
          atrasado={FINANCEIRO_MES.atrasado}
          showPrivacyToggle={false}
        />
        <div className="grid grid-cols-2 gap-3">
          <SecondaryKPICard label="Alunos" value={24} icon={Users} />
          <SecondaryKPICard label="Escolas" value={3} icon={GraduationCap} />
        </div>
      </div>
    </div>
    <div className="mt-8">
      <AcessoRapido onCadastrarPassageiro={noop} onRegistrarGasto={noop} />
    </div>
  </PhoneScreen>
);

const TelaAlunos: React.FC = () => (
  <PhoneScreen route="/alunos" pageTitle="Alunos" scale={1}>
    <div className="space-y-4">
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
        showAdvancedFilters
        showRegister
        searchPlaceholder="Buscar aluno ou responsável..."
      />
      <div className="flex items-center justify-end px-0.5">
        <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">24 alunos</span>
      </div>
      <PassageirosList
        passageiros={PASSAGEIROS}
        onHistorico={noop}
        onEdit={noop}
        onToggleClick={noop}
        onDeleteClick={noop}
      />
    </div>
  </PhoneScreen>
);

const TelaSolicitacao: React.FC = () => (
  <VideoStateProvider value={{ revisar: { valor_cobranca: NOVO_ALUNO.valor, dia_vencimento: NOVO_ALUNO.vencimento } }}>
    <PhoneScreen
      route="/alunos"
      pageTitle="Alunos"
      scale={1}
      overlay={<RevisarSolicitacaoDialog isOpen prePassageiro={PRE_PASSAGEIRO} onClose={noop} />}
    >
      <Tabs value="solicitacoes" className="w-full space-y-4">
        <AppTabNav
          activeTab="solicitacoes"
          items={[
            { value: "alunos", label: "Alunos" },
            { value: "solicitacoes", label: "Solicitações", badge: 1 },
          ]}
        />
        <PrePassageiros profile={MOCK_PROFILE} prePassageiros={[PRE_PASSAGEIRO]} isLoading={false} />
      </Tabs>
    </PhoneScreen>
  </VideoStateProvider>
);

/* ------------------------------------------------------------------ */
/* os slides                                                            */
/* ------------------------------------------------------------------ */

/** 1. Gancho: a maior dor (cobrar). */
const S1: React.FC = () => {
  const u = useU();
  return (
    <AbsoluteFill>
      <Fundo />
      <Titulo titulo={"Pare de cobrar **pai por pai**"} sub="O lembrete chega sozinho no WhatsApp de cada responsável." />
      <Celular>
        <TelaParcelas />
      </Celular>
      {/* mensagem real do WhatsApp, em tamanho legível, por cima do celular */}
      <div
        style={{
          position: "absolute",
          left: 95 * u,
          top: 1330 * u,
          width: 340,
          scale: String(3.25 * u),
          transformOrigin: "0 0",
          rotate: "-3deg",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))",
        }}
      >
        <WabaMessage motorista={MOTORISTA.apelido} hora={LEMBRETE_WHATSAPP.hora}>
          {WABA_MODELOS.venceHoje(LEMBRETE_WHATSAPP)}
        </WabaMessage>
      </div>
      <Destaque
        x={620}
        y={1140}
        rot={3}
        cor="#25d366"
        icone={<Icone i={MessageCircle} />}
        titulo="Enviado sozinho"
        texto="Você não digita nada"
      />
    </AbsoluteFill>
  );
};

/** 2. Controle do dinheiro. */
const S2: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Saiba **quem pagou** e quem está devendo"} sub="O mês inteiro numa tela só, sem anotar nada." />
    <Celular top={760}>
      <TelaInicio />
    </Celular>
    <Destaque x={40} y={1420} rot={-3} cor="#10b981" icone={<Icone i={Check} />} titulo="R$ 5.320 recebido" texto="Atualiza na hora" />
    <Destaque x={600} y={1800} rot={3} cor="#ef4444" icone={<Icone i={AlertCircle} />} titulo="1 em atraso" texto="Você vê antes de cobrar" />
  </AbsoluteFill>
);

/** 3. Cadastro feito pelo pai. */
const S3: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"O pai cadastra. **Você só aprova.**"} sub="Mande o link e o aluno chega com todos os dados prontos." />
    <Celular top={760}>
      <TelaSolicitacao />
    </Celular>
    <Destaque x={560} y={1960} rot={3} cor={BLUE} icone={<Icone i={Sparkles} />} titulo="Dados já preenchidos" texto="Você só confere" />
  </AbsoluteFill>
);

/** 4. Recibo profissional. */
const S4: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Recibo com **a sua marca** em um toque"} sub="Pagou, o recibo já está pronto para mandar pro pai." />
    <Celular top={760}>
      <TelaParcelas recibo />
    </Celular>
    <Destaque x={40} y={1180} rot={-3} cor={AMBER} icone={<Icone i={Sparkles} />} titulo="Sua logo aqui" texto="Recibo com cara de empresa" />
  </AbsoluteFill>
);

/** 5. Organização (fim do papel). */
const S5: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Chega de **papel e planilha**"} sub="Alunos, escolas e responsáveis organizados no seu bolso." />
    <Celular top={760}>
      <TelaAlunos />
    </Celular>
  </AbsoluteFill>
);

/** 6. Fechamento: marca + teste grátis. */
const S6: React.FC = () => {
  const u = useU();
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: "absolute", top: 150 * u, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 40 * u, padding: 18 * u, boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile("logo-van360-3.png")} style={{ height: 130 * u, display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 240 * u, left: 0, right: 0 }}>
        <Titulo titulo={"Você dirige.\n**A gente organiza.**"} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 730 * u,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: `${24 * u}px ${48 * u}px`,
            borderRadius: 999,
            background: AMBER,
            color: NAVY,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 46 * u,
          }}
        >
          Teste grátis por 15 dias
        </div>
      </div>
      <Celular top={980} x={-250} rot={-7} escala={1.95}>
        <TelaAlunos />
      </Celular>
      <Celular top={940} x={250} rot={7} escala={1.95}>
        <TelaInicio />
      </Celular>
    </AbsoluteFill>
  );
};

export const SLIDES_LOJA: Array<{ id: string; component: React.FC }> = [
  { id: "1-cobranca", component: S1 },
  { id: "2-financeiro", component: S2 },
  { id: "3-cadastro", component: S3 },
  { id: "4-recibo", component: S4 },
  { id: "5-organizacao", component: S5 },
  { id: "6-marca", component: S6 },
];
