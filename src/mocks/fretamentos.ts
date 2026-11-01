// Fretamentos e Passeios com dados do vídeo (src/tutoriais/TutorialFretamentos.tsx).
// A etapa (VideoState.fretamentos.etapa) conta a história:
// 0 lista inicial | 1 passeio do Zooparque criado | 2 inscrições chegando (11)
// 3 o Pedro confirmou pelo link (12) | 4 pagamento do Pedro registrado | 5 frete do casamento lançado
import { useVideoState } from "@mocks/videoState";
import { MOTORISTA, VEICULO } from "@mocks/data";

export * from "@/hooks/api/useFretamentosApi.ts?original";

const U = MOTORISTA.id;
const base = { usuario_id: U, created_at: "2026-03-01T10:00:00", updated_at: "2026-03-10T10:00:00" };
const vans = [{ id: "fv1", veiculo_id: VEICULO.id, placa: VEICULO.placa, modelo: VEICULO.modelo, vagas_capacidade: 20 }];

type P = { nome: string; resp: string; tel: string; status: "pago" | "parcial" | "pendente"; pago?: number; vinculado?: boolean };
/** Inscritos do Zooparque (11 antes do Pedro); pagamentos misturados, como na vida real */
const INSCRITOS_ZOO: P[] = [
  { nome: "Ana Beatriz Souza", resp: "Juliana Souza", tel: "11987654321", status: "pago", vinculado: true },
  { nome: "Lucas Ferreira", resp: "Marcos Ferreira", tel: "11976543210", status: "pago", vinculado: true },
  { nome: "Helena Martins", resp: "Patrícia Martins", tel: "11965432109", status: "parcial", pago: 30, vinculado: true },
  { nome: "Miguel Oliveira", resp: "Renata Oliveira", tel: "11954321098", status: "pago", vinculado: true },
  { nome: "Sofia Lima", resp: "Fernanda Lima", tel: "11943210987", status: "pendente", vinculado: true },
  { nome: "Davi Santos", resp: "Rodrigo Santos", tel: "11932109876", status: "pago", vinculado: true },
  { nome: "Laura Costa", resp: "Camila Costa", tel: "11921098765", status: "pago", vinculado: true },
  { nome: "Arthur Rocha", resp: "Daniela Rocha", tel: "11910987654", status: "pendente", vinculado: true },
  { nome: "Manuela Ribeiro", resp: "Tatiane Ribeiro", tel: "11998127745", status: "pago" },
  { nome: "Gael Mendes", resp: "Rafael Mendes", tel: "11991804432", status: "parcial", pago: 30 },
  { nome: "Isabela Nunes", resp: "Priscila Nunes", tel: "11994561270", status: "pago" },
];
export const PEDRO = { nome: "Pedro Henrique Alves", resp: "Carla Alves", tel: "11996314580" };
const VALOR_ZOO = 60;

const participante = (p: P, i: number, fretamento_id: string, valor: number) => ({
  id: `${fretamento_id}-p${i}`,
  fretamento_id,
  nome: p.nome,
  responsavel_nome: p.resp,
  telefone: p.tel,
  endereco: null,
  observacoes: null,
  is_proprio_responsavel: false,
  passageiro_id: p.vinculado ? `pass-${i}` : null,
  status_pagamento: p.status,
  valor,
  valor_pago: p.status === "pago" ? valor : (p.pago ?? 0),
  tipo_pagamento: p.status === "pendente" ? null : "pix",
  data_pagamento: p.status === "pendente" ? null : "2026-03-10",
  created_at: `2026-03-${String(5 + i).padStart(2, "0")}T19:${String(10 + i).padStart(2, "0")}:00`,
  updated_at: "2026-03-10T10:00:00",
});

