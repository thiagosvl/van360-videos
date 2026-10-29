import React from "react";
import { staticFile } from "remotion";
import Cobrancas from "@/pages/Cobrancas";
import PassageiroExternalForm from "@/pages/PassageiroExternalForm";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { RevisarSolicitacaoDialog } from "@/components/dialogs/RevisarSolicitacaoDialog";
import { ChamadaEscolaDialog } from "@/components/dialogs/ChamadaEscolaDialog";
import { ContratosList } from "@/components/features/contrato/ContratosList";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { FretamentoCardItem } from "@/components/features/fretamento/FretamentoCardItem";
import { FretamentoKpiCards } from "@/components/features/fretamento/FretamentoKpiCards";
import { CarteirinhaHeader, CarteirinhaCobrancas } from "@/components/features/passageiro/carteirinha";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { RouteStopStatus } from "@/types/route";
import { ContratoStatus, ContratoTab } from "@/types/enums";
import { PhoneScreen } from "../components/PhoneScreen";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { useImagensProntas } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { MOCK_PROFILE } from "../mocks/useProfile";
import {
  ALUNO_PAGAMENTO,
  ESCOLAS,
  LEMBRETE_WHATSAPP,
  MARCO_A_RECEBER,
  MARCO_RECEBIDAS,
  MOTORISTA,
  NOVO_ALUNO,
  PASSAGEIROS,
  PRE_PASSAGEIRO,
  totaisParcelas,
} from "../mocks/data";

const noop = () => {};

/* ---------------- Parcelas (com ou sem recibo aberto) ---------------- */

const DAVI = MARCO_A_RECEBER.find((c) => c.passageiro_id === ALUNO_PAGAMENTO)!;
const DAVI_PAGO = {
  ...DAVI,
  status: "pago",
  tipo_pagamento: "PIX",
  data_pagamento: "2026-03-12T10:00:00",
  recibo_url: staticFile("recibos/recibo-davi-marco.png"),
};

