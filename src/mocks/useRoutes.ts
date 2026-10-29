// Igual ao original, mas sem rotas/ausências (a carteirinha não depende de rota no vídeo).
export * from "@/hooks/api/useRoutes.ts?original";
export const usePassageiroRotas = (..._a: any[]) => ({ data: [], isLoading: false });
export const usePassageiroAusencias = (..._a: any[]) => ({ data: [], isLoading: false });
