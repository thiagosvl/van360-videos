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
