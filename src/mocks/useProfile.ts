// Mock: perfil de motorista titular com as preferências padrão do app.
import { staticFile } from "remotion";
import { MOTORISTA } from "@mocks/data";
import { useVideoState } from "@mocks/videoState";
import { resumoMarco } from "@mocks/financeiro";

export const MOCK_PROFILE = {
  id: MOTORISTA.id,
  nome: MOTORISTA.nome,
  apelido: MOTORISTA.apelido,
  tipo: "motorista",
  // contratos configurados e ativos (assinatura + "usar contratos")
  assinatura_digital_url: staticFile("contratos/assinatura-motorista.png"),
  config_contrato: {
    usar_contratos: true,
    multa_atraso: { valor: 2, tipo: "percentual" },
    juros_atraso: { valor: 1, tipo: "percentual" },
    multa_rescisao: { valor: 20, tipo: "percentual" },
  },
  configuracoes: {
    formato_nome_aluno: "completo",
    formato_nome_responsavel: "primeiro_nome",
    exibir_telefone_lista_alunos: false,
  },
} as any;

export function useProfile(_userId?: string) {
  // a tela Início só mostra os números com o resumo; os outros vídeos seguem sem ele
  const comResumo = (useVideoState() as any).comResumo;
  return {
    profile: MOCK_PROFILE,
    summary: (comResumo ? resumoMarco() : undefined) as any,
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
