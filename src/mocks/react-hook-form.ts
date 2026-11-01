// react-hook-form REAL, com um detalhe só para o vídeo: o formulário de gasto
// (campo "parcelado"), o de passeio ("valor_por_pessoa") e o de frete ("tem_sinal") recebem os valores de
// VideoState.gastoForm / passeioForm / freteForm a cada quadro,
// como se a pessoa estivesse preenchendo.
import { useLayoutEffect } from "react";
import { useForm as useFormOriginal } from "react-hook-form-original";
import { useVideoState } from "@mocks/videoState";

export * from "react-hook-form-original";

export function useForm(...args: Parameters<typeof useFormOriginal>) {
  const form = useFormOriginal(...args);
  const vs = useVideoState() as any;
  const dv = (args[0]?.defaultValues ?? {}) as object;
  // qual formulário é este (pelos campos): gasto, passeio ou frete
  const valores = ("parcelado" in dv ? vs.gastoForm : "valor_por_pessoa" in dv ? vs.passeioForm : "tem_sinal" in dv ? vs.freteForm : undefined) as
    | Record<string, unknown>
    | undefined;
  useLayoutEffect(() => {
    if (!valores) return;
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
