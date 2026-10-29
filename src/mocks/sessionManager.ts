// Mock do gerenciador de sessão: sempre logado como o motorista fictício, sem rede.
import { MOTORISTA } from "@mocks/data";

const user = { id: MOTORISTA.id, email: "thiago@exemplo.com" } as any;
const session = { user, access_token: "mock", refresh_token: "mock" } as any;

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_SESSION" | "TOKEN_REFRESHED" | "USER_UPDATED" | "PASSWORD_RECOVERY";
export type AuthUser = any;
export type Session = any;
export type AuthListener = any;

export const sessionManager = {
  getCurrentSession: () => session,
  getCurrentUser: () => user,
  getSession: async () => ({ data: { session } }),
  setSession: async () => {},
  refreshToken: async () => ({ success: true }),
  signOut: async () => {},
  onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
};
