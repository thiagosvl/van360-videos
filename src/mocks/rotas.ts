// Rotas do vídeo: "Ida Manhã" (casa -> Colégio Aurora) e "Volta Manhã" (Colégio Aurora -> casa).
// Execução montada passo a passo pelo vídeo (quem já embarcou, quem é o atual, quem falta).
import { ESCOLAS, NOVO_ALUNO, PASSAGEIROS, PEDRO_ID } from "@mocks/data";

const ENDERECOS: Record<string, [string, string, string]> = {
  p1: ["Rua das Palmeiras", "245", "Jardim Aurora"],
  p6: ["Rua Bela Vista", "88", "Vila Nova"],
  p4: ["Av. dos Ipês", "1020", "Jardim Primavera"],
  [PEDRO_ID]: ["Rua das Acácias", "120", "Jardim Primavera"],
  p3: ["Rua Sete de Setembro", "310", "Centro"],
};

const aluno = (id: string) => {
  const p: any = id === PEDRO_ID
    ? { id: PEDRO_ID, nome: NOVO_ALUNO.nome, turma: NOVO_ALUNO.turma, escola: ESCOLAS.aurora, escola_id: ESCOLAS.aurora.id, periodo: "manha", responsavel_principal: { nome: NOVO_ALUNO.responsavel, telefone: "11991234567" } }
    : PASSAGEIROS.find((x: any) => x.id === id);
  const [logradouro, numero, bairro] = ENDERECOS[id] ?? ["Rua A", "1", "Centro"];
  const endereco = { logradouro, numero, bairro, cidade: "São Paulo", estado: "SP", cep: "04000-000" };
  // o app lê o endereço do responsável principal (é onde o aluno embarca)
  return { ...p, ativo: true, ...endereco, responsavel_principal: { ...p.responsavel_principal, parentesco: "mae", ...endereco } };
};

const ESCOLA_AURORA = { id: ESCOLAS.aurora.id, nome: ESCOLAS.aurora.nome, logradouro: "Rua das Flores", numero: "500", bairro: "Centro", cidade: "São Paulo" };

/** ordem da Ida: casas e depois a escola */
const IDA = ["p1", "p6", "p4", PEDRO_ID];

const paradaAluno = (id: string, ordem: number, sentido: "indo" | "voltando") => {
  const a = aluno(id);
  return {
    id: `par-${sentido}-${id}`,
    execucao_rota_id: `exec-${sentido}`,
    tipo_no: "passageiro",
    passageiro_id: id,
    escola_id: ESCOLA_AURORA.id,
    nome: a.nome,
    detalhe: `${a.logradouro}, ${a.numero} - ${a.bairro}`,
    temEndereco: true,
    ordem,
    sentido,
    status: "pendente",
    passageiro: a,
  } as any;
};

const paradaEscola = (ordem: number, sentido: "indo" | "voltando") =>
  ({
    id: `par-${sentido}-escola`,
    execucao_rota_id: `exec-${sentido}`,
    tipo_no: "escola",
    escola_id: ESCOLA_AURORA.id,
    nome: ESCOLA_AURORA.nome,
    detalhe: "Rua das Flores, 500 - Centro",
    temEndereco: true,
    ordem,
    sentido,
    status: "pendente",
    escola: ESCOLA_AURORA,
  }) as any;

export const PARADAS_IDA = [...IDA.map((id, i) => paradaAluno(id, i + 1, "indo")), paradaEscola(IDA.length + 1, "indo")];

/**
 * Estado da execução da Ida.
 * @param feitas quantas paradas já foram atendidas (na ordem)
 * @param ausentes ids de alunos que faltaram (avisado pelo pai ou marcado na hora)
 * @param preview rota ainda não iniciada (tela com "Iniciar Rota")
 */
export function execucaoIda({ feitas = 0, ausentes = [] as string[], preview = false }) {
  const ehAusente = (p: any) => !!p.passageiro_id && ausentes.includes(p.passageiro_id);
  // falta avisada pelo pai: ao iniciar, a parada já entra como concluída "ausente"
  const ativas = PARADAS_IDA.filter((p) => preview || !ehAusente(p));
  const avisadas = preview ? [] : PARADAS_IDA.filter(ehAusente).map((p) => ({ ...p, status: "ausente", is_ausente: true, ausencia_id: `aus-${p.passageiro_id}` }));
  const feitasLista = preview ? [] : ativas.slice(0, feitas).map((p, i) => ({ ...p, status: "embarcado", visitado_em: `2026-03-12T06:4${i}:00` }));
  const restantes = preview ? ativas : ativas.slice(feitas);
  const atual = preview ? null : restantes[0] ?? null;
  const proximas = preview ? restantes : restantes.slice(1);
  const concluidas = [...feitasLista, ...avisadas];
  const paradas = [...concluidas, ...restantes].sort((a, b) => a.ordem - b.ordem);
  const execucao = {
    id: preview ? "preview-r1" : "exec-indo",
    rota_id: "r1",
    usuario_id: "mock-user-1",
    status: preview ? "preview" : "iniciada",
    iniciada_em: "2026-03-12T06:35:00",
    created_at: "2026-03-12T06:35:00",
    paradas,
    rota: { id: "r1", nome: "Ida Manhã", veiculo_id: "v1", veiculo: { id: "v1", marca: "Mercedes-Benz", modelo: "Sprinter", placa: "ABC1D23" } },
  } as any;
  const total = PARADAS_IDA.length;
  return {
    execucao,
    paradaAtual: atual,
    proximasParadas: proximas,
    paradasConcluidas: concluidas,
    concludedStops: concluidas.length,
    totalStops: total,
    progressPercentage: Math.round((concluidas.length / total) * 100),
  };
}

/** Chamada de embarque na porta da escola (volta): os alunos do Colégio Aurora. */
export const ESCOLAS_CHAMADA = [
  {
    escolaId: ESCOLA_AURORA.id,
    escolaNome: ESCOLA_AURORA.nome,
    alunos: IDA.map((id) => {
      const a = aluno(id);
      return { id: `par-voltando-${id}`, passageiroId: id, nome: a.nome, turma: a.turma };
    }),
  },
];
