// Gera o contrato fictício do Pedro com o MESMO código do back-end (pdf-lib):
//   public/contratos/pedro-minuta-p{n}.png    (antes de assinar)
//   public/contratos/pedro-assinado-p{n}.png  (assinado pela mãe, com rodapé de auditoria)
// e as assinaturas desenhadas (src/mocks/assinaturas.json + PNG), usadas também na animação.
//
// Uso: node scripts/gerar-contrato.mjs   (precisa do repo van360-backend ao lado do app)
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { build } from "esbuild";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const appRoot = path.resolve(root, process.env.VAN360_APP_PATH ?? "../van360");
const backRoot = path.resolve(appRoot, "../van360-backend");
const outDir = path.join(root, "public/contratos");
const tmp = path.join(root, "out/.contrato");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

/* ---------- assinaturas (fonte de traço único, para "desenhar" no vídeo) ---------- */
function carregaFonte(nome) {
  const svg = fs.readFileSync(path.join(root, "node_modules/hersheytext/svg_fonts", nome), "utf8");
  const glifos = {};
  for (const m of svg.matchAll(/<glyph unicode="([^"]+)"[^>]*?horiz-adv-x="([\d.]+)"(?:[^>]*?d="([^"]*)")?/g)) {
    glifos[m[1]] = { adv: Number(m[2]), d: m[3] ?? "" };
  }
  return glifos;
}

/** Texto -> lista de traços (cada um uma lista de pontos), já inclinado e com y para baixo. */
function assinatura(texto, { fonte = "EMSAllure.svg", sublinhado = true } = {}) {
  const g = carregaFonte(fonte);
  const tracos = [];
  let x = 0;
  for (const ch of texto) {
    const gl = g[ch] ?? g[" "];
    for (const sub of gl.d.split("M").map((s) => s.trim()).filter(Boolean)) {
      const nums = sub.replace(/L/g, " ").trim().split(/\s+/).map(Number);
      const pts = [];
      for (let i = 0; i < nums.length; i += 2) pts.push([x + nums[i], -nums[i + 1]]);
      // letras ligadas: emenda no traço anterior quando começa perto do fim dele
      const ult = tracos[tracos.length - 1];
      if (ult && Math.hypot(ult[ult.length - 1][0] - pts[0][0], ult[ult.length - 1][1] - pts[0][1]) < 40) ult.push(...pts.slice(1));
      else tracos.push(pts);
    }
    x += gl.adv * 0.9; // um pouco mais apertado, como à mão
  }
  if (sublinhado) {
    // rubrica: risco final passando por baixo do nome
    tracos.push([[x * 0.05, 150], [x * 0.4, 120], [x * 0.8, 110], [x * 1.02, 85]]);
  }
  // normaliza numa caixa 300 x 100
  const all = tracos.flat();
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const s = Math.min(280 / (maxX - minX), 84 / (maxY - minY));
  const ox = (300 - (maxX - minX) * s) / 2, oy = (100 - (maxY - minY) * s) / 2;
  return tracos.map((t) => t.map(([px, py]) => [+(ox + (px - minX) * s).toFixed(1), +(oy + (py - minY) * s).toFixed(1)]));
}

const ASSINATURAS = {
  motorista: assinatura("Thiago Almeida"),
  responsavel: assinatura("Carla Alves"),
};
fs.writeFileSync(path.join(root, "src/mocks/assinaturas.json"), JSON.stringify(ASSINATURAS));

const pngAssinatura = (tracos) => {
  const d = tracos.map((t) => "M" + t.map((p) => p.join(" ")).join(" L")).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 300 100"><path d="${d}" fill="none" stroke="#0a0a0a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return new Resvg(svg).render().asPng();
};
const sigMotorista = pngAssinatura(ASSINATURAS.motorista);
const sigResponsavel = pngAssinatura(ASSINATURAS.responsavel);
fs.writeFileSync(path.join(outDir, "assinatura-motorista.png"), sigMotorista);
const dataUrl = (buf) => `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;

/* ---------- código do back-end, com armazenamento e banco trocados por stubs ---------- */
const stubs = {
  name: "stubs",
  setup(b) {
    b.onResolve({ filter: /config\/logger\.js$/ }, () => ({ path: "logger", namespace: "stub" }));
    b.onResolve({ filter: /storage\.provider\.js$/ }, () => ({ path: "storage", namespace: "stub" }));
    b.onResolve({ filter: /contract\.repository\.js$/ }, () => ({ path: "repo", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({
      contents: {
        logger: "export const logger = { info(){}, warn(){}, error(){}, debug(){} };",
        storage: "export const storageProvider = globalThis.__storage;",
        repo: "export const contractRepository = new Proxy({}, { get: (_, k) => globalThis.__repo[k] });",
      }[a.path],
      loader: "js",
    }));
    // .js nos imports do TS apontam para .ts
    b.onResolve({ filter: /^\.\.?\/.*\.js$/ }, (a) => {
      const ts = path.resolve(a.resolveDir, a.path.replace(/\.js$/, ".ts"));
      return fs.existsSync(ts) ? { path: ts } : undefined;
    });
  },
};
const bundle = path.join(tmp, "provider.mjs");
await build({
  entryPoints: [path.join(backRoot, "src/services/providers/inhouse-contract.provider.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  external: ["pdf-lib"],
  nodePaths: [path.join(root, "node_modules")],
  plugins: [stubs],
  logLevel: "error",
});
if (!fs.existsSync(path.join(tmp, "node_modules"))) fs.symlinkSync(path.join(root, "node_modules"), path.join(tmp, "node_modules"), "dir");

const arquivos = {};
globalThis.__storage = {
  upload: async (_b, nome, buf) => ((arquivos[nome] = buf), { error: null }),
  download: async (_b, nome) => ({ data: new Blob([arquivos[nome]]), error: null }),
  getPublicUrl: (_b, nome) => `https://mock.local/contratos/${nome}`,
};

