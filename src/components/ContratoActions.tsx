import React from "react";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ContratoSummary } from "@/components/features/contrato/ContratoSummary";
import { useContratoActions } from "@/hooks/ui/useContratoActions";

const noop = () => {};

/**
 * Menu de ações REAL de um item da tela de Contratos (o mesmo que abre ao tocar
 * no card), com abertura controlada pelo vídeo. Use no `overlay` do PhoneScreen.
 */
export const ContratoActions: React.FC<{ item: any; open: boolean }> = ({ item, open }) => {
  const actions = useContratoActions({
    item,
    tipo: item.tipo,
    status: item.status,
    isContratoConfigurado: true,
    onVerPassageiro: noop,
    onEnviarWhatsApp: noop,
    onDownload: noop,
    onExcluir: noop,
    onSubstituir: noop,
    onGerarContrato: noop,
    onCompletarCadastro: noop,
    onImportarContrato: noop,
    onVisualizarLink: noop,
    onVisualizarFinal: noop,
  } as any);
  return (
    <ActionSheet
      open={open}
      onOpenChange={noop}
      actions={actions
        .filter((a: any) => !a.hidden)
        .map((a: any) => ({ label: a.label, title: a.title, description: a.description, icon: a.icon, onClick: noop, isDestructive: a.isDestructive, hasSeparatorAfter: a.hasSeparatorAfter, swipeColor: a.swipeColor, disabled: a.disabled }))}
    >
      <ContratoSummary item={item} />
    </ActionSheet>
  );
};
