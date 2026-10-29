// Mock de react-pdf: em vez de renderizar o PDF (worker externo), mostra as
// páginas já convertidas em imagem por scripts/gerar-contrato.mjs.
// O "file" é o nome-base: "pedro-minuta" -> public/contratos/pedro-minuta-{n}.png
import React, { createContext, useContext } from "react";
import { Img, staticFile } from "remotion";

const LARGURA = 358; // 390 do celular - px-4 dos dois lados
const ALTURA = Math.round((LARGURA * 1529) / 1080);
const Arquivo = createContext("");

export const pdfjs = { GlobalWorkerOptions: {} as Record<string, unknown>, version: "video" };

export const Document: React.FC<{ file?: unknown; className?: string; children?: React.ReactNode }> = ({ file, className, children }) => (
  <Arquivo.Provider value={String(file ?? "")}>
    <div className={className}>{children}</div>
  </Arquivo.Provider>
);

export const Page: React.FC<{ pageNumber: number }> = ({ pageNumber }) => {
  const file = useContext(Arquivo);
  return (
    <Img
      src={staticFile(`contratos/${file}-${pageNumber}.png`)}
      style={{ width: LARGURA, height: ALTURA, display: "block" }}
    />
  );
};
