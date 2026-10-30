// Campos de data da ausência REAIS, com a data preenchida pelo vídeo
// (VideoState.dataAusencia): o toque no campo já "escolhe" a data, sem mostrar o calendário.
import React, { useLayoutEffect } from "react";
import { useVideoState } from "@mocks/videoState";
import { PeriodoAusenciaCampos as Original, PeriodoAusenciaCamposProps } from "@/components/ui/PeriodoAusenciaCampos.tsx?original";

export * from "@/components/ui/PeriodoAusenciaCampos.tsx?original";

export const PeriodoAusenciaCampos: React.FC<PeriodoAusenciaCamposProps> = (props) => {
  const data = (useVideoState() as any).dataAusencia as string | undefined;
  useLayoutEffect(() => {
    if (data && props.dataInicio !== data) {
      props.onDataInicioChange(data);
      props.onDataFimChange(data);
    }
  });
  return <Original {...props} />;
};
