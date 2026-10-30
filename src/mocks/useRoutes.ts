// Igual ao original, mas sem rotas/ausências (a carteirinha não depende de rota no vídeo).
export * from "@/hooks/api/useRoutes.ts?original";
export const usePassageiroRotas = (..._a: any[]) => ({ data: [], isLoading: false });
export const usePassageiroAusencias = (..._a: any[]) => ({ data: [], isLoading: false });

/* Rotas do motorista do vídeo (tela de Rotas) */
const VEICULO_ROTAS = { id: "v1", marca: "Mercedes-Benz", modelo: "Sprinter", placa: "ABC1D23" };
const rota = (id: string, nome: string, periodo: string, n: number) => ({
  id, usuario_id: "mock-user-1", nome, periodo, veiculo_id: "v1", numero_passageiros: n, veiculo: VEICULO_ROTAS,
  created_at: "2026-02-01T08:00:00", updated_at: "2026-03-01T08:00:00",
});
export const ROTAS_VIDEO = [
  rota("r1", "Ida Manhã", "manha", 5),
  rota("r2", "Volta Manhã", "manha", 5),
  rota("r3", "Ida Tarde", "tarde", 9),
  rota("r4", "Volta Tarde", "tarde", 9),
];
export const useRoutes = (..._a: any[]) => ({ data: ROTAS_VIDEO, isLoading: false, isFetching: false, refetch: async () => ({}) });
export const useExecucoesRota = (..._a: any[]) => ({ data: [], isLoading: false, isFetching: false, refetch: async () => ({}) });
