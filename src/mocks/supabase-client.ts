// Mock: nenhum vídeo conversa com o Supabase de verdade.
// Qualquer acesso (supabase.auth.getSession(), .from("x").select()...) devolve
// outro "coringa": pode ser chamado, encadeado ou aguardado (await → { data: null, error: null }).
const RESULT = { data: null, error: null };

const coringa = (): any =>
  new Proxy(function () {}, {
    get: (_t, key) => {
      if (key === "then") return (ok: (v: unknown) => void) => ok(RESULT);
      if (key === Symbol.toPrimitive) return () => "";
      return coringa();
    },
    apply: () => coringa(),
  });

export const supabase = coringa();