const zooparque = (etapa: number) => {
  const lista: P[] = etapa >= 2 ? [...INSCRITOS_ZOO] : [];
  if (etapa >= 3) lista.unshift({ nome: PEDRO.nome, resp: PEDRO.resp, tel: PEDRO.tel, status: etapa >= 4 ? "pago" : "pendente" });
  const participantes = lista.map((p, i) => participante(p, i, "zoo", VALOR_ZOO));
  const total_pago = participantes.reduce((t, p) => t + p.valor_pago, 0);
  const valor_total = VALOR_ZOO * participantes.length;
  return {
    ...base,
    id: "zoo",
    tipo: "passeio" as const,
    titulo: "Excursão Zooparque",
    origem: "Portão do Colégio Aurora",
    destino: "Zooparque Itatiba",
    data_inicio: "2026-03-28T07:00:00",
    data_fim: "2026-03-28T17:30:00",
    valor_por_pessoa: VALOR_ZOO,
    vagas_totais: 18,
    vagas_ocupadas: participantes.length,
    valor_total,
    total_pago,
    saldo_restante: valor_total - total_pago,
    chave_pix: "tiothiago.van@gmail.com",
    slug_publico: "zooparque-aurora",
    observacoes: "Levar lanche, garrafinha de água e boné. Saída pontual às 7h.",
    contratante_nome: null,
    contratante_telefone: null,
    status: "confirmado" as const,
    status_pagamento: total_pago >= valor_total && valor_total > 0 ? ("quitado" as const) : total_pago > 0 ? ("pago_parcial" as const) : ("pendente" as const),
    veiculos: vans,
    pagamentos: [],
    participantes,
  };
};

const SABINA_PAGOS = 17;
const sabina = () => {
  const lista: P[] = Array.from({ length: 20 }, (_, i) => ({
    nome: `Aluno ${i + 1}`,
    resp: "Responsável",
    tel: "11900000000",
    status: i < SABINA_PAGOS ? "pago" : "pendente",
  }));
  const participantes = lista.map((p, i) => participante(p, i, "sabina", 45));
  const total_pago = participantes.reduce((t, p) => t + p.valor_pago, 0);
  return {
    ...base,
    id: "sabina",
    tipo: "passeio" as const,
    titulo: "Passeio Sabina Escola Parque",
    origem: "E.E. São Bento",
    destino: "Sabina, Santo André",
    data_inicio: "2026-03-14T08:00:00",
    data_fim: "2026-03-14T15:00:00",
    valor_por_pessoa: 45,
    vagas_totais: 20,
    vagas_ocupadas: 20,
    valor_total: 900,
    total_pago,
    saldo_restante: 900 - total_pago,
    chave_pix: "tiothiago.van@gmail.com",
    slug_publico: "sabina-sao-bento",
    observacoes: null,
    contratante_nome: null,
    contratante_telefone: null,
    status: "confirmado" as const,
    status_pagamento: "pago_parcial" as const,
    veiculos: vans,
    pagamentos: [],
    participantes,
  };
};

const frete = (o: {
  id: string; titulo: string; origem: string; destino: string; inicio: string; fim: string;
  valor: number; pago: number; contratante: string; tel: string; status?: "confirmado" | "concluido"; obs?: string;
}) => ({
  ...base,
  id: o.id,
  tipo: "fretamento" as const,
  titulo: o.titulo,
  origem: o.origem,
  destino: o.destino,
  data_inicio: o.inicio,
  data_fim: o.fim,
  valor_por_pessoa: null,
  vagas_totais: null,
  vagas_ocupadas: 0,
  valor_total: o.valor,
  total_pago: o.pago,
  saldo_restante: o.valor - o.pago,
  chave_pix: null,
  slug_publico: null,
  observacoes: o.obs ?? null,
  contratante_nome: o.contratante,
  contratante_telefone: o.tel,
  status: o.status ?? ("confirmado" as const),
  status_pagamento: o.pago >= o.valor ? ("quitado" as const) : o.pago > 0 ? ("pago_parcial" as const) : ("pendente" as const),
  veiculos: vans,
  pagamentos: o.pago
    ? [{ id: `${o.id}-pg1`, fretamento_id: o.id, valor: o.pago, tipo_pagamento: "pix", data_pagamento: "2026-03-05", descricao: o.pago >= o.valor ? "Pagamento total" : "Sinal", created_at: "2026-03-05T10:00:00" }]
    : [],
  participantes: [],
});

const formatura = () =>
  frete({ id: "formatura", titulo: "Formatura 9º ano", origem: "Colégio Aurora", destino: "Buffet Villa Lobos", inicio: "2026-03-21T18:30:00", fim: "2026-03-22T01:00:00", valor: 1800, pago: 600, contratante: "Comissão de Formatura", tel: "11987001122" });
