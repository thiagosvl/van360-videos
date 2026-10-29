// Dados da carteirinha vindos do vídeo (aluno, parcelas por ano, recibo anual).
import { staticFile } from "remotion";
import { ANA_CARTEIRINHA, ANA_PARCELAS_2025, ANA_PARCELAS_2026, PEDRO_CARTEIRINHA, PEDRO_ID, PEDRO_PARCELAS_2026 } from "@mocks/data";

const RECIBOS: Record<string, string> = {
  RECIBO_ANA_MARCO: "recibos/recibo-ana-marco.png",
};

const comRecibo = (c: any) => (c.recibo_url && RECIBOS[c.recibo_url] ? { ...c, recibo_url: staticFile(RECIBOS[c.recibo_url]) } : c);

export const usePassageiro = (id?: string, ..._a: any[]) => ({
  data: id === PEDRO_ID ? PEDRO_CARTEIRINHA : ANA_CARTEIRINHA,
  isLoading: false,
  isError: false,
  error: null,
  refetch: async () => {},
});

export const useCobrancasByPassageiro = (id?: string, ano?: string | number) => ({
  data: (id === PEDRO_ID ? PEDRO_PARCELAS_2026 : String(ano) === "2025" ? ANA_PARCELAS_2025 : ANA_PARCELAS_2026).map(comRecibo),
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: async () => {},
});

export const useReciboAnual = (_id?: string, ano?: string | number, opts?: { enabled?: boolean }) => ({
  data: opts?.enabled && String(ano) === "2025" ? { recibo_url: staticFile("recibos/recibo-anual-ana-2025.png") } : undefined,
  isLoading: false,
  isFetching: false,
});
