/**
 * Para telas do app que leem window.innerWidth (ex.: o Menu volta para o Início
 * quando a janela é "de computador"). Chame no corpo do componente da composição:
 * cada aba do navegador renderiza só uma composição, então não vaza para outras.
 */
let aplicado = false;
export function usarLarguraDeCelular(largura = 390) {
  if (aplicado || typeof window === "undefined") return;
  aplicado = true;
  Object.defineProperty(window, "innerWidth", { configurable: true, get: () => largura });
}
