// Estado controlado pelo vídeo, quadro a quadro.
// As cenas preenchem valores aqui (ex.: campos sendo digitados) e os mocks
// dos hooks do app aplicam esses valores nos formulários reais.
import React, { createContext, useContext } from "react";

export type VideoState = {
  /** valores do formulário do pai (PassageiroExternalForm) */
  externalForm?: Record<string, string>;
  /** valores do formulário de aprovação (RevisarSolicitacaoDialog) */
  revisar?: Record<string, string>;
};

const Ctx = createContext<VideoState>({});

export const VideoStateProvider: React.FC<{ value: VideoState; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useVideoState = () => useContext(Ctx);
