import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Gastos from "@/pages/Gastos";
import Relatorios from "@/pages/Relatorios";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground } from "../components/brand";
import { VEICULOS } from "../mocks/financeiro";

/**
 * Conferência das telas de Gastos e Relatórios: cada quadro é um estado.
 * bash scripts/stills.sh DebugFinanceiro 0 1 2 ...
 */
export const ESTADOS_FINANCEIRO: Array<{ nome: string; route: string; titulo: string; scroll?: number; form?: boolean }> = [
  { nome: "gastos-topo", route: "/gastos", titulo: "Gastos" },
  { nome: "gastos-lista", route: "/gastos", titulo: "Gastos", scroll: 380 },
  { nome: "gastos-form", route: "/gastos", titulo: "Gastos", form: true },
  { nome: "rel-geral", route: "/relatorios?tab=visao-geral", titulo: "Relatórios" },
  { nome: "rel-geral-2", route: "/relatorios?tab=visao-geral", titulo: "Relatórios", scroll: 600 },
  { nome: "rel-entradas", route: "/relatorios?tab=entradas", titulo: "Relatórios" },
  { nome: "rel-entradas-2", route: "/relatorios?tab=entradas", titulo: "Relatórios", scroll: 600 },
  { nome: "rel-saidas", route: "/relatorios?tab=saidas", titulo: "Relatórios" },
  { nome: "rel-saidas-2", route: "/relatorios?tab=saidas", titulo: "Relatórios", scroll: 600 },
  { nome: "rel-saidas-3", route: "/relatorios?tab=saidas", titulo: "Relatórios", scroll: 1200 },
  { nome: "rel-operacional", route: "/relatorios?tab=operacional", titulo: "Relatórios" },
  { nome: "rel-operacional-2", route: "/relatorios?tab=operacional", titulo: "Relatórios", scroll: 600 },
];

export const DebugFinanceiro: React.FC = () => {
  const e = ESTADOS_FINANCEIRO[useCurrentFrame()] ?? ESTADOS_FINANCEIRO[0];
  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <PhoneScreen
          key={e.nome}
          route={e.route}
          pageTitle={e.titulo}
          scale={1.5}
          scrollY={e.scroll ?? 0}
          overlay={
            e.form ? (
              <GastoFormDialog isOpen onClose={() => {}} veiculos={VEICULOS} allowBatchCreation />
            ) : undefined
          }
        >
          <Routes>
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </PhoneScreen>
      </AbsoluteFill>
    </BrandBackground>
  );
};
