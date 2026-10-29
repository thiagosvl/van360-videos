// Mock do view model de "Registrar pagamento": form real, valores do vídeo.
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useVideoState } from "@mocks/videoState";
import { moneyMask } from "@/utils/masks";

const noop = () => {};

export function useManualPaymentViewModel({ valorOriginal }: { valorOriginal: number }) {
  const { pagamento = {} } = useVideoState() as any;
  const form = useForm<Record<string, any>>({
    defaultValues: {
      valor_pago: moneyMask(String(Math.round(Number(valorOriginal) * 100))),
      data_pagamento: new Date(),
      tipo_pagamento: undefined,
      enviar_recibo_whatsapp_manual: false,
      observacao: "",
    },
  });
  useEffect(() => {
    for (const [k, v] of Object.entries(pagamento)) {
      if (form.getValues(k) !== v) form.setValue(k, v);
    }
  }, [pagamento, form]);
  return { form, openCalendar: false, setOpenCalendar: noop, handleSubmit: noop, onFormError: noop, isPending: false } as any;
}
