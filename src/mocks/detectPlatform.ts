// Igual ao original, mas o vídeo "roda no celular" (ex.: botão "Enviar" do recibo).
export * from "@/utils/detectPlatform.ts?original";
export function isMobilePlatform(): boolean {
  return true;
}
