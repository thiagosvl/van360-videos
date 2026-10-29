import React from "react";
import { CheckCircle2, School, Car, Clock, Check } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";

/**
 * Gaveta "Filtrar Alunos" do PassageirosToolbar (versão mobile).
 * O app abre essa gaveta num portal (vaul), fora do celular do vídeo,
 * então aqui ela é montada com a mesma marcação e os mesmos componentes
 * (NativeSelect, Button) para controlar abertura e valores por frame.
 *
 * progress: 0 = fechada, 1 = aberta
 */
export const FiltrosAlunosSheet: React.FC<{
  progress: number;
  escola: string;
  escolas: { id: string; nome: string }[];
  aplicarPressionado?: boolean;
}> = ({ progress, escola, escolas, aplicarPressionado }) => {
  if (progress <= 0) return null;

  return (
    <div className="absolute inset-0">
      {/* DrawerOverlay */}
      <div className="absolute inset-0 bg-black/50" style={{ opacity: progress }} />
      {/* DrawerContent */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] flex flex-col bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]"
        style={{ translate: `0px ${(1 - progress) * 110}%` }}
      >
        <div className="mx-auto mt-3.5 mb-2.5 h-1 w-10 rounded-full bg-[#d4d4d4]" />
        <div className="grid gap-1.5 text-left mb-2 px-6 pt-5">
          <h2 className="font-semibold text-[#0a0a0a] text-lg tracking-tight">Filtrar Alunos</h2>
          <p className="text-xs font-normal text-[#737373]">
            Refine sua busca para encontrar alunos específicos.
          </p>
        </div>

        <div className="px-6 space-y-4">
          <div className="space-y-3.5">
            <Field icon={CheckCircle2} label="Status">
              <NativeSelect value="todos" onChange={() => {}}>
                <option value="todos">Todos os status</option>
              </NativeSelect>
            </Field>
            <Field icon={School} label="Escola">
              <NativeSelect value={escola} onChange={() => {}}>
                <option value="todas">Todas as escolas</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field icon={Car} label="Veículo">
              <NativeSelect value="todos" onChange={() => {}}>
                <option value="todos">Todos os veículos</option>
              </NativeSelect>
            </Field>
            <Field icon={Clock} label="Período">
              <NativeSelect value="todos" onChange={() => {}}>
                <option value="todos">Todos os períodos</option>
              </NativeSelect>
            </Field>
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-[#e5e5e5]">
            <Button
              className="flex-1 h-11 rounded-[18px] bg-primary text-white text-sm font-medium gap-1.5 shadow-xs"
              style={{ scale: aplicarPressionado ? "0.97" : "1" }}
            >
              <Check className="h-4 w-4" />
              <span>Aplicar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}> = ({ icon: Icon, label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-[#737373]" />
      {label}
    </label>
    {children}
  </div>
);
