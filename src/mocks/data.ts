/**
 * Dados fictícios usados em todos os vídeos.
 * Edite aqui para trocar nomes, escolas e valores sem mexer nas cenas.
 */
import type { Passageiro } from "@/types/passageiro";

export const MOTORISTA = {
  id: "mock-user-1",
  nome: "Thiago Almeida",
  apelido: "Tio Thiago",
};

export const ESCOLAS = {
  aurora: { id: "e1", nome: "Colégio Aurora" },
  saoBento: { id: "e2", nome: "E.E. São Bento" },
  pequenoPrincipe: { id: "e3", nome: "Escola Pequeno Príncipe" },
};

type MockAluno = {
  nome: string;
  responsavel: string;
  telefone: string;
  escola: { id: string; nome: string };
  periodo: string;
  turma?: string;
  sala?: string;
};

const ALUNOS: MockAluno[] = [
  { nome: "Ana Beatriz Souza", responsavel: "Juliana Souza", telefone: "11987654321", escola: ESCOLAS.aurora, periodo: "manha", turma: "3º ano" },
  { nome: "Lucas Ferreira", responsavel: "Marcos Ferreira", telefone: "11976543210", escola: ESCOLAS.saoBento, periodo: "tarde", turma: "5º ano" },
  { nome: "Helena Martins", responsavel: "Patrícia Martins", telefone: "11965432109", escola: ESCOLAS.pequenoPrincipe, periodo: "manha", turma: "Infantil II" },
  { nome: "Miguel Oliveira", responsavel: "Renata Oliveira", telefone: "11954321098", escola: ESCOLAS.aurora, periodo: "integral", turma: "1º ano" },
  { nome: "Sofia Lima", responsavel: "Fernanda Lima", telefone: "11943210987", escola: ESCOLAS.saoBento, periodo: "tarde", turma: "7º ano" },
  { nome: "Davi Santos", responsavel: "Rodrigo Santos", telefone: "11932109876", escola: ESCOLAS.aurora, periodo: "manha", turma: "4º ano" },
  { nome: "Laura Costa", responsavel: "Camila Costa", telefone: "11921098765", escola: ESCOLAS.pequenoPrincipe, periodo: "manha", turma: "Infantil III" },
  { nome: "Arthur Rocha", responsavel: "Daniela Rocha", telefone: "11910987654", escola: ESCOLAS.saoBento, periodo: "tarde", turma: "6º ano" },
];

export const PASSAGEIROS = ALUNOS.map(
  (a, i) =>
    ({
      id: `p${i + 1}`,
      nome: a.nome,
      ativo: true,
      periodo: a.periodo,
      turma: a.turma,
      sala: a.sala,
      escola: a.escola,
      escola_id: a.escola.id,
      valor_cobranca: 280,
      dia_vencimento: 10,
      responsavel_principal: { nome: a.responsavel, telefone: a.telefone },
    }) as unknown as Passageiro,
);

export const FINANCEIRO_MES = {
  totalEsperado: 6720,
  recebido: 5320,
  pendente: 1400,
  atrasado: 280,
};

export const LEMBRETE_WHATSAPP = {
  responsavel: "Juliana",
  aluno: "Ana Beatriz",
  valor: "R$ 280,00",
  hora: "07:30",
};

/* ---------- Solicitações (cadastro feito pelo pai) ---------- */

export const NOVO_ALUNO = {
  nome: "Pedro Henrique Alves",
  dataNascimento: "14/05/2017",
  turma: "2º ano",
  responsavel: "Carla Alves",
  telefone: "(11) 99123-4567",
  escola: ESCOLAS.aurora,
  periodo: "manha",
  valor: "280,00",
  vencimento: "10",
};

