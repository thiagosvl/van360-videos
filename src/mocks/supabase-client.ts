// Mock: nenhum vídeo conversa com o Supabase de verdade.
export const supabase = new Proxy({} as any, {
  get: () => () => ({ data: null, error: null }),
});
