// Mock do barrel "@/hooks": reexporta só os hooks leves usados pelos
// componentes que aparecem nos vídeos (o barrel real puxa a API inteira).
export { useAppPreferences } from "@/hooks/business/useAppPreferences";
export { safeCloseDialog, useDialogClose } from "@/hooks/ui/useDialogClose";
export { useIsMobile } from "@mocks/useIsMobile";
export { useSession } from "@mocks/useSession";
export { useProfile } from "@mocks/useProfile";
export { usePassageiroFormDadosCadastraisViewModel } from "@/hooks/ui/usePassageiroFormDadosCadastraisViewModel";
export { usePrePassageiros, useDeletePrePassageiro, useAppRating } from "@mocks/noop-hooks";
export { useLayout } from "@/contexts/LayoutContext";
export { useCobrancasViewModel } from "@mocks/useCobrancasViewModel";
export {
  useDeleteCobranca, useDesfazerPagamento, useToggleNotificacoesCobranca, useCreateCobranca,
  useRestaurarCobranca, useRegistrarPagamentoManual, useComplementarPagamentoManual, useUpdateCobranca,
  useTutorialsConfig,
} from "@mocks/noop-hooks";
export {
  useDeletePassageiro, useDeletePassageiroMatricula, useToggleAtivoPassageiro, useUpdatePassageiro,
  useSetPrincipalResponsavel, useDeleteResponsavelAdicional, useToggleNotificacoesRotaResponsavel, useGerarContratoFlow,
} from "@mocks/noop-hooks";
export { usePassageiro, useCobrancasByPassageiro } from "@mocks/carteirinha-hooks";
export { useContratosViewModel } from "@/hooks/ui/useContratosViewModel";
export { useAssinarContratoViewModel } from "@mocks/contratos-hooks";
export { useFilters } from "@/hooks/ui/useFilters";
export { useGastosViewModel } from "@/hooks/ui/useGastosViewModel";
export { useGastos, useVeiculos, useEscolas, useCobrancas, useGastoCategorias, usePassageiros, useUsuarioResumo } from "@mocks/financeiro";
export { useDeleteGasto, useCreateGasto, useUpdateGasto, useCreateGastoCategoria } from "@mocks/noop-hooks";
export { useDebounce } from "@/hooks/ui/useDebounce";
export { useEscolasWithFilters } from "@mocks/financeiro";
export { useDashboardViewModel } from "@/hooks/ui/useDashboardViewModel";
export { useConfiguracoes } from "@mocks/noop-hooks";
