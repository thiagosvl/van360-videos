// Lado do responsável (pai/mãe): login por telefone + senha de 4 dígitos e a carteirinha do filho.
// O vídeo controla tudo por VideoState.responsavel (passo do login e ausências registradas).
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useVideoState } from "@mocks/videoState";
import { ANA_ID, ANA_CARTEIRINHA, ANA_PARCELAS_2025, ANA_PARCELAS_2026, MOTORISTA, VEICULO } from "@mocks/data";

export type EstadoResponsavel = {
  /** login: "phone" (digitando o telefone) ou "pin" (primeiro acesso, criando a senha) */
  step?: "phone" | "pin";
  telefone?: string;
  pin?: string;
  /** ausências já registradas pelo pai (datas yyyy-mm-dd) */
  ausencias?: string[];
};
const useEstado = () => (((useVideoState() as any).responsavel ?? {}) as EstadoResponsavel);

export const PASSAGEIRO_RESP = { id: ANA_ID, nome: "Ana Beatriz Souza", motorista_nome: MOTORISTA.apelido };

const cache = new Map<string, unknown>();
const memo = <T,>(k: string, f: () => T): T => {
  if (!cache.has(k)) cache.set(k, f());
  return cache.get(k) as T;
};
const q = (data: unknown) => ({ data, isLoading: false, isFetching: false, isError: false, error: null, refetch: async () => ({ data }) }) as any;
const mutation = () => ({ mutate: () => {}, mutateAsync: async () => ({}) as any, isPending: false }) as any;

const cobranca = (c: any) => ({
  id: c.id,
  mes: c.mes,
  ano: c.ano,
  ano_letivo: c.ano,
  valor: c.valor,
  valor_pago: c.status === "pago" ? c.valor : null,
  tipo_pagamento: c.tipo_pagamento ?? null,
  status: c.status,
  data_vencimento: c.data_vencimento,
  recibo_url: c.status === "pago" ? (c.ano === 2026 ? "/recibos/recibo-ana-marco.png" : "/recibos/recibo-ana-marco.png") : null,
});

const JULIANA = { id: "r1", nome: "Juliana Souza", telefone: "11987654321", parentesco: "mae", tipo: "principal", cpf: "52998224725", email: "juliana.souza@gmail.com", cep: "04500-000", logradouro: "Rua das Palmeiras", numero: "120", bairro: "Jardim Aurora", cidade: "São Paulo", estado: "SP" };

export const carteirinhaResponsavel = (ausencias: string[]) => ({
  ...ANA_CARTEIRINHA,
  motorista_nome: MOTORISTA.apelido,
  motorista_telefone: "11951186951",
  veiculo_placa: VEICULO.placa,
  veiculo_modelo: VEICULO.modelo,
  matriculas: [2025, 2026].map((ano) => ({
    id: `m${ano}`,
    ano_letivo: ano,
    ativo: true,
    escola_nome: ANA_CARTEIRINHA.escola_nome,
    veiculo_placa: VEICULO.placa,
    veiculo_modelo: VEICULO.modelo,
    periodo: "manha",
    modalidade: "ida_volta",
    turma: "3º ano",
    sala: "B",
    horario_entrada: "07:00",
    horario_saida: "12:00",
    valor_cobranca: ANA_CARTEIRINHA.valor_cobranca,
    dia_vencimento: 10,
    contrato: { id: `c${ano}`, ano, status: "assinado", contrato_final_url: "/contratos/ana", pdf_url: "/contratos/ana", created_at: `${ano}-01-20T10:00:00` },
  })),
  cobrancas: [...ANA_PARCELAS_2025, ...ANA_PARCELAS_2026].map(cobranca),
  ausencias: ausencias.map((d, i) => ({ id: `aus${i}`, data_ausencia: d, rota_id: "r1", sentido: "ida", periodo: "manha", rota: { id: "r1", nome: "Ida Manhã" }, created_at: `${d}T08:00:00` })),
  rotas: [{ id: "r1", nome: "Ida Manhã", periodo: "manha", tipo: "ida" }, { id: "r2", nome: "Volta Meio-dia", periodo: "manha", tipo: "volta" }],
  recibos_anuais: [{ id: "ra2025", ano: 2025, recibo_url: "/recibos/recibo-anual-ana-2025.png", total_pago: 3080, quantidade_meses: 11, created_at: "2025-12-20T10:00:00" }],
  responsavel_logado_id: "r1",
  // dados completos: sem o aviso de "Atualização Cadastral"
  responsavel_principal: { ...JULIANA },
  responsaveis: (ANA_CARTEIRINHA as any).responsaveis.map((r: any) => (r.id === "r1" ? { ...r, ...JULIANA } : r)),
});

/* ---------------- @/hooks/api/useResponsavelAuthApi ---------------- */
export const useCarteirinhaQuery = () => {
  const e = useEstado();
  const aus = e.ausencias ?? [];
  return memo(`cart:${aus.join(",")}`, () => q(carteirinhaResponsavel(aus)));
};
export const useCheckPhoneMutation = mutation;
export const useSetupPinMutation = mutation;
export const useLoginResponsavelMutation = mutation;
export const useResetPinResponsavelMutation = mutation;
export const useRegistrarAusenciaResponsavelMutation = mutation;
export const useRemoverAusenciaResponsavelMutation = mutation;
export const useUpdateObservacoesResponsavelMutation = mutation;
export const useAddResponsavelResponsavelMutation = mutation;
export const useUpdateResponsavelResponsavelMutation = mutation;
export const useDeleteResponsavelResponsavelMutation = mutation;
export const useSetPrincipalResponsavelResponsavelMutation = mutation;

/* ---------------- @/contexts/ResponsavelAuthContext ---------------- */
const AUTH = { token: "video", passageiros: [PASSAGEIRO_RESP], passageiroSelecionado: PASSAGEIRO_RESP, logout: () => {}, refetchPassageiros: async () => {}, setSession: () => {}, selectPassageiro: () => {}, isLoading: false };
export const useResponsavelAuthMock = () => AUTH as any;

/* ---------------- @/hooks/form/useResponsavelLoginForm ---------------- */
export function useResponsavelLoginFormMock() {
  const e = useEstado();
  const [showPin, setShowPin] = useState(false);
  const phoneForm = useForm<{ telefone: string }>({ defaultValues: { telefone: "" } });
  const pinForm = useForm<{ pin: string }>({ defaultValues: { pin: "" } });
  if (phoneForm.getValues("telefone") !== (e.telefone ?? "")) phoneForm.setValue("telefone", e.telefone ?? "");
  if (pinForm.getValues("pin") !== (e.pin ?? "")) pinForm.setValue("pin", e.pin ?? "");
  return {
    step: e.step ?? "phone",
    telefoneClean: (e.telefone ?? "").replace(/\D/g, ""),
    telefoneFormatted: e.telefone ?? "",
    isFirstAccess: true,
    showPin,
    setShowPin,
    rememberPhone: true,
    setRememberPhone: () => {},
    isRecuperarOpen: false,
    setIsRecuperarOpen: () => {},
    phoneForm,
    pinForm,
    handlePhoneSubmit: async () => {},
    handlePinSubmit: async () => {},
    handleBackToPhone: () => {},
    isPending: false,
  } as any;
}
