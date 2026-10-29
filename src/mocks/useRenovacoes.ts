// Igual ao original (tipos e chaves), com os dados da renovação vindos do vídeo.
export * from "@/hooks/api/useRenovacoes.ts?original";
export {
  useRenovacoesList, usePeriodoRenovacaoConfig, useRenovacaoContratoConfig, usePublicRenovacao,
  useReajusteLote, useUpdateRenovacao, useAtualizarStatusLoteRenovacao, useResponderPublicRenovacao,
  useAtualizarDadosPublicosRenovacao, useNotificarPassageiroRenovacao, useNotificarLoteRenovacao,
  useSalvarRenovacaoContratoConfig, useSalvarPeriodoRenovacaoConfig,
} from "@mocks/renovacao";
