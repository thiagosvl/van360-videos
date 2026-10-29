// Estado controlado pelo vídeo, quadro a quadro.
// As cenas preenchem valores aqui (ex.: campos sendo digitados) e os mocks
// dos hooks do app aplicam esses valores nos formulários reais.
import React, { createContext, useContext } from "react";

export type VideoState = {
  /** valores do formulário do pai (PassageiroExternalForm) */
  externalForm?: Record<string, string>;
  /** valores do formulário de aprovação (RevisarSolicitacaoDialog) */
  revisar?: Record<string, string>;
  /** sobrescreve campos do view model da tela de Parcelas */
  parcelas?: Record<string, unknown>;
  /** valores do formulário "Registrar pagamento" */
  pagamento?: Record<string, unknown>;
  /** mês centralizado na barra de meses (pode ser fracionado durante a troca) */
  mesScroll?: number;
  /** etapa da história dos contratos: 0 antes de gerar, 1 pendente, 2 assinado */
  contratos?: { etapa: number };
  /** página pública de assinatura */
  assinar?: { assinado?: boolean; /** páginas em public/contratos (padrão "pedro") */ arquivo?: string; anoLetivo?: number };
  /** quadro de assinatura: entra em modo de desenho e desenha até `progresso` (0 a 1) */
  assinatura?: { editando?: boolean; progresso?: number };
  /** abre esta aba da barra de abas (telas cuja aba é estado interno) */
  abaForcada?: string;
  /** gastos registrados durante o vídeo (somam aos de março) */
  gastosExtras?: any[];
  /** valores do formulário "Registrar Gasto" */
  gastoForm?: Record<string, unknown>;
  /** estado da renovação (ver mocks/renovacao.ts) */
  renovacao?: import("./renovacao").EstadoRenovacao;
};

const Ctx = createContext<VideoState>({});

export const VideoStateProvider: React.FC<{ value: VideoState; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useVideoState = () => useContext(Ctx);
