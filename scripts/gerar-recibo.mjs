/**
 * Gera o recibo de pagamento dos vídeos com o MESMO layout do back-end
 * (van360-backend/src/services/receipt.service.ts → generateAndSave):
 * satori + resvg, fonte Inter Bold, 600x800 em zoom 2x.
 *
 * Uso: node scripts/gerar-recibo.mjs
 * Saída: public/recibos/<arquivo>.png (usado pelo ReceiptDialog real do app no vídeo)
 *
 * Se o layout do recibo mudar no back-end, atualize a árvore abaixo.
 */
import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const font = fs.readFileSync(path.join(root, "assets/Inter-Bold.ttf"));
const logo = `data:image/png;base64,${fs.readFileSync(path.join(root, "assets/logo-van360-recibo.png")).toString("base64")}`;

// dados fictícios (mesmos do vídeo de Parcelas)
const RECIBOS = [
  {
    arquivo: "recibo-davi-marco.png",
    id: "a3f9c2e1-7b4d-4e2a-9c1f-5d8e6b2a0c47",
    motoristaNome: "Carlos Almeida",
    valor: 280,
    data: "12/03/2026",
    pagadorNome: "Rodrigo Santos",
    passageiroNome: "Davi Santos",
    referencia: "Março/2026",
    metodo: "PIX",
  },
];

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const row = (label, value) => ({
  type: "div",
  props: {
    style: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" },
    children: [
      { type: "div", props: { style: { fontSize: "14px", color: "#64748b" }, children: label } },
      { type: "div", props: { style: { fontSize: "14px", fontWeight: "bold", color: "#1e293b" }, children: value } },
    ],
  },
});

for (const r of RECIBOS) {
  // sem logo do motorista: o back-end usa o logo do Van360 no cabeçalho
  const headerLogo = logo;
  const tree = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", width: "600px", height: "800px", backgroundColor: "#ffffff", padding: "40px", fontFamily: "Inter" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
            children: [
              { type: "img", props: { src: headerLogo, style: { maxWidth: "240px", maxHeight: "95px", objectFit: "contain" } } },
              { type: "div", props: { style: { fontSize: "11px", color: "#94a3b8", marginTop: "10px" }, children: `ID: ${r.id.substring(0, 8)}` } },
            ],
          },
        },
        { type: "div", props: { style: { fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }, children: "Recibo de Pagamento" } },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", marginBottom: "28px" },
            children: [
              { type: "div", props: { style: { fontSize: "14px", fontWeight: "bold", color: "#334155", marginBottom: "2px" }, children: r.motoristaNome } },
              { type: "div", props: { style: { fontSize: "13px", color: "#64748b" }, children: "Prestação de Serviços de Transporte Escolar" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { backgroundColor: "#f8fafc", padding: "26px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" },
            children: [
              { type: "div", props: { style: { fontSize: "14px", color: "#64748b", marginBottom: "8px" }, children: "VALOR PAGO" } },
              { type: "div", props: { style: { fontSize: "48px", fontWeight: "bold", color: "#1e293b" }, children: brl(r.valor) } },
              { type: "div", props: { style: { fontSize: "12px", color: "#94a3b8", marginTop: "8px" }, children: r.metodo } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "18px" },
            children: [
              row("Pagador", r.pagadorNome),
              row("Aluno", r.passageiroNome),
              row("Data do Pagamento", r.data),
              row("Mês de Referência", `Parcela de ${r.referencia}`),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { marginTop: "auto", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [{ type: "div", props: { style: { fontSize: "12px", color: "#94a3b8" }, children: "Recibo digital gerado pela plataforma Van360." } }],
          },
        },
      ],
    },
  };

  let svg = await satori(tree, { width: 600, height: 800, fonts: [{ name: "Inter", data: font, weight: 700, style: "normal" }] });
  svg = svg.replace(/(<image[^>]+width="240"[^>]+)preserveAspectRatio="xMidYMid"/, '$1preserveAspectRatio="xMinYMid meet"');
  const png = new Resvg(svg, { fitTo: { mode: "zoom", value: 2 } }).render().asPng();
  fs.writeFileSync(path.join(root, "public/recibos", r.arquivo), png);
  console.log("ok", r.arquivo);
}