export const PRE_PASSAGEIRO = {
  id: "pre1",
  usuario_id: MOTORISTA.id,
  created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  nome: NOVO_ALUNO.nome,
  nome_responsavel: NOVO_ALUNO.responsavel,
  parentesco_responsavel: "mae",
  cpf_responsavel: "",
  telefone_responsavel: "11991234567",
  periodo: NOVO_ALUNO.periodo,
  turma: NOVO_ALUNO.turma,
  escola_id: NOVO_ALUNO.escola.id,
  veiculo_id: null,
  logradouro: null, numero: null, bairro: null, cidade: null, estado: null, cep: null,
  referencia: null, observacoes: null,
} as any;

export const CARTEIRINHA_NOVO_ALUNO = {
  id: "p-novo",
  nome: NOVO_ALUNO.nome,
  escola_nome: NOVO_ALUNO.escola.nome,
  turma: NOVO_ALUNO.turma,
  periodo: NOVO_ALUNO.periodo,
  ativo: true,
} as any;

/** Domínio mostrado no link de cadastro (no app vem de VITE_PUBLIC_APP_DOMAIN). */
export const LINK_DOMINIO = "https://app.van360.com.br";

/* ---------- Parcelas (relógio do vídeo: 12/03/2026, ver src/clock.ts) ---------- */

const MAIS_ALUNOS: Array<[string, string]> = [
  ["Gabriel Nunes", "Aline Nunes"], ["Valentina Prado", "Rafael Prado"], ["Enzo Barros", "Tatiane Barros"],
  ["Alice Moura", "Bruno Moura"], ["Heitor Campos", "Simone Campos"], ["Manuela Dias", "André Dias"],
  ["Bernardo Teixeira", "Luciana Teixeira"], ["Lorena Pires", "Vinícius Pires"], ["Theo Cardoso", "Mariana Cardoso"],
  ["Cecília Ramos", "Fábio Ramos"], ["Gael Monteiro", "Priscila Monteiro"], ["Isis Andrade", "Leandro Andrade"],
  ["Samuel Freitas", "Débora Freitas"], ["Clara Vieira", "Paulo Vieira"], ["Noah Carvalho", "Elaine Carvalho"],
  ["Lívia Rezende", "Gustavo Rezende"],
];

/** 24 alunos: os 8 da lista + 16 extras (só aparecem em Parcelas). */
export const ALUNOS_PARCELAS = [
  ...PASSAGEIROS.map((p) => ({ id: p.id, nome: p.nome, responsavel: p.responsavel_principal?.nome ?? "" })),
  ...MAIS_ALUNOS.map(([nome, responsavel], i) => ({ id: `x${i + 1}`, nome, responsavel })),
];

export const VALOR_PARCELA = 280;

type Parcela = { alunoId: string; dia: number; pago: boolean; diaPagamento?: number };

const cobranca = (mes: number, p: Parcela) => {
  const a = ALUNOS_PARCELAS.find((x) => x.id === p.alunoId)!;
  const mm = String(mes).padStart(2, "0");
  return {
    id: `c-${mes}-${p.alunoId}`,
    passageiro_id: p.alunoId,
    mes,
    ano: 2026,
    valor: VALOR_PARCELA,
    status: p.pago ? "pago" : "pendente",
    data_vencimento: `2026-${mm}-${String(p.dia).padStart(2, "0")}`,
    data_pagamento: p.pago ? `2026-${mm}-${String(p.diaPagamento ?? p.dia).padStart(2, "0")}T10:00:00` : undefined,
    passageiro: {
      id: p.alunoId,
      nome: a.nome,
      valor_cobranca: VALOR_PARCELA,
      responsavel_principal: { nome: a.responsavel, telefone: "11999990000" },
    },
  } as any;
};

const diaVenc = (i: number) => [5, 10, 15, 20][i % 4];

/** Março: 2 atrasados (5 e 10), 3 a vencer, 19 pagos. */
export const MARCO_A_RECEBER = [
  { alunoId: "p2", dia: 5, pago: false },
  { alunoId: "p5", dia: 10, pago: false },
  { alunoId: "p3", dia: 15, pago: false },
  { alunoId: "p6", dia: 15, pago: false },
  { alunoId: "p8", dia: 20, pago: false },
].map((p) => cobranca(3, p));

