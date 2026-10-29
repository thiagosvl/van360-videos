// Igual ao original; o "Indique e Ganhe" usa dados do vídeo (VideoState.indicacoes).
import { useVideoState } from "@mocks/videoState";
export * from "@/hooks/api/useSubscription.ts?original";

/** link de indicação do motorista do vídeo (no app: site + ?ref=<id do usuário>) */
export const LINK_INDICACAO = "https://van360.com.br/?ref=8f3a2c1e";

export const useSubscriptionReferral = (_userId?: string) => {
  const completed = (useVideoState() as any).indicacoes ?? 2;
  return {
    referral: { bonusDays: 30, discountPct: 50, completed, referralLink: LINK_INDICACAO } as any,
    isLoading: false,
    refetch: async () => ({}) as any,
  };
};
