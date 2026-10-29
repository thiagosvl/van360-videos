/**
 * Dados fictícios usados em todos os vídeos.
 * Edite aqui para trocar nomes, escolas e valores sem mexer nas cenas.
 */
import type { Passageiro } from "@/types/passageiro";

export const MOTORISTA = {
  id: "mock-user-1",
  nome: "Carlos Almeida",
  apelido: "Tio Carlos",
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
  ["Samuel Freitas", "Débora Freitas"], ["Clara Vieira", "Thiago Vieira"], ["Noah Carvalho", "Elaine Carvalho"],
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
