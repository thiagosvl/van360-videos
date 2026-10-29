// Renovação 2026 -> 2027 (o vídeo se passa em 10/12/2026). Estado da história vem de
// VideoState.renovacao; as contas dos KPIs seguem o back-end (renovacao.service).
import { useVideoState } from "@mocks/videoState";
import { ESCOLAS, MOTORISTA, NOVO_ALUNO, PASSAGEIROS, PEDRO_ID } from "@mocks/data";

export type EstadoRenovacao = {
  /** período de cobrança de 2027 já definido */
  periodo?: boolean;
  /** reajuste aplicado (%) */
  reajuste?: number;
  /** status por aluno (padrão: pendente) */
  status?: Record<string, "pendente" | "confirmado" | "recusado">;
  /** alunos que já receberam o link pelo WhatsApp */
  notificados?: string[];
  /** alunos marcados na lista */
  selecionados?: string[];
};

export const ANO_DESTINO = 2027;

const ALUNOS_RENOVACAO = [
  ...PASSAGEIROS.map((p: any) => ({
    id: p.id,
    nome: p.nome,
    escola: p.escola,
    periodo: p.periodo,
    responsavel: p.responsavel_principal,
  })),
  {
    id: PEDRO_ID,
    nome: NOVO_ALUNO.nome,
    escola: ESCOLAS.aurora,
    periodo: "manha",
    responsavel: { nome: NOVO_ALUNO.responsavel, telefone: "11991234567" },
  },
];

const novoValor = (e: EstadoRenovacao) => Math.round(280 * (1 + (e.reajuste ?? 0) / 100) * 100) / 100;

export function dadosRenovacao(e: EstadoRenovacao) {
  const passageiros = ALUNOS_RENOVACAO.map((a) => ({
    passageiro_id: a.id,
    nome: a.nome,
    valor_cobranca_atual: 280,
    dia_vencimento_atual: 10,
    escola_id_atual: a.escola.id,
    escola_nome_atual: a.escola.nome,
    periodo_atual: a.periodo,
    modalidade_atual: "ida_volta",
    responsavel_principal: { nome: a.responsavel.nome, telefone: a.responsavel.telefone, parentesco: "mae" },
    reserva_id: `res-${a.id}`,
    ano_destino: ANO_DESTINO,
    status: e.status?.[a.id] ?? "pendente",
    novo_valor_cobranca: novoValor(e),
    novo_dia_vencimento: 10,
    nova_escola_id: a.escola.id,
    nova_escola_nome: a.escola.nome,
    novo_periodo: a.periodo,
    nova_modalidade: "ida_volta",
    nova_data_inicio_cobranca: e.periodo ? "2027-02-01" : null,
    nova_data_fim_cobranca: e.periodo ? "2027-12-31" : null,
    notificacao_enviada_em: e.notificados?.includes(a.id) ? "2026-12-10T10:20:00" : null,
    token_publico: `ren-${a.id}`,
    contrato_id: null,
    contrato_status: e.status?.[a.id] === "confirmado" && a.id === PEDRO_ID ? "assinado" : null,
  }));
  const conta = (s: string) => passageiros.filter((p) => p.status === s).length;
  const faturamentoAtual = passageiros.length * 280;
  const faturamentoProjetado = passageiros.filter((p) => p.status !== "recusado").reduce((s, p) => s + p.novo_valor_cobranca, 0);
  return {
    periodo_config: e.periodo
      ? { configurado: true, ano: ANO_DESTINO, mes_inicio_cobranca: 2, ano_inicio_cobranca: 2027, mes_fim_cobranca: 12, ano_fim_cobranca: 2027, configurado_em: "2026-12-10" }
      : { configurado: false, ano: ANO_DESTINO, mes_inicio_cobranca: null, ano_inicio_cobranca: null, mes_fim_cobranca: null, ano_fim_cobranca: null },
    kpis: {
      faturamento_atual: faturamentoAtual,
      faturamento_projetado: faturamentoProjetado,
      percentual_crescimento: Number((((faturamentoProjetado - faturamentoAtual) / faturamentoAtual) * 100).toFixed(1)),
      contadores: {
        total_ativos: passageiros.length,
        confirmados: conta("confirmado"),
        pendentes: conta("pendente"),
        nao_notificados: passageiros.filter((p) => p.status === "pendente" && !p.notificacao_enviada_em).length,
        saidas: conta("recusado"),
      },
    },
    passageiros,
  };
}

