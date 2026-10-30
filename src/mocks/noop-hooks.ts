// Hooks de dados/telemetria do app que não fazem sentido no vídeo.
const noop = () => {};
const asyncNoop = async () => undefined as any;

export const usePrePassageiros = (..._a: any[]) => ({ data: undefined, isLoading: false, refetch: noop });
export const useDeletePrePassageiro = () => ({ mutateAsync: asyncNoop, mutate: noop, isPending: false });
export const useAppRating = () => ({ trackAlunoCadastradoOuAprovado: noop, requestReview: noop });
export const useUsuarioResumo = (..._a: any[]) => ({ data: undefined, isLoading: false });
export const useActivityTracker = () => ({ trackActivity: noop });

// mutações de parcelas (nada é salvo no vídeo)
const mutation = () => ({ mutate: noop, mutateAsync: asyncNoop, isPending: false });
export const useDeleteCobranca = mutation;
export const useDesfazerPagamento = mutation;
export const useToggleNotificacoesCobranca = mutation;
export const useCreateCobranca = mutation;
export const useRestaurarCobranca = mutation;
export const useRegistrarPagamentoManual = mutation;
export const useComplementarPagamentoManual = mutation;
export const useUpdateCobranca = mutation;
export const useTutorialsConfig = (..._a: any[]) => ({ config: undefined, shouldShowTutorial: false });
export const usePassageiros = (..._a: any[]) => ({ data: { list: [] }, isLoading: false });
export const useMotoristaFinanceiroApi = () => ({ financeiro: { chave_pix_repasse: null, tipo_chave_pix: null, modo_cobranca: "LEMBRETES" }, isLoading: false });

// carteirinha
export const useDeletePassageiro = mutation;
export const useDeletePassageiroMatricula = mutation;
export const useToggleAtivoPassageiro = mutation;
export const useUpdatePassageiro = mutation;
export const useSetPrincipalResponsavel = mutation;
export const useDeleteResponsavelAdicional = mutation;
export const useToggleNotificacoesRotaResponsavel = mutation;
export const useGerarContratoFlow = () => ({ iniciarFluxoGerarContrato: noop });

// gastos (nada é salvo no vídeo)
export const useDeleteGasto = mutation;
export const useCreateGasto = mutation;
export const useUpdateGasto = mutation;
export const useCreateGastoCategoria = mutation;

// configurações do motorista (avisos aos pais ligados, como no vídeo de Rotas)
export const useConfiguracoes = () => ({
  configuracoes: { notificar_inicio_rota: true, notificar_proxima_parada: true, notificar_conclusao_parada: true } as any,
  isLoading: false,
  salvar: noop,
  atualizar: noop,
  mutate: noop,
  isSaving: false,
});