const PENDENTES_MARCO = new Set(["p2", "p5", "p3", "p6", "p8"]);
export const MARCO_RECEBIDAS = ALUNOS_PARCELAS.filter((a) => !PENDENTES_MARCO.has(a.id)).map((a, i) =>
  cobranca(3, { alunoId: a.id, dia: diaVenc(i), pago: true }),
);

/** Fevereiro: tudo pago, menos 1. */
export const FEV_A_RECEBER = [cobranca(2, { alunoId: "p2", dia: 5, pago: false })];
export const FEV_RECEBIDAS = ALUNOS_PARCELAS.filter((a) => a.id !== "p2").map((a, i) =>
  cobranca(2, { alunoId: a.id, dia: diaVenc(i), pago: true }),
);

/** O aluno que tem o pagamento registrado no vídeo. */
export const ALUNO_PAGAMENTO = "p6"; // Davi Santos

export const totaisParcelas = (aReceber: any[], recebidas: any[]) => {
  const soma = (l: any[]) => l.reduce((s, c) => s + Number(c.valor), 0);
  const hoje = "2026-03-12";
  const atrasado = soma(aReceber.filter((c) => c.data_vencimento < hoje && c.mes === 3) )
    + soma(aReceber.filter((c) => c.mes < 3));
  return {
    totalPrevisto: soma(aReceber) + soma(recebidas),
    totalRecebido: soma(recebidas),
    totalAReceber: soma(aReceber),
    totalAtrasado: atrasado,
  };
};

/* ---------- Carteirinha (Ana Beatriz, visão do motorista) ---------- */

export const VEICULO = { id: "v1", modelo: "Sprinter", placa: "ABC1D23" };

export const ANA_ID = "p1";

const parcelaAna = (ano: number, mes: number, pago: boolean, diaPagamento = 8) => {
  const mm = String(mes).padStart(2, "0");
  return {
    id: `ana-${ano}-${mm}`,
    passageiro_id: ANA_ID,
    mes,
    ano,
    valor: VALOR_PARCELA,
    status: pago ? "pago" : "pendente",
    tipo_pagamento: pago ? "PIX" : undefined,
    data_vencimento: `${ano}-${mm}-10`,
    data_pagamento: pago ? `${ano}-${mm}-${String(diaPagamento).padStart(2, "0")}T10:00:00` : undefined,
    recibo_url: pago && ano === 2026 && mes === 3 ? "RECIBO_ANA_MARCO" : undefined,
    passageiro: { id: ANA_ID, nome: "Ana Beatriz Souza", responsavel_principal: { nome: "Juliana Souza", telefone: "11987654321" } },
  } as any;
};

/** 2025: fevereiro a dezembro, tudo pago (recibo anual liberado). */
export const ANA_PARCELAS_2025 = Array.from({ length: 11 }, (_, i) => parcelaAna(2025, i + 2, true));
/** 2026: jan a mar pagos, abr a dez a vencer (hoje = 12/03/2026). */
export const ANA_PARCELAS_2026 = Array.from({ length: 12 }, (_, i) => parcelaAna(2026, i + 1, i < 3));

