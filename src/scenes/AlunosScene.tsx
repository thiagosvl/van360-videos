import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground, Headline, usePhoneRise } from "../components/brand";
import { PASSAGEIROS } from "../mocks/data";

const noop = () => {};
const BUSCA = "Ana";
const TYPE_START = 120; // frame em que começa a "digitar" na busca
const FRAMES_PER_CHAR = 6;

/** Tela real de Alunos: lista entrando e busca filtrando ao vivo. */
export const AlunosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(8);

  // cards entram um a um, como o app carregando a lista
  const visiveis = Math.max(0, Math.min(PASSAGEIROS.length, Math.floor((frame - 26) / 3)));

  // busca sendo digitada letra por letra
  const chars = Math.max(0, Math.min(BUSCA.length, Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR) + 1));
  const busca = frame >= TYPE_START ? BUSCA.slice(0, chars) : "";

  const filtrados = PASSAGEIROS.slice(0, visiveis).filter((p) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.responsavel_principal?.nome ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <BrandBackground>
      <Headline text={"Todos os **alunos** em um só lugar"} />
      <AbsoluteFill style={{ alignItems: "center", top: 450 }}>
        <div style={{ translate: `0px ${rise}px` }}>
          <PhoneScreen route="/alunos" pageTitle="Alunos" scale={1.72}>
            <div className="space-y-4">
              <PassageirosToolbar
                searchTerm={busca}
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
                showAdvancedFilters
                showRegister
                searchPlaceholder="Buscar aluno ou responsável..."
              />
              {/* mesmo rodapé da página Passageiros.tsx */}
              <div className="flex items-center justify-end px-0.5">
                <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  {filtrados.length} {filtrados.length === 1 ? "aluno" : "alunos"}
                </span>
              </div>
              <PassageirosList
                passageiros={filtrados}
                onHistorico={noop}
                onEdit={noop}
                onToggleClick={noop}
                onDeleteClick={noop}
              />
            </div>
          </PhoneScreen>
        </div>
      </AbsoluteFill>
    </BrandBackground>
  );
};