/** O que a página pública do pai (Pedro) recebe. */
export function publicoPedro(e: EstadoRenovacao) {
  const v = novoValor(e);
  return {
    token_publico: `ren-${PEDRO_ID}`,
    status: e.status?.[PEDRO_ID] ?? "pendente",
    confirmado_em: null,
    recusado_em: null,
    ano_origem: 2026,
    ano_destino: ANO_DESTINO,
    motorista: { id: MOTORISTA.id, nome: MOTORISTA.nome, apelido: MOTORISTA.apelido, telefone: "11988887777", logo_url: null, usar_contratos: true },
    passageiro: { id: PEDRO_ID, nome: NOVO_ALUNO.nome, data_nascimento: "2017-05-14", turma: NOVO_ALUNO.turma, sala: null, nome_professor: null },
    responsavel: {
      nome: NOVO_ALUNO.responsavel,
      telefone: "11991234567",
      parentesco: "mae",
      logradouro: "Rua das Acácias",
      numero: "120",
      bairro: "Jardim Primavera",
      cidade: "São Paulo",
      estado: "SP",
    },
    condicoes: {
      valor: { atual: 280, novo: v, alterado: v !== 280 },
      dia_vencimento: { atual: 10, novo: 10, alterado: false },
      escola: { atual: ESCOLAS.aurora.nome, novo: ESCOLAS.aurora.nome, alterado: false, atual_id: ESCOLAS.aurora.id, novo_id: ESCOLAS.aurora.id },
      periodo: { atual: "manha", novo: "manha", alterado: false },
      modalidade: { atual: "ida_volta", novo: "ida_volta", alterado: false },
      turma: { atual: NOVO_ALUNO.turma, novo: "3º ano", alterado: true },
      data_inicio_transporte: "2027-02-01",
      data_fim_transporte: "2027-12-17",
      data_inicio_cobranca: "2027-02-01",
      data_fim_cobranca: "2027-12-31",
      qtd_parcelas: 11,
    },
    contrato: { id: null, status: null, token_acesso: null, usar_contratos: true },
  };
}

// mesmo estado -> mesmo objeto (os diálogos do app têm efeitos que dependem dessas referências)
const cache = new Map<string, unknown>();
const memo = <T,>(chave: string, criar: () => T): T => {
  if (!cache.has(chave)) cache.set(chave, criar());
  return cache.get(chave) as T;
};
const q = (data: unknown) => ({ data, isLoading: false, isFetching: false, isError: false, error: null, refetch: async () => ({ data }) }) as any;
const mutation = () => ({ mutate: () => {}, mutateAsync: async () => ({}) as any, isPending: false }) as any;
const useEstado = () => ((useVideoState() as any).renovacao ?? {}) as EstadoRenovacao;

const useDados = () => {
  const e = useEstado();
  return memo(`lista:${JSON.stringify(e)}`, () => dadosRenovacao(e));
};
export const useRenovacoesList = () => {
  const d = useDados();
  return memo(`q-lista:${JSON.stringify(useEstado())}`, () => q(d));
};
export const usePeriodoRenovacaoConfig = () => {
  const d = useDados();
  return memo(`q-periodo:${d.periodo_config.configurado}`, () => q(d.periodo_config));
};
export const useRenovacaoContratoConfig = () => memo("q-contrato", () => q({ usar_contratos: true }));
export const usePublicRenovacao = () => {
  const e = useEstado();
  return memo(`q-publico:${JSON.stringify(e)}`, () => q(publicoPedro(e)));
};
export const useReajusteLote = mutation;
export const useUpdateRenovacao = mutation;
export const useAtualizarStatusLoteRenovacao = mutation;
export const useResponderPublicRenovacao = mutation;
export const useAtualizarDadosPublicosRenovacao = mutation;
export const useNotificarPassageiroRenovacao = mutation;
export const useNotificarLoteRenovacao = mutation;
export const useSalvarRenovacaoContratoConfig = mutation;
export const useSalvarPeriodoRenovacaoConfig = mutation;