export const ANA_CARTEIRINHA = {
  id: ANA_ID,
  usuario_id: MOTORISTA.id,
  nome: "Ana Beatriz Souza",
  genero: "feminino",
  data_nascimento: "2017-08-21",
  ativo: true,
  isento: false,
  ano_letivo: 2026,
  anos_matriculados: [2025, 2026],
  periodo: "manha",
  modalidade: "ida_volta",
  turma: "3º ano",
  sala: "B",
  horario_entrada: "07:00",
  horario_saida: "12:00",
  escola: ESCOLAS.aurora,
  escola_id: ESCOLAS.aurora.id,
  escola_nome: ESCOLAS.aurora.nome,
  veiculo: VEICULO,
  veiculo_id: VEICULO.id,
  valor_cobranca: VALOR_PARCELA,
  dia_vencimento: 10,
  data_inicio_cobranca: "2025-02-01",
  data_fim_cobranca: "2026-12-31",
  data_inicio_transporte: "2025-02-01",
  enviar_notificacoes: true,
  logradouro: "Rua das Palmeiras",
  numero: "120",
  bairro: "Jardim Aurora",
  cidade: "São Paulo",
  estado: "SP",
  cep: "04500-000",
  created_at: "2025-01-20T10:00:00",
  responsavel_principal: { id: "r1", nome: "Juliana Souza", telefone: "11987654321", parentesco: "mae", tipo: "principal" },
  responsaveis: [
    { id: "r1", responsavel_id: "r1", nome: "Juliana Souza", telefone: "11987654321", parentesco: "mae", tipo: "principal" },
    { id: "r2", responsavel_id: "r2", nome: "Ricardo Souza", telefone: "11976541234", parentesco: "pai", tipo: "adicional" },
  ],
  contrato_id: "ct1",
  status_contrato: "assinado",
  contrato_status: "assinado",
  contrato_provider: "van360",
  contrato_ano: 2026,
  contrato_final_url: "https://mock.local/contrato.pdf",
  contrato_url: "https://mock.local/contrato.pdf",
} as any;

/* ---------- Carteirinha do aluno recém-aprovado (vídeo de Solicitações) ---------- */

export const PEDRO_ID = "p-novo";

/** Aprovado hoje: parcelas de abril a dezembro já geradas, sem contrato ainda. */
export const PEDRO_PARCELAS_2026 = Array.from({ length: 9 }, (_, i) => {
  const mes = i + 4;
  const mm = String(mes).padStart(2, "0");
  return {
    id: `pedro-2026-${mm}`,
    passageiro_id: PEDRO_ID,
    mes,
    ano: 2026,
    valor: VALOR_PARCELA,
    status: "pendente",
    data_vencimento: `2026-${mm}-10`,
    passageiro: { id: PEDRO_ID, nome: NOVO_ALUNO.nome, responsavel_principal: { nome: NOVO_ALUNO.responsavel, telefone: "11991234567" } },
  } as any;
});

export const PEDRO_CARTEIRINHA = {
  ...ANA_CARTEIRINHA,
  id: PEDRO_ID,
  nome: NOVO_ALUNO.nome,
  genero: "masculino",
  data_nascimento: "2017-05-14",
  anos_matriculados: [2026],
  turma: NOVO_ALUNO.turma,
  sala: null,
  data_inicio_cobranca: "2026-04-01",
  data_fim_cobranca: "2026-12-31",
  data_inicio_transporte: "2026-03-12",
  created_at: "2026-03-12T09:58:00",
  responsavel_principal: { id: "r9", nome: NOVO_ALUNO.responsavel, telefone: "11991234567", parentesco: "mae", tipo: "principal" },
  responsaveis: [{ id: "r9", responsavel_id: "r9", nome: NOVO_ALUNO.responsavel, telefone: "11991234567", parentesco: "mae", tipo: "principal" }],
  contrato_id: undefined,
  status_contrato: undefined,
  contrato_status: "sem_contrato",
  contrato_provider: undefined,
  contrato_ano: 2026,
  contrato_final_url: undefined,
  contrato_url: undefined,
} as any;

/* ---------- Contratos (Pedro: sem contrato -> pendente -> assinado) ---------- */

/** Passageiro "sem contrato" como a lista de Contratos devolve (tipo: "passageiro"). */
const semContrato = (id: string, nome: string, responsavel: string, telefone: string) =>
  ({
    id,
    tipo: "passageiro",
    nome,
    status: null,
    valor_cobranca: VALOR_PARCELA,
    dia_vencimento: 10,
    responsavel_principal: { nome: responsavel, telefone, cpf: "52998224725", parentesco: "mae" },
  }) as any;

