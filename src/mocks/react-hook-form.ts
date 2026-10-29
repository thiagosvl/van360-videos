// react-hook-form REAL, com um detalhe só para o vídeo: o formulário de gasto
// (o único com o campo "parcelado") recebe os valores de VideoState.gastoForm a cada quadro,
// como se a pessoa estivesse preenchendo.
import { useLayoutEffect } from "react";
import { useForm as useFormOriginal } from "react-hook-form-original";
import { useVideoState } from "@mocks/videoState";

export * from "react-hook-form-original";

export function useForm(...args: Parameters<typeof useFormOriginal>) {
  const form = useFormOriginal(...args);
  const valores = (useVideoState() as any).gastoForm as Record<string, unknown> | undefined;
  const ehGasto = !!args[0]?.defaultValues && "parcelado" in (args[0].defaultValues as object);
  useLayoutEffect(() => {
    if (!ehGasto || !valores) return;
    const atuais = form.getValues() as Record<string, unknown>;
    const difere = Object.entries(valores).some(([campo, valor]) => {
      const atual = atuais[campo];
      return atual instanceof Date && valor instanceof Date ? atual.getTime() !== valor.getTime() : atual !== valor;
    });
    // reset (e não setValue): atualiza todos os campos controlados de uma vez, inclusive a data
    if (difere) form.reset({ ...atuais, ...valores } as any, { keepDefaultValues: true });
  });
  return form;
}
