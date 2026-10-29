// Mock: assinatura ativa, nada bloqueado.
export function useSubscriptionAccess(_userId?: string) {
  return {
    subscription: { status: "ACTIVE" } as any,
    isLoading: false,
    isError: false,
    refetch: async () => {},
    isBlocked: false,
    isActive: true,
    isPastDue: false,
  } as any;
}
