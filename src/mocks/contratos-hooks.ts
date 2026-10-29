// Página pública de assinatura: estado vindo do vídeo (VideoState.assinar).
import { useRef } from "react";
import { useVideoState } from "@mocks/videoState";
import { contratoPublicoPedro } from "@mocks/data";

const noop = () => {};

export function useAssinarContratoViewModel(_p?: { token?: string }) {
  const { assinar } = useVideoState();
  const sigCanvas = useRef(null);
  return {
    contrato: contratoPublicoPedro(!!assinar?.assinado),
    isLoading: false,
    isError: false,
    // o diálogo de assinatura é posto pelo vídeo no overlay do celular
    modalAberto: false,
    setModalAberto: noop,
    numPages: 3,
    sigCanvas,
    handleAssinar: noop,
    onDocumentLoadSuccess: noop,
    isSigning: false,
  } as any;
}