const hopi = () =>
  frete({ id: "hopi", titulo: "Aniversário no Hopi Hari", origem: "Vila Mariana", destino: "Hopi Hari, Vinhedo", inicio: "2026-03-07T08:00:00", fim: "2026-03-07T19:00:00", valor: 950, pago: 950, contratante: "Simone Prado", tel: "11972220415", status: "concluido" });
export const casamento = () =>
  frete({ id: "casamento", titulo: "Casamento em Campinas", origem: "Igreja Matriz, Jundiaí", destino: "Espaço Villa Toscana, Campinas", inicio: "2026-03-29T15:00:00", fim: "2026-03-30T00:30:00", valor: 1200, pago: 400, contratante: "Beatriz e Rafael", tel: "11984417730", obs: "Duas viagens: igreja até a festa e volta às 0h30." });

export const listaFretamentos = (etapa: number) => {
  const itens: any[] = [];
  if (etapa >= 5) itens.push(casamento());
  if (etapa >= 1) itens.push(zooparque(etapa));
  itens.push(formatura(), sabina(), hopi());
  return itens;
};

const resumo = (itens: any[]) => {
  const total_faturado_previsto = itens.reduce((t, i) => t + Number(i.valor_total), 0);
  const total_recebido = itens.reduce((t, i) => t + Number(i.total_pago), 0);
  return {
    mes: 3,
    ano: 2026,
    total_faturado_previsto,
    total_recebido,
    total_a_receber: total_faturado_previsto - total_recebido,
    quantidade_fretamentos: itens.filter((i) => i.tipo === "fretamento").length,
    quantidade_passeios: itens.filter((i) => i.tipo === "passeio").length,
  };
};

// mesmo estado -> mesmo objeto (efeitos do app dependem das referências)
const cache = new Map<string, unknown>();
const memo = <T,>(chave: string, criar: () => T): T => {
  if (!cache.has(chave)) cache.set(chave, criar());
  return cache.get(chave) as T;
};
const q = (data: unknown) => ({ data, isLoading: false, isFetching: false, isError: false, error: null, refetch: async () => ({ data }) }) as any;
const mutation = () => ({ mutate: () => {}, mutateAsync: async () => ({}) as any, isPending: false, isSuccess: false }) as any;
const useEtapa = () => ((useVideoState() as any).fretamentos?.etapa ?? 0) as number;

export const useFretamentosListQuery = () => {
  const e = useEtapa();
  return memo(`lista:${e}`, () => q(listaFretamentos(e)));
};
export const useFretamentoResumoQuery = () => {
  const e = useEtapa();
  return memo(`resumo:${e}`, () => q(resumo(listaFretamentos(e))));
};
export const useFretamentoDetalhesQuery = (id: string) => {
  const e = useEtapa();
  return memo(`det:${id}:${e}`, () => q(listaFretamentos(e).find((i) => i.id === id) ?? zooparque(e)));
};
export const usePasseioPublicoQuery = () => {
  const e = useEtapa();
  return memo(`pub:${e}`, () => {
    const z = zooparque(e);
    return q({
      id: z.id,
      titulo: z.titulo,
      origem: z.origem,
      destino: z.destino,
      data_inicio: z.data_inicio,
      data_fim: z.data_fim,
      valor_por_pessoa: z.valor_por_pessoa,
      vagas_totais: z.vagas_totais,
      vagas_ocupadas: z.vagas_ocupadas,
      vagas_disponiveis: z.vagas_totais - z.vagas_ocupadas,
      chave_pix: z.chave_pix,
      observacoes: z.observacoes,
      motorista_nome: MOTORISTA.apelido,
      motorista_telefone: "11951186951",
    });
  });
};
export const useCriarFretamentoMutation = mutation;
export const useAtualizarFretamentoMutation = mutation;
export const useDeletarFretamentoMutation = mutation;
export const useRegistrarPagamentoFretamentoMutation = mutation;
export const useAtualizarPagamentoFretamentoMutation = mutation;
export const useDeletarPagamentoFretamentoMutation = mutation;
export const useAdicionarParticipanteMutation = mutation;
export const useAtualizarStatusParticipanteMutation = mutation;
export const useRemoverParticipanteMutation = mutation;
export const useInscreverPublicoMutation = mutation;
