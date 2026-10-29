// View model REAL da tela de Renovação; só a seleção de alunos vem do vídeo
// (VideoState.renovacao.selecionados), para o "Marcar todos" sair igual em todo quadro.
import { useVideoState } from "@mocks/videoState";
import { useRenovacoesViewModel as original } from "@/hooks/ui/useRenovacoesViewModel.ts?original";

export function useRenovacoesViewModel() {
  const vm = original();
  const sel = (useVideoState() as any).renovacao?.selecionados as string[] | undefined;
  if (!sel) return vm;
  const selectedIds = new Set(sel);
  return { ...vm, selectedIds, isAllSelected: vm.passageiros.length > 0 && vm.passageiros.every((p: any) => selectedIds.has(p.passageiro_id)) };
}
