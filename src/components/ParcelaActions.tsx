import React from "react";
import { ActionSheet } from "@/components/common/ActionSheet";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";

const noop = () => {};

/**
 * Menu de ações REAL de uma parcela (o mesmo que abre ao tocar no card),
 * com abertura controlada pelo vídeo. Use no `overlay` do PhoneScreen.
 */
export const ParcelaActions: React.FC<{ cobranca: any; open: boolean }> = ({ cobranca, open }) => {
  const actions = useCobrancaActions({
    cobranca,
    onRegistrarPagamento: noop,
    onVerCarteirinha: noop,
    onEditarCobranca: noop,
    onVerRecibo: cobranca.recibo_url ? noop : undefined,
    onEnviarCobranca: noop,
  } as any);
  return (
    <ActionSheet
      open={open}
      onOpenChange={noop}
      actions={actions
        .filter((a: any) => !a.hidden)
        .map((a: any) => ({ label: a.label, title: a.title, description: a.description, icon: a.icon, onClick: noop, isDestructive: a.isDestructive, hasSeparatorAfter: a.hasSeparatorAfter, swipeColor: a.swipeColor }))}
    >
      <CobrancaSummary cobranca={cobranca} />
    </ActionSheet>
  );
};

