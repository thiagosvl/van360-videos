import React, { useMemo } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { LayoutContext } from "@/contexts/LayoutContext";

/**
 * Os mesmos providers que o app usa em volta das telas, com dados fictícios.
 * - route: qual rota o app "acha" que está aberta (destaca a aba certa no menu)
 * - pageTitle: título mostrado no topo
 */
export const AppProviders: React.FC<{
  route: string;
  pageTitle?: string;
  children: React.ReactNode;
}> = ({ route, pageTitle, children }) => {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { enabled: false } } }),
    [],
  );

  // useLayout() do app: o título vem daqui; qualquer outra função vira no-op
  const layoutValue = useMemo(
    () =>
      new Proxy({ pageTitle: pageTitle ?? "" } as Record<string, unknown>, {
        get: (target, key: string) => (key in target ? target[key] : () => {}),
      }),
    [pageTitle],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <PrivacyProvider>
          <LayoutContext.Provider value={layoutValue as never}>
            {children}
          </LayoutContext.Provider>
        </PrivacyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};
