// Igual ao original, mas as mutações não fazem nada no vídeo e as listas
// vêm do vídeo (VideoState.contratos.etapa), conforme o momento da história.
import { useVideoState } from "@mocks/videoState";
import { listaContratos } from "@mocks/data";
export * from "@/hooks/api/useContratos.ts?original";
const mutation = () => ({ mutate: () => {}, mutateAsync: async () => undefined as any, isPending: false });
export const useCreateContrato = mutation;
export const useSubstituirContrato = mutation;
export const useDeleteContrato = mutation;

export function useContratos(filters?: Record<string, unknown>) {
  const etapa = useVideoState().contratos?.etapa ?? 0;
  const list = (listaContratos(etapa) as Record<string, any[]>)[String(filters?.tab ?? "sem_contrato")] ?? [];
  return {
    data: { list, pagination: { total: list.length, page: 1, totalPages: 1 }, total: list.length },
    isLoading: false,
    refetch: async () => {},
  } as any;
}

export function useContratosKPIs() {
  const etapa = useVideoState().contratos?.etapa ?? 0;
  const l = listaContratos(etapa);
  return {
    data: { semContrato: l.sem_contrato.length, pendentes: l.pendentes.length, assinados: l.assinados.length },
    isLoading: false,
    refetch: async () => {},
  } as any;
}
