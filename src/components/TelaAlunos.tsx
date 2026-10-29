import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { MOCK_PROFILE } from "../mocks/useProfile";

const noop = () => {};

/** Tela de Alunos completa (abas, link de cadastro, busca e filtros, lista), igual à Passageiros.tsx. */
export const TelaAlunos: React.FC<{ passageiros: any[]; solicitacoes?: number }> = ({ passageiros, solicitacoes = 0 }) => (
  <Tabs value="alunos" className="w-full space-y-4">
    <AppTabNav
      activeTab="alunos"
      items={[
        { value: "alunos", label: "Alunos" },
        { value: "solicitacoes", label: "Solicitações", badge: solicitacoes },
      ]}
    />
    <div className="space-y-4">
      <QuickRegistrationLink profile={MOCK_PROFILE} pendingCount={solicitacoes} />
      <PassageirosToolbar
        searchTerm=""
        onSearchChange={noop}
        selectedStatus="todos"
        onStatusChange={noop}
        selectedEscola="todas"
        onEscolaChange={noop}
        selectedVeiculo="todos"
        onVeiculoChange={noop}
        selectedPeriodo="todos"
        onPeriodoChange={noop}
        escolas={[]}
        veiculos={[]}
        onClearFilters={noop}
        hasActiveFilters={false}
        onApplyFilters={noop}
        onRegister={noop}
        searchPlaceholder="Buscar aluno ou responsável..."
      />
      <PassageirosList passageiros={passageiros} onHistorico={noop} onEdit={noop} onToggleClick={noop} onDeleteClick={noop} />
    </div>
  </Tabs>
);