/* ---------- dados fictícios (mesmos do vídeo) ---------- */
const secoes = (() => {
  // as cláusulas padrão do app (constants/defaults.ts)
  const src = fs.readFileSync(path.join(appRoot, "src/constants/defaults.ts"), "utf8");
  const bloco = src.slice(src.indexOf("DEFAULT_SECOES_CONTRATO"), src.indexOf("export const DEFAULT_CLAUSULAS"));
  return new Function(`return ${bloco.slice(bloco.indexOf("["), bloco.lastIndexOf("]") + 1)}`)();
})();

const dados = {
  nomePassageiro: "Pedro Henrique Alves",
  nomeResponsavel: "Carla Alves",
  cpfResponsavel: "52998224725",
  telefoneResponsavel: "11991234567",
  parentescoResponsavel: "mae",
  enderecoCompleto: "Rua das Acácias, 120 - Jardim Primavera, São Paulo/SP",
  nomeEscola: "Colégio Aurora",
  enderecoEscola: "",
  periodo: "manha",
  modalidade: "ida_volta",
  valorMensal: 280,
  diaVencimento: 10,
  ano: 2026,
  dataInicio: "2026-03-12",
  dataFim: "2026-12-18",
  horarioEntrada: "07:00",
  horarioSaida: "12:00",
  dataInicioCobranca: "2026-04-01",
  dataFimCobranca: "2026-12-31",
  valorTotal: 2520,
  qtdParcelas: 9,
  valorParcela: 280,
  multaAtraso: { valor: 2, tipo: "percentual" },
  jurosAtraso: { valor: 1, tipo: "percentual" },
  multaRescisao: { valor: 20, tipo: "percentual" },
  nomeCondutor: "Thiago Almeida",
  cpfCnpjCondutor: "39053344705",
  telefoneCondutor: "11988887777",
  apelidoCondutor: "Tio Thiago",
  placaVeiculo: "ABC1D23",
  modeloVeiculo: "Sprinter",
  exibirVeiculo: true,
  secoes,
  assinaturaCondutorUrl: dataUrl(sigMotorista),
  logoCondutorUrl: dataUrl(fs.readFileSync(path.join(root, "assets/logo-motorista-tio-thiago.png"))),
};

/** Contratos gerados: o do vídeo de Contratos (2026) e o da Renovação (2027, com 10% de reajuste). */
const CONTRATOS = [
  { id: "pedro", hoje: "2026-03-12T13:00:00Z", assinadoEm: "2026-03-12T10:14:00", dados },
  {
    id: "pedro-2027",
    hoje: "2026-12-10T13:00:00Z",
    assinadoEm: "2026-12-10T10:31:00",
    dados: {
      ...dados,
      valorMensal: 308,
      ano: 2027,
      dataInicio: "2027-02-01",
      dataFim: "2027-12-17",
      dataInicioCobranca: "2027-02-01",
      dataFimCobranca: "2027-12-31",
      valorTotal: 3388,
      qtdParcelas: 11,
      valorParcela: 308,
    },
  },
];

const RealDate = Date;
const { InHouseContractProvider } = await import(bundle);
const provider = new InHouseContractProvider();

for (const c of CONTRATOS) {
  // "hoje" fixo, igual ao vídeo (src/clock.ts)
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [c.hoje])); }
    static now() { return new RealDate(c.hoje).getTime(); }
  };
  globalThis.__repo = {
    getMinutaAndData: async () => ({
      data: { minuta_url: `https://mock.local/contratos/minutas/${c.id}.pdf`, dados_contrato: c.dados },
      error: null,
    }),
  };
  await provider.gerarContrato({ contratoId: c.id, dadosContrato: c.dados });
  await provider.processarAssinatura({
    contratoId: c.id,
    assinaturaBase64: dataUrl(sigResponsavel),
    nomeAssinante: "Carla Alves",
    metadados: { ip: "177.38.214.92", userAgent: "Mozilla/5.0 (iPhone)", timestamp: c.assinadoEm },
  });

  /* ---------- PDF -> imagens das páginas ---------- */
  for (const [nome, chave] of [["minuta", `minutas/${c.id}.pdf`], ["assinado", `assinados/${c.id}.pdf`]]) {
    const pdf = path.join(tmp, `${c.id}-${nome}.pdf`);
    fs.writeFileSync(pdf, arquivos[chave]);
    const base = `${c.id}-${nome}`;
    for (const f of fs.readdirSync(outDir).filter((f) => new RegExp(`^${base}-\\d+\\.png$`).test(f))) fs.unlinkSync(path.join(outDir, f));
    execFileSync("pdftoppm", ["-png", "-scale-to-x", "1080", "-scale-to-y", "-1", pdf, path.join(outDir, base)]);
  }
}
console.log(fs.readdirSync(outDir).join("\n"));
