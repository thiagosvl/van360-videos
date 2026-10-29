// Universo financeiro do vídeo em março/2026 (hoje = 12/03): gastos, veículos, escolas,
// alunos e parcelas consistentes entre si. Telas de Gastos e Relatórios usam os view models
// REAIS do app; só estes hooks de dados são trocados.
import { useVideoState } from "@mocks/videoState";
import { ALUNOS_PARCELAS, ESCOLAS, MARCO_A_RECEBER, MARCO_RECEBIDAS, MOTORISTA, VALOR_PARCELA } from "@mocks/data";

/* ---------- veículos e escolas ---------- */
export const VEICULOS = [
  { id: "v1", usuario_id: MOTORISTA.id, marca: "Mercedes-Benz", modelo: "Sprinter", placa: "ABC1D23", ativo: true },
  { id: "v2", usuario_id: MOTORISTA.id, marca: "Fiat", modelo: "Ducato", placa: "FGH2J34", ativo: true },
];
export const ESCOLAS_LISTA = Object.values(ESCOLAS).map((e) => ({ ...e, ativo: true }));

/* ---------- categorias (as globais do banco: migration add_dynamic_expense_categories) ---------- */
export const CATEGORIAS = [
  ["Combustível", "combustivel", "orange", "Fuel"],
  ["Manutenção", "manutencao", "blue", "Wrench"],
  ["Impostos", "impostos", "red", "FileText"],
  ["Multas", "multas", "red", "ClipboardCheck"],
  ["Lavagem", "lavagem", "cyan", "Cog"],
  ["Alimentação", "alimentacao", "green", "Wallet"],
  ["Seguro", "seguro", "indigo", "ClipboardCheck"],
  ["Outros", "outros", "gray", "HelpCircle"],
].map(([nome, slug, cor, icone], i) => ({ id: `cat${i + 1}`, created_at: "2026-01-01", usuario_id: null, nome, slug, cor, icone }));

/* ---------- gastos de março ---------- */
type G = [dia: number, categoria: string, valor: number, descricao: string, veiculo: string | null, parcela?: [number, number]];
const GASTOS_MARCO: G[] = [
  [2, "combustivel", 420, "Diesel", "v1"],
  [3, "combustivel", 380, "Diesel", "v2"],
  [4, "alimentacao", 38, "Almoço", null],
  [5, "seguro", 310, "Seguro da van", "v1", [3, 12]],
  [6, "lavagem", 60, "Lavagem completa", "v1"],
  [9, "combustivel", 410, "Diesel", "v1"],
  [10, "impostos", 245, "IPVA", "v1", [3, 5]],
  [10, "manutencao", 520, "Troca de óleo e filtros", "v2"],
  [11, "combustivel", 395, "Diesel", "v2"],
  [12, "manutencao", 180, "Pastilhas de freio", "v1"],
];

export const gastosMarco = (extras: any[] = []) =>
  [
    ...GASTOS_MARCO.map(([dia, categoria, valor, descricao, veiculo, parcela], i) => {
      const placa = VEICULOS.find((v) => v.id === veiculo)?.placa;
      return {
        id: `g${i + 1}`,
        created_at: `2026-03-${String(dia).padStart(2, "0")}T12:00:00`,
        usuario_id: MOTORISTA.id,
        descricao,
        valor,
        data: `2026-03-${String(dia).padStart(2, "0")}`,
        categoria,
        veiculo_id: veiculo,
        veiculo: veiculo ? { id: veiculo, placa } : null,
        parcelamento_id: parcela ? `parc-${i}` : null,
        numero_parcela: parcela?.[0] ?? null,
        total_parcelas: parcela?.[1] ?? null,
      };
    }),
    ...extras,
  ].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));

/** O gasto lançado no vídeo de Gastos: pneus em 4x, a 1ª parcela cai hoje (12/03). */
export const NOVO_GASTO = {
  id: "g-novo",
  created_at: "2026-03-12T10:30:00",
  usuario_id: MOTORISTA.id,
  descricao: "Pneus novos",
  valor: 400,
  data: "2026-03-12",
  categoria: "manutencao",
  veiculo_id: "v1",
  veiculo: { id: "v1", placa: "ABC1D23" },
  parcelamento_id: "parc-pneus",
  numero_parcela: 1,
  total_parcelas: 4,
};