const comContrato = (id: string, nome: string, responsavel: string, status: "pendente" | "assinado") =>
  ({
    id: `ct-${id}`,
    tipo: "contrato",
    passageiro_id: id,
    status,
    nome,
    valor_parcela: VALOR_PARCELA,
    provider: "inhouse",
    token_acesso: `tk-${id}`,
    minuta_url: "pedro-minuta",
    contrato_final_url: status === "assinado" ? "pedro-assinado" : null,
    created_at: "2026-02-02T10:00:00",
    assinado_em: status === "assinado" ? "2026-02-03T19:20:00" : null,
    passageiro: { id, nome, responsavel_principal: { nome: responsavel, telefone: "11999990000" } },
  }) as any;

export const PEDRO_SEM_CONTRATO = semContrato(PEDRO_ID, NOVO_ALUNO.nome, NOVO_ALUNO.responsavel, "11991234567");

/** etapa 0: antes de gerar | 1: gerado (pendente) | 2: assinado pela mãe */
export const listaContratos = (etapa: number) => {
  const pedro =
    etapa === 0 ? null : { ...comContrato(PEDRO_ID, NOVO_ALUNO.nome, NOVO_ALUNO.responsavel, etapa === 1 ? "pendente" : "assinado"), created_at: "2026-03-12T10:02:00" };
  const sem = [
    ...(etapa === 0 ? [PEDRO_SEM_CONTRATO] : []),
    semContrato("p8", "Arthur Rocha", "Daniela Rocha", "11910987654"),
    semContrato("p7", "Laura Costa", "Camila Costa", "11921098765"),
  ];
  const pendentes = [
    ...(pedro && etapa === 1 ? [pedro] : []),
    comContrato("p5", "Sofia Lima", "Fernanda Lima", "pendente"),
    comContrato("p4", "Miguel Oliveira", "Renata Oliveira", "pendente"),
  ];
  const assinados = [
    ...(pedro && etapa === 2 ? [pedro] : []),
    comContrato("p1", "Ana Beatriz Souza", "Juliana Souza", "assinado"),
    comContrato("p2", "Lucas Ferreira", "Marcos Ferreira", "assinado"),
    comContrato("p3", "Helena Martins", "Patrícia Martins", "assinado"),
    comContrato("p6", "Davi Santos", "Rodrigo Santos", "assinado"),
  ];
  return { sem_contrato: sem, pendentes, assinados };
};

/** O contrato do Pedro como a página pública de assinatura recebe. */
export const contratoPublicoPedro = (assinado: boolean, base = "pedro", anoLetivo = 2026) =>
  ({
    id: `ct-${PEDRO_ID}`,
    status: assinado ? "assinado" : "pendente",
    minuta_url: `${base}-minuta`,
    contrato_final_url: assinado ? `${base}-assinado` : null,
    usuario: { apelido: MOTORISTA.apelido, nome: MOTORISTA.nome },
    dados_contrato: { nomePassageiro: NOVO_ALUNO.nome, nomeResponsavel: NOVO_ALUNO.responsavel, anoLetivo },
  }) as any;

/* ---------- Renovação: Pedro confirmado para 2027 (reajuste de 10%) ---------- */
export const PEDRO_PARCELAS_2027 = Array.from({ length: 11 }, (_, i) => {
  const mes = i + 2;
  const mm = String(mes).padStart(2, "0");
  return {
    id: `pedro-2027-${mm}`,
    passageiro_id: PEDRO_ID,
    mes,
    ano: 2027,
    valor: 308,
    status: "pendente",
    data_vencimento: `2027-${mm}-10`,
    passageiro: { id: PEDRO_ID, nome: NOVO_ALUNO.nome, responsavel_principal: { nome: NOVO_ALUNO.responsavel, telefone: "11991234567" } },
  } as any;
});

export const PEDRO_CARTEIRINHA_2027 = {
  ...PEDRO_CARTEIRINHA,
  anos_matriculados: [2026, 2027],
  valor_cobranca: 308,
  turma: "3º ano",
  data_inicio_cobranca: "2027-02-01",
  data_fim_cobranca: "2027-12-31",
  contrato_status: "assinado",
  status_contrato: "assinado",
  contrato_ano: 2027,
} as any;
