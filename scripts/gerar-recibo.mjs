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
const dataUrl = (arquivo) => `data:image/png;base64,${fs.readFileSync(path.join(root, arquivo)).toString("base64")}`;
const logoVan360 = dataUrl("assets/logo-van360-recibo.png");

// dados fictícios (mesmos do vídeo de Parcelas)
const RECIBOS = [
  {
    arquivo: "recibo-davi-marco.png",
    id: "a3f9c2e1-7b4d-4e2a-9c1f-5d8e6b2a0c47",
    motoristaNome: "Thiago Almeida",
    logoMotorista: "assets/logo-motorista-tio-thiago.png",
    valor: 280,
    data: "12/03/2026",
    pagadorNome: "Rodrigo Santos",
    passageiroNome: "Davi Santos",
    referencia: "Março/2026",
    metodo: "PIX",
  },
  {
    arquivo: "recibo-ana-marco.png",
    id: "7c2e9b14-3d5a-4f8e-b1c6-2a9d4e7f0b35",
    motoristaNome: "Thiago Almeida",
    logoMotorista: "assets/logo-motorista-tio-thiago.png",
    valor: 280,
    data: "08/03/2026",
    pagadorNome: "Juliana Souza",
    passageiroNome: "Ana Beatriz Souza",
    referencia: "Março/2026",
    metodo: "PIX",
  },
];

// recibos anuais (back-end: generateAnnualReceipt)
const RECIBOS_ANUAIS = [
  {
    arquivo: "recibo-anual-ana-2025.png",
    ano: 2025,
    motoristaNome: "Thiago Almeida",
    logoMotorista: "assets/logo-motorista-tio-thiago.png",
    responsavelNome: "Juliana Souza",
    passageiroNome: "Ana Beatriz Souza",
    emissao: "10/12/2025",
    meses: ["Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((m) => ({ mesNome: m, valor: 280 })),
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
  // como no back-end: logo do motorista no cabeçalho (fallback: Van360)
  // e, quando há logo do motorista, um Van360 pequeno no rodapé
  const logoMotorista = r.logoMotorista ? dataUrl(r.logoMotorista) : null;
  const headerLogo = logoMotorista || logoVan360;
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
            children: [
              { type: "div", props: { style: { fontSize: "12px", color: "#94a3b8" }, children: "Recibo digital gerado pela plataforma Van360." } },
              logoMotorista
                ? { type: "img", props: { src: logoVan360, style: { width: "70px", height: "24px", opacity: 0.6, objectFit: "contain" } } }
                : null,
            ].filter(Boolean),
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

const rowAnual = (label, value) => row(label, value);

for (const r of RECIBOS_ANUAIS) {
  const logoMotorista = r.logoMotorista ? dataUrl(r.logoMotorista) : null;
  const headerLogo = logoMotorista || logoVan360;
  const totalPago = r.meses.reduce((s, m) => s + m.valor, 0);
  const canvasHeight = Math.max(720, 600 + r.meses.length * 36);
  const rowsMeses = r.meses.map((item) => ({
    type: "div",
    props: {
      style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "13px" },
      children: [
        { type: "div", props: { style: { width: "100px", fontWeight: "bold", color: "#334155" }, children: item.mesNome.slice(0, 3).toUpperCase() } },
        { type: "div", props: { style: { flex: 1, color: "#16a34a", fontWeight: "bold" }, children: "PAGO" } },
        { type: "div", props: { style: { width: "140px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }, children: brl(item.valor) } },
      ],
    },
  }));
  const tree = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", width: "600px", height: `${canvasHeight}px`, backgroundColor: "#ffffff", padding: "40px", fontFamily: "Inter" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
            children: [
              { type: "img", props: { src: headerLogo, style: { maxWidth: "240px", maxHeight: "85px", objectFit: "contain" } } },
              { type: "div", props: { style: { backgroundColor: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: "bold", padding: "5px 12px", borderRadius: "999px" }, children: `REFERÊNCIA ${r.ano}` } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", marginBottom: "24px" },
            children: [
              { type: "div", props: { style: { fontSize: "26px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }, children: "Recibo Anual de Pagamento" } },
              { type: "div", props: { style: { fontSize: "14px", fontWeight: "bold", color: "#334155", marginBottom: "2px" }, children: r.motoristaNome } },
              { type: "div", props: { style: { fontSize: "13px", color: "#64748b" }, children: "Prestação de Serviços de Transporte Escolar" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px 22px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
            children: [
              { type: "div", props: { style: { fontSize: "13px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "TOTAL PAGO" } },
              { type: "div", props: { style: { fontSize: "26px", fontWeight: "bold", color: "#0f172a" }, children: brl(totalPago) } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" },
            children: [rowAnual("Pagador", r.responsavelNome), rowAnual("Aluno", r.passageiroNome)],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              { type: "div", props: { style: { fontSize: "12px", fontWeight: "bold", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }, children: `DETALHES DO PAGAMENTO ${r.ano}` } },
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "8px 16px", fontSize: "12px", fontWeight: "bold", color: "#475569", borderBottom: "1px solid #e2e8f0" },
                        children: [
                          { type: "div", props: { style: { width: "100px" }, children: "Data" } },
                          { type: "div", props: { style: { flex: 1 }, children: "Status" } },
                          { type: "div", props: { style: { width: "140px", textAlign: "right" }, children: "Valor" } },
                        ],
                      },
                    },
                    ...rowsMeses,
                  ],
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { marginTop: "auto", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
              { type: "div", props: { style: { fontSize: "11px", color: "#94a3b8" }, children: `Recibo digital gerado pela plataforma Van360 • Emitido em ${r.emissao}` } },
              logoMotorista ? { type: "img", props: { src: logoVan360, style: { width: "70px", height: "24px", opacity: 0.6, objectFit: "contain" } } } : null,
            ].filter(Boolean),
          },
        },
      ],
    },
  };
  let svg = await satori(tree, { width: 600, height: canvasHeight, fonts: [{ name: "Inter", data: font, weight: 700, style: "normal" }] });
  svg = svg.replace(/(<image[^>]+)preserveAspectRatio="xMidYMid"/, '$1preserveAspectRatio="xMinYMid meet"');
  const png = new Resvg(svg, { fitTo: { mode: "zoom", value: 2 } }).render().asPng();
  fs.writeFileSync(path.join(root, "public/recibos", r.arquivo), png);
  console.log("ok", r.arquivo);
}
