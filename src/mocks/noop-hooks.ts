// Hooks de dados/telemetria do app que não fazem sentido no vídeo.
const noop = () => {};
const asyncNoop = async () => undefined as any;

export const usePrePassageiros = (..._a: any[]) => ({ data: undefined, isLoading: false, refetch: noop });
export const useDeletePrePassageiro = () => ({ mutateAsync: asyncNoop, mutate: noop, isPending: false });
export const useAppRating = () => ({ trackAlunoCadastradoOuAprovado: noop, requestReview: noop });
export const useUsuarioResumo = (..._a: any[]) => ({ data: undefined, isLoading: false });
export const useActivityTracker = () => ({ trackActivity: noop });
