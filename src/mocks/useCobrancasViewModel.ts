// Mock do view model da tela de Parcelas: tudo vem do vídeo (useVideoState().parcelas).
import { useVideoState } from "@mocks/videoState";

const noop = () => {};

export function useCobrancasViewModel() {
  const { parcelas = {} } = useVideoState() as any;
  const aReceber = parcelas.aReceber ?? [];
  const recebidas = parcelas.recebidas ?? [];
  return {
    mesFilter: 3,
    anoFilter: 2026,
    handleNavigation: noop,
    totalAReceber: 0,
    totalRecebido: 0,
    totalAtrasado: 0,
    totalPrevisto: 0,
    countAReceber: aReceber.length,
    countRecebidos: recebidas.length,
    activeTab: "areceber",
    handleTabChange: noop,
    buscaAReceber: "",
    setBuscaAReceber: noop,
    buscaRecebidos: "",
    setBuscaRecebidos: noop,
    cobrancasAReceber: aReceber,
    cobrancasRecebidas: recebidas,
    paginatedCobrancasAReceber: aReceber,
    paginatedCobrancasRecebidas: recebidas,
    pageAReceber: 1,
    setPageAReceber: noop,
    pageRecebidas: 1,
    setPageRecebidas: noop,
    limit: 20, // como no app: com 1 página e limite 20, a paginação some sozinha
    setLimit: noop,
    totalPagesAReceber: 1,
    totalPagesRecebidas: 1,
    isInitialLoading: false,
    isFutureMonth: false,
    isPastMonth: false,
    isCurrentMonth: true,
    pullToRefreshReload: async () => {},
    navigateToPassageiro: noop,
    handleEditCobrancaClick: noop,
    handleDeleteCobrancaClick: noop,
    openPaymentDialog: noop,
    ...parcelas,
  } as any;
}