/* ---------- alunos e parcelas ---------- */
const PERIODOS = ["manha", "tarde", "manha", "integral"];
const ESC = Object.values(ESCOLAS);
const diaDe = (id: string) => [...MARCO_A_RECEBER, ...MARCO_RECEBIDAS].find((c) => c.passageiro_id === id)!.data_vencimento.slice(8, 10);
export const PASSAGEIROS_TODOS = ALUNOS_PARCELAS.map((a, i) => ({
  id: a.id,
  nome: a.nome,
  ativo: true,
  isento: false,
  periodo: PERIODOS[i % 4],
  escola_id: ESC[i % 3].id,
  escola: ESC[i % 3],
  veiculo_id: i < 14 ? "v1" : "v2",
  valor_cobranca: VALOR_PARCELA,
  dia_vencimento: Number(diaDe(a.id)),
  data_inicio_cobranca: "2026-02-01",
  ano_letivo: 2026,
  responsavel_principal: { nome: a.responsavel, telefone: "11999990000" },
}));

const FORMAS = ["PIX", "PIX", "PIX", "dinheiro", "PIX", "transferencia", "PIX"];
const RECEBIDAS = MARCO_RECEBIDAS.map((c, i) => ({ ...c, tipo_pagamento: FORMAS[i % FORMAS.length], valor_pago: c.valor }));
const COBRANCAS = { all: [...RECEBIDAS, ...MARCO_A_RECEBER], recebidos: RECEBIDAS, areceber: MARCO_A_RECEBER };

/* ---------- resumo (mesmas contas do back-end: usuario-resumo.service) ---------- */
const resumo = (gastos: any[]) => {
  const realizada = RECEBIDAS.reduce((s, c) => s + c.valor, 0);
  const pendente = MARCO_A_RECEBER.reduce((s, c) => s + c.valor, 0);
  const prevista = realizada + pendente;
  const saidas = gastos.reduce((s, g) => s + Number(g.valor), 0);
  const atrasadas = MARCO_A_RECEBER.filter((c) => c.data_vencimento < "2026-03-12");
  return {
    contadores: {
      passageiros: { total: PASSAGEIROS_TODOS.length, ativos: PASSAGEIROS_TODOS.length, inativos: 0, solicitacoes_pendentes: 0 },
      veiculos: { total: 2, ativos: 2, inativos: 0 },
      escolas: { total: 3, ativos: 3, inativos: 0 },
    },
    financeiro: {
      receita: { realizada, prevista, pendente, taxa_recebimento: Math.round((realizada / prevista) * 100) },
      saidas: { total: saidas, margem_operacional: Math.round(((realizada - saidas) / realizada) * 100) },
      atrasos: { valor: atrasadas.reduce((s, c) => s + c.valor, 0), count: atrasadas.length },
      ticket_medio: realizada / new Set(RECEBIDAS.map((c) => c.passageiro_id)).size,
    },
  };
};

/* ---------- hooks ---------- */
const q = (data: unknown) => ({ data, isLoading: false, isFetching: false, isError: false, refetch: async () => ({ data }) }) as any;

/** gastos extras (ex.: o que acabou de ser registrado no vídeo) entram por VideoState.gastos */
const useGastosDoVideo = () => gastosMarco((useVideoState() as any).gastosExtras ?? []);

export const useGastos = (filters?: any) => {
  let list = useGastosDoVideo();
  if (filters?.categoria) list = list.filter((g) => g.categoria === filters.categoria);
  if (filters?.veiculoId) list = list.filter((g) => g.veiculo_id === filters.veiculoId);
  return q({ list, total: list.length });
};
export const useVeiculos = () => q({ list: VEICULOS, total: VEICULOS.length });
export const useEscolas = () => q({ list: ESCOLAS_LISTA, total: ESCOLAS_LISTA.length });
export const useCobrancas = () => q({ ...COBRANCAS, list: COBRANCAS.all, total: COBRANCAS.all.length });
export const useGastoCategorias = () => q(CATEGORIAS);
/** Relatórios pedem por ano letivo; as outras telas continuam como antes (lista vazia). */
export const usePassageiros = (filters?: any) => q({ list: filters && "ano_letivo" in filters ? PASSAGEIROS_TODOS : [] });
/** Só o resumo com mês (Relatórios) traz o financeiro; o resto do app segue sem resumo. */
export const useUsuarioResumo = (_id?: string, params?: { mes?: number }) => {
  const gastos = useGastosDoVideo();
  return q(params?.mes ? resumo(gastos) : undefined);
};
