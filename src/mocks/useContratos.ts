// Igual ao original, mas as mutações não fazem nada no vídeo.
export * from "@/hooks/api/useContratos.ts?original";
const mutation = () => ({ mutate: () => {}, mutateAsync: async () => undefined as any, isPending: false });
export const useCreateContrato = mutation;
export const useSubstituirContrato = mutation;
export const useDeleteContrato = mutation;
