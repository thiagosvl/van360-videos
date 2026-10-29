// Mock: perfil de motorista titular com as preferências padrão do app.
import { MOTORISTA } from "@mocks/data";

export const MOCK_PROFILE = {
  id: MOTORISTA.id,
  nome: MOTORISTA.nome,
  apelido: MOTORISTA.apelido,
  tipo: "motorista",
  configuracoes: {
    formato_nome_aluno: "completo",
    formato_nome_responsavel: "primeiro_nome",
    exibir_telefone_lista_alunos: false,
  },
} as any;

export function useProfile(_userId?: string) {
  return {
    profile: MOCK_PROFILE,
    summary: undefined as any,
    isLoading: false,
    isError: false,
    error: null,
    isAuthenticated: true,
    isGestor: true,
    isMotoristaAuxiliar: false,
    isMonitor: false,
    isSubConta: false,
    donoContaId: MOTORISTA.id,
    refreshProfile: async () => {},
  };
}
