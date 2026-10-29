// Mock: sessão sempre logada como o motorista fictício.
import { MOTORISTA } from "@mocks/data";

const user = { id: MOTORISTA.id, email: "carlos@exemplo.com" } as any;
const session = { user, access_token: "mock" } as any;

export function useSession() {
  return { session, user, loading: false };
}