export const TelaParcelas: React.FC<{ recibo?: boolean; scrollY?: number }> = ({ recibo = false, scrollY = 0 }) => {
  useImagensProntas(recibo);
  const t = totaisParcelas(MARCO_A_RECEBER, MARCO_RECEBIDAS);
  return (
    <VideoStateProvider
      value={{
        parcelas: {
          mesFilter: 3,
          activeTab: "areceber",
          buscaAReceber: "",
          cobrancasAReceber: MARCO_A_RECEBER,
          paginatedCobrancasAReceber: MARCO_A_RECEBER,
          cobrancasRecebidas: MARCO_RECEBIDAS,
          paginatedCobrancasRecebidas: MARCO_RECEBIDAS,
          countAReceber: MARCO_A_RECEBER.length,
          countRecebidos: MARCO_RECEBIDAS.length,
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
        scrollY={scrollY}
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

/* ---------------- WhatsApp do pai recebendo o lembrete ---------------- */

export const TelaWhatsAppPai: React.FC = () => (
  <PhoneScreen route="/" scale={1} showChrome={false} contentClassName="">
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Inter" }}>
      <div className="flex items-center gap-3 px-3 pb-2.5 bg-[#f0f2f5] border-b border-[#e5e5e5]" style={{ paddingTop: 38 }}>
        <span className="text-[#54656f] text-xl leading-none">‹</span>
        <img src="/assets/logo-van360.webp" className="h-9 w-9 rounded-full bg-white object-contain p-1" />
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#111b21] leading-tight">Van360</span>
          <span className="text-[11px] text-[#667781]">conta comercial</span>
        </div>
      </div>
      <div className="relative flex-1 bg-[#efeae2] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('/assets/whatsapp-wallpaper.png')" }} />
        <div className="relative flex justify-center pt-4">
          <span className="px-3 py-1 rounded-lg bg-white/90 text-[11px] text-[#54656f] shadow-sm">HOJE</span>
        </div>
      </div>
    </div>
  </PhoneScreen>
);

/** Bolha do lembrete (modelo real do WhatsApp Manager), para ampliar por cima. */
export const BolhaLembrete: React.FC = () => (
  <WabaMessage motorista={MOTORISTA.apelido} hora={LEMBRETE_WHATSAPP.hora}>
    {WABA_MODELOS.venceHoje(LEMBRETE_WHATSAPP)}
  </WabaMessage>
);

/* ---------------- Cadastro pelo pai + aprovação ---------------- */

export const TelaFormPai: React.FC<{ scrollY?: number }> = ({ scrollY = 330 }) => (
  <VideoStateProvider
    value={{
      externalForm: {
        nome: NOVO_ALUNO.nome,
        data_nascimento: NOVO_ALUNO.dataNascimento,
        escola_id: NOVO_ALUNO.escola.id,
        periodo: NOVO_ALUNO.periodo,
        turma: NOVO_ALUNO.turma,
      },
    }}
  >
    <PhoneScreen route="/cadastro-passageiro/mock" scale={1} showChrome={false} contentClassName="" scrollY={scrollY}>
      <PassageiroExternalForm />
    </PhoneScreen>
  </VideoStateProvider>
);

export const TelaAprovacao: React.FC = () => (
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

/* ---------------- Chamada na escola ---------------- */

const CHAMADA = [
  ["Ana Beatriz Souza", "3º ano", true],
  ["Davi Santos", "4º ano", true],
  ["Miguel Oliveira", "1º ano", false],
  ["Gabriel Nunes", "2º ano", true],
  ["Valentina Prado", "5º ano", true],
  ["Enzo Barros", "3º ano", false],
  ["Alice Moura", "1º ano", true],
  ["Heitor Campos", "4º ano", true],
] as const;

export const TelaChamada: React.FC = () => (
  <PhoneScreen
    route="/rotas"
    pageTitle="Rota da Tarde"
    scale={1}
    overlay={
      <ChamadaEscolaDialog
        open
        onOpenChange={noop}
        escolaNome={ESCOLAS.aurora.nome}
        isSubmitting={false}
        onConfirmChamada={async () => {}}
        alunos={
          CHAMADA.map(([nome, turma, presente], i) => ({
            id: `ch${i}`,
            status: presente ? RouteStopStatus.EMBARCADO : RouteStopStatus.AUSENTE,
            nome,
            passageiro: { nome, turma },
          })) as any
        }
      />
    }
  >
    <div />
  </PhoneScreen>
);

/* ---------------- Contratos ---------------- */

const CONTRATOS = PASSAGEIROS.slice(0, 7).map((p, i) => ({
  id: `ct${i}`,
  passageiro_id: p.id,
  nome: p.nome,
  tipo: "contrato",
  status: ContratoStatus.ASSINADO,
  status_contrato: ContratoStatus.ASSINADO,
  contrato_id: `ct${i}`,
  valor_parcela: 280,
  valor_cobranca: 280,
  created_at: `2026-02-0${(i % 8) + 1}T10:00:00`,
  assinado_em: `2026-02-0${(i % 8) + 2}T14:20:00`,
  contrato_final_url: "x",
  dados_contrato: { valorMensal: 280, diaVencimento: 10 },
  passageiro: p,
  responsavel_principal: (p as any).responsavel_principal,
}));

export const TelaContratos: React.FC = () => (
  <PhoneScreen route="/contratos" pageTitle="Contratos" scale={1}>
    <Tabs value={ContratoTab.ASSINADOS} className="w-full space-y-4">
      <AppTabNav
        activeTab={ContratoTab.ASSINADOS}
        items={[
          { value: ContratoTab.SEM_CONTRATO, label: "Sem contrato" },
          { value: ContratoTab.PENDENTES, label: "Pendentes" },
          { value: ContratoTab.ASSINADOS, label: "Assinados", badge: 21 },
        ]}
      />
      <ContratosList
        data={CONTRATOS as any}
        isLoading={false}
        activeTab={ContratoTab.ASSINADOS}
        busca=""
        isContratoConfigurado
        onVerPassageiro={noop}
        onEnviarWhatsApp={noop}
        onExcluir={noop}
        onSubstituir={noop}
        onGerarContrato={noop}
        onVisualizarLink={noop}
        onVisualizarFinal={noop}
        onDownload={noop}
      />
    </Tabs>
  </PhoneScreen>
);

/* ---------------- Relatórios (lucro) ---------------- */

export const TelaRelatorios: React.FC = () => (
  <PhoneScreen route="/relatorios" pageTitle="Relatórios" scale={1}>
    <div className="space-y-4">
      <Tabs value="visao" className="w-full space-y-4">
        <AppTabNav
          activeTab="visao"
          items={[
            { value: "visao", label: "Visão Geral" },
            { value: "entradas", label: "Entradas" },
            { value: "saidas", label: "Saídas" },
          ]}
        />
      </Tabs>
      <RelatoriosVisaoGeral
        dados={{
          lucroEstimado: 4310,
          lucroAtual: 2910,
          aReceber: { valor: 1400, passageiros: 5 },
          custoPorPassageiro: 100,
          taxaRecebimento: 79,
          previsto: 6720,
          recebido: 5320,
          gasto: 2410,
        }}
      />
    </div>
  </PhoneScreen>
);

/* ---------------- Fretes e passeios ---------------- */

const viagem = (o: any) => ({
  id: o.id,
  titulo: o.titulo,
  destino: o.destino,
  origem: "Garagem",
  tipo: o.tipo,
  status: o.status ?? "agendado",
  status_pagamento: "pendente",
  data_inicio: o.data,
  data_fim: null,
  valor_total: o.valor_total,
  valor_por_pessoa: o.valor_por_pessoa ?? null,
  vagas_totais: o.vagas ?? null,
  vagas_ocupadas: o.ocupadas ?? 0,
  total_pago: o.pago,
  saldo_restante: o.valor_total - o.pago,
  veiculos: [{ id: "v", veiculo_id: "v1", placa: "ABC1D23", modelo: "Sprinter", vagas_capacidade: 20 }],
  percentualPago: Math.round((o.pago / o.valor_total) * 100),
  isQuitado: o.pago >= o.valor_total,
  isLotado: o.vagas ? o.ocupadas >= o.vagas : false,
  vagasRestantes: o.vagas ? o.vagas - o.ocupadas : null,
  isPassado: false,
  isConcluido: false,
  chave_pix: null,
  contratante_nome: o.contratante ?? null,
  contratante_telefone: null,
  created_at: "2026-03-01",
  updated_at: "2026-03-01",
  observacoes: null,
  slug_publico: o.tipo === "passeio" ? "passeio" : null,
  usuario_id: MOTORISTA.id,
});

const VIAGENS = [
  viagem({ id: "f1", tipo: "passeio", titulo: "Passeio ao Zoológico", destino: "Zoológico de São Paulo", data: "2026-03-21T07:00:00", valor_total: 1800, valor_por_pessoa: 90, vagas: 20, ocupadas: 20, pago: 1800 }),
  viagem({ id: "f2", tipo: "fretamento", titulo: "Formatura Colégio Aurora", destino: "Buffet Villa Real", data: "2026-03-28T18:00:00", valor_total: 950, pago: 475, contratante: "Colégio Aurora" }),
  viagem({ id: "f3", tipo: "passeio", titulo: "Praia de Santos", destino: "Santos, SP", data: "2026-04-11T06:00:00", valor_total: 2400, valor_por_pessoa: 120, vagas: 20, ocupadas: 14, pago: 1200 }),
];

export const TelaPasseios: React.FC = () => (
  <PhoneScreen route="/fretamentos" pageTitle="Fretes e Passeios" scale={1}>
    <div className="space-y-4">
      <FretamentoKpiCards totalFaturado={5150} totalRecebido={3475} totalAReceber={1675} percentualRecebido={67} totalViagens={3} />
      <div className="space-y-3">
        {VIAGENS.map((v) => (
          <FretamentoCardItem
            key={v.id}
            item={v as any}
            onOpenRegistrarPagamento={noop}
            onOpenEditar={noop}
            onConfirmarExclusao={noop}
          />
        ))}
      </div>
    </div>
  </PhoneScreen>
);

/* ---------------- Carteirinha do aluno ---------------- */

const ANA = {
  ...(PASSAGEIROS[0] as any),
  data_nascimento: "2017-08-14",
  logradouro: "Rua das Palmeiras",
  numero: "120",
  bairro: "Jardim Aurora",
  cidade: "São Paulo",
  estado: "SP",
  enviar_cobranca_automatica: true,
};

const COBRANCAS_ANA = [2, 3, 4, 5, 6, 7].map((mes) => {
  const mm = String(mes).padStart(2, "0");
  const pago = mes <= 3;
  return {
    id: `ca-${mes}`,
    passageiro_id: ANA.id,
    mes,
    ano: 2026,
    valor: 280,
    status: pago ? "pago" : "pendente",
    data_vencimento: `2026-${mm}-10`,
    data_pagamento: pago ? `2026-${mm}-09T10:00:00` : undefined,
    tipo_pagamento: pago ? "PIX" : undefined,
    passageiro: ANA,
  } as any;
});

export const TelaCarteirinha: React.FC = () => (
  <PhoneScreen route="/alunos/p1" pageTitle="Carteirinha" scale={1}>
    <div className="space-y-0">
      <CarteirinhaHeader
        passageiro={ANA}
        temCobrancasVencidas={false}
        onToggleClick={noop}
        onEditClick={noop}
        onDeleteClick={noop}
        onEnviarWhatsApp={noop}
        onToggleNotificacoesClick={noop}
      />
      <Tabs value="parcelas" className="w-full pt-7">
        <AppTabNav
          activeTab="parcelas"
          items={[
            { value: "parcelas", label: "Parcelas" },
            { value: "dados-pessoais", label: "Dados" },
            { value: "responsaveis", label: "Responsáveis" },
            { value: "contrato", label: "Contrato" },
          ]}
        />
        <div className="mt-3.5">
          <CarteirinhaCobrancas
            cobrancas={COBRANCAS_ANA}
            passageiro={ANA}
            yearFilter="2026"
            mostrarTodasCobrancas
            onOpenCobrancaDialog={noop}
            onEditCobranca={noop}
            onRegistrarPagamento={noop}
            onExcluirCobranca={noop}
            onToggleLembretes={noop}
            onDesfazerPagamento={noop}
            onToggleClick={noop}
            onVerRecibo={noop}
          />
        </div>
      </Tabs>
    </div>
  </PhoneScreen>
);
