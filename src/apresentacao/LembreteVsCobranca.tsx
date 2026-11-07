import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, BrandBackground } from "../components/brand";
import { Beat, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { MOTORISTA } from "../mocks/data";
import { Cena, Destaque, Manchete, Pilula, Toque, useSpring } from "./CobrancaAutomatica";

/**
 * Explicativo: Lembrete automático x Cobrança & Baixa Automática (~59s, narração do Thiago, sem CTA).
 * Para mandar no WhatsApp e passar dentro do app. Linha em degraus:
 * o lembrete já vem na assinatura -> o que ainda fica com o transportador -> a cobrança faz tudo
 * (dinheiro na hora, baixa, recibo, aviso) -> multa e juros -> opcional, assinatura igual, taxa só
 * quando o pai paga (EXEMPLO: 200 - 2,50 = 197,50) -> troca quando quiser -> resumo + slogan.
 * Falas aceleradas 1,1x (originais fora do repositório) para caber em 1 minuto.
 */
const FALAS: Array<[string, number]> = [
  ["Lembrete ou cobrança automática? Entenda a diferença.", 120],
  ["O lembrete automático já vem na sua assinatura: no dia do vencimento, e três dias depois se atrasar, o app avisa o pai no WhatsApp por você.", 246],
  ["Mas o Pix cai direto na sua conta, e o resto ainda é com você: conferir no banco quem pagou, dar baixa um por um e mandar o recibo.", 243],
  ["Na cobrança automática, o app faz tudo isso: o pai paga, o dinheiro cai na hora, a baixa é automática, o recibo vai pro pai e você é avisado na mesma hora.", 292],
  ["E dá até pra cobrar multa e juros de quem atrasa.", 94],
  ["Ela é opcional: a assinatura continua a mesma, e só tem uma taxa quando o pai paga. Por exemplo: parcela de duzentos reais, taxa de dois e cinquenta, caem cento e noventa e sete e cinquenta na sua conta.", 359],
  ["E você troca de uma pra outra quando quiser, nas configurações.", 115],
  ["Lembrete: o app cobra por você. Cobrança automática: um secretário financeiro que cuida de tudo. Você dirige. A gente organiza.", 289],
];
export const BEATS: Beat[] = (() => {
  let t = 0;
  return FALAS.map(([text, duration]) => {
    const b = { text, from: t, duration };
    t += duration;
    return b;
  });
})();
export const DIFERENCA_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const LEN = (n: number) => BEATS[n - 1].duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const F = 6; // a fala começa 6 quadros depois do beat
const VERDE = "#16a34a";
const LARANJA = "#ea580c";

const PAI = "Rodrigo";
const ALUNO = "Davi";
const VALOR = "R$ 200,00";

/** nomes como estão no app (Configurações > Pagamentos) */
const NOME_LEMBRETE = "Lembretes Automáticos no WhatsApp";
const NOME_COBRANCA = "Cobrança & Baixa Automática";

/* ------------------------------------------------------------------ */
/* peças                                                               */
/* ------------------------------------------------------------------ */
const Cartao: React.FC<{
  icone: string;
  titulo: string;
  sub?: string;
  destaque?: number; // 0..1: borda azul
  apagado?: number; // 0..1
  style?: React.CSSProperties;
}> = ({ icone, titulo, sub, destaque = 0, apagado = 0, style }) => (
  <div
    style={{
      width: 440,
      padding: "40px 30px",
      borderRadius: 40,
      background: "white",
      border: `5px solid rgba(37,99,235,${destaque})`,
      boxShadow: `0 24px 60px rgba(11,26,46,${0.1 + 0.08 * destaque})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      opacity: 1 - 0.55 * apagado,
      ...style,
    }}
  >
    <div style={{ fontSize: 96, lineHeight: 1 }}>{icone}</div>
    <div style={{ marginTop: 22, fontFamily: "Manrope", fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: BRAND.navy }}>
      <Destaque text={titulo} />
    </div>
    {sub && <div style={{ marginTop: 16, fontFamily: "Inter", fontWeight: 600, fontSize: 30, lineHeight: 1.25, color: "#64748b" }}>{sub}</div>}
  </div>
);

type Tarefa = { icone: string; txt: string; em: number };
/** Lista de tarefas: "Você" (laranja) ou "✓ Automático" (verde), cada uma no seu tempo. */
const Tarefas: React.FC<{ itens: Tarefa[]; modo: "voce" | "auto"; top: number }> = ({ itens, modo, top }) => (
  <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 20 }}>
    {itens.map((t) => (
      <LinhaTarefa key={t.txt} t={t} modo={modo} />
    ))}
  </div>
);
const LinhaTarefa: React.FC<{ t: Tarefa; modo: "voce" | "auto" }> = ({ t, modo }) => {
  const s = useSpring(t.em, { damping: 12, mass: 0.6 });
  const selo = useSpring(t.em + 8, { damping: 10, mass: 0.5 });
  const auto = modo === "auto";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "26px 30px",
        borderRadius: 32,
        background: auto ? "#f0fdf4" : "white",
        border: `3px solid ${auto ? "#86efac" : "#fed7aa"}`,
        boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
        opacity: s,
        translate: `${(1 - s) * 90}px 0px`,
      }}
    >
      <div style={{ fontSize: 60, lineHeight: 1 }}>{t.icone}</div>
      <div style={{ flex: 1, fontFamily: "Inter", fontWeight: 700, fontSize: 40, color: BRAND.navy, lineHeight: 1.15 }}>{t.txt}</div>
      <div
        style={{
          padding: "10px 22px",
          borderRadius: 999,
          background: auto ? VERDE : "#fff7ed",
          color: auto ? "white" : LARANJA,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: 28,
          whiteSpace: "nowrap",
          opacity: selo,
          scale: String(0.5 + 0.5 * selo),
        }}
      >
        {auto ? "✓ Automático" : "Você"}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 1. Gancho: os dois lado a lado                                      */
/* ------------------------------------------------------------------ */
const G = { diferenca: F + 72 };
const Gancho: React.FC = () => {
  const a = useSpring(2, { damping: 12, mass: 0.6 });
  const b = useSpring(12, { damping: 12, mass: 0.6 });
  const vs = useSpring(24, { damping: 9, mass: 0.5 });
  return (
    <AbsoluteFill>
      <Manchete text="Lembrete ou **cobrança automática**?" ate={G.diferenca - 4} size={70} />
      <Manchete text="Entenda a **diferença**" de={G.diferenca - 4} ate={LEN(1) + 99} />
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        <Cartao icone="🔔" titulo={NOME_LEMBRETE} style={{ opacity: a, translate: `${(1 - a) * -200}px 0px` }} />
        <Cartao icone="✨" titulo={NOME_COBRANCA} style={{ opacity: b, translate: `${(1 - b) * 200}px 0px` }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: vs,
          scale: String(0.4 + 0.6 * vs),
        }}
      >
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: BRAND.navy, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 40, boxShadow: "0 12px 30px rgba(11,26,46,0.3)" }}>
          ou
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 2. O lembrete: já vem na assinatura e avisa o pai                    */
/* ------------------------------------------------------------------ */
const L = { selo: F + 26, troca: F + 76, venc: F + 82, atraso: F + 122, chega: F + 170 };
const Chip: React.FC<{ texto: string; em: number }> = ({ texto, em }) => {
  const s = useSpring(em, { damping: 12, mass: 0.5 });
  return (
    <div
      style={{
        padding: "14px 28px",
        borderRadius: 999,
        background: "white",
        border: `3px solid ${BRAND.blue}`,
        color: BRAND.navy,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 34,
        boxShadow: "0 8px 24px rgba(37,99,235,0.15)",
        opacity: s,
        scale: String(0.6 + 0.4 * s),
      }}
    >
      {texto}
    </div>
  );
};
const Lembrete: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpring(2, { damping: 12, mass: 0.6 });
  const selo = useSpring(L.selo, { damping: 10, mass: 0.5 });
  const saiCard = interpolate(frame, [L.troca, L.troca + 10], [1, 0], clamp);
  const msg = useSpring(L.chega, { damping: 14, mass: 0.7 });
  return (
    <AbsoluteFill>
      <Manchete text="**Já vem** na sua assinatura" ate={L.troca} size={72} />
      <Manchete text="O app **avisa o pai**" de={L.troca} ate={LEN(2) + 99} />
      {frame < L.troca + 10 && (
        <div style={{ position: "absolute", top: 620, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: saiCard }}>
          <Cartao icone="🔔" titulo="Lembrete **automático**" style={{ width: 760, opacity: card, scale: String(0.85 + 0.15 * card) }} />
          <div
            style={{
              marginTop: 36,
              padding: "20px 38px",
              borderRadius: 999,
              background: "#dcfce7",
              color: "#15803d",
              fontFamily: "Inter",
              fontWeight: 800,
              fontSize: 44,
              opacity: selo,
              scale: String(0.6 + 0.4 * selo),
            }}
          >
            ✓ Já faz parte da assinatura
          </div>
        </div>
      )}
      {frame >= L.troca && (
        <>
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
            <Chip texto="🔔 No vencimento" em={L.venc} />
            <Chip texto="⏰ 3 dias depois, se atrasar" em={L.atraso} />
          </div>
          {frame >= L.chega - 2 && (
            <AbsoluteFill style={{ alignItems: "center", top: 660 }}>
              <div style={{ width: 330, scale: String(2.7 * (0.9 + 0.1 * msg)), opacity: msg, transformOrigin: "50% 0%" }}>
                <WabaMessage motorista={MOTORISTA.apelido} hora="07:00">
                  {WABA_MODELOS.venceHoje({ responsavel: PAI, aluno: ALUNO, valor: VALOR })}
                </WabaMessage>
              </div>
            </AbsoluteFill>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Mas o resto ainda é com você                                      */
/* ------------------------------------------------------------------ */
const R = { resto: F + 64, banco: F + 112, baixa: F + 162, recibo: F + 202 };
const TAREFAS_VOCE: Tarefa[] = [
  { icone: "🏦", txt: "Conferir no banco quem pagou", em: R.banco },
  { icone: "✍️", txt: "Dar baixa no app, um por um", em: R.baixa },
  { icone: "🧾", txt: "Mandar o recibo pro pai", em: R.recibo },
];
const PixNaConta: React.FC<{ top: number }> = ({ top }) => {
  const chega = useSpring(6, { damping: 13, mass: 0.6 });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 900,
          padding: "26px 36px",
          borderRadius: 36,
          background: "white",
          boxShadow: "0 24px 60px rgba(11,26,46,0.14)",
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: chega,
          translate: `0px ${(1 - chega) * -120}px`,
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 28, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>💸</div>
        <div style={{ fontFamily: "Inter" }}>
          <div style={{ fontSize: 32, color: "#64748b", fontWeight: 600 }}>Pix de {PAI} na sua conta</div>
          <div style={{ fontSize: 64, color: VERDE, fontWeight: 800, fontFamily: "Manrope" }}>+ {VALOR}</div>
        </div>
      </div>
    </div>
  );
};
const ComVoce: React.FC = () => (
  <AbsoluteFill>
    <Manchete text="O Pix cai **na sua conta**" ate={R.resto} size={72} />
    <Manchete text="O resto **é com você**" de={R.resto} ate={LEN(3) + 99} />
    <PixNaConta top={520} />
    <Pilula texto="Com o lembrete, você ainda precisa:" top={760} cor={{ bg: "#fff7ed", fg: LARANJA }} />
    <Tarefas itens={TAREFAS_VOCE} modo="voce" top={850} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* 4. Na cobrança automática, o app faz tudo                            */
/* ------------------------------------------------------------------ */
const C = { dinheiro: F + 84, baixa: F + 146, recibo: F + 194, avisa: F + 236 };
const TAREFAS_AUTO: Tarefa[] = [
  { icone: "💸", txt: "O dinheiro cai na hora", em: C.dinheiro },
  { icone: "✅", txt: "Baixa da parcela", em: C.baixa },
  { icone: "🧾", txt: "Recibo enviado pro pai", em: C.recibo },
];
const Notificacao: React.FC<{ em: number; top: number }> = ({ em, top }) => {
  const s = useSpring(em, { damping: 13, mass: 0.6 });
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, opacity: s, translate: `0px ${(1 - s) * -80}px` }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: BRAND.blue }}>🔔 E você é avisado na hora</div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 22,
          alignItems: "center",
          padding: "24px 28px",
          borderRadius: 34,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 24px 60px rgba(11,26,46,0.18)",
          fontFamily: "Inter",
        }}
      >
        <Img src={staticFile("logo-van360-3.png")} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "contain", background: "white" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#64748b", fontWeight: 600 }}>
            <span>VAN360</span>
            <span>agora</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: BRAND.navy }}>
            Recebido: {VALOR} • {ALUNO} 💰
          </div>
          <div style={{ fontSize: 28, color: "#334155", lineHeight: 1.25 }}>Parcela de mar/26 ({PAI}). Baixa concluída e recibo enviado!</div>
        </div>
      </div>
    </div>
  );
};
const AppFazTudo: React.FC = () => (
  <AbsoluteFill>
    <Manchete text="O app **faz tudo**" ate={LEN(4) + 99} />
    <Pilula texto="O pai pagou no Pix. Pronto:" top={500} cor={{ bg: "#dcfce7", fg: "#15803d" }} />
    <Tarefas itens={TAREFAS_AUTO} modo="auto" top={590} />
    <Notificacao em={C.avisa} top={1070} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* 5. Multa e juros (só na cobrança automática)                          */
/* ------------------------------------------------------------------ */
const MJ = { chips: F + 20, linha: F + 46 };
const MultaJuros: React.FC = () => {
  const s = useSpring(2, { damping: 12, mass: 0.6 });
  const chips = useSpring(MJ.chips, { damping: 11, mass: 0.6 });
  const linha = useSpring(MJ.linha, { damping: 12, mass: 0.6 });
  return (
    <AbsoluteFill>
      <Manchete text="Multa e **juros**" ate={LEN(5) + 99} />
      <div style={{ opacity: s }}>
        <Pilula texto={`Só na ${NOME_COBRANCA}`} top={500} />
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, opacity: chips, scale: String(0.7 + 0.3 * chips) }}>
        {["Multa: R$ 20 (uma vez)", "Juros: 2% ao dia"].map((c) => (
          <div key={c} style={{ padding: "16px 28px", borderRadius: 999, background: "#eef3ff", color: BRAND.blue, fontFamily: "Inter", fontWeight: 800, fontSize: 36 }}>
            {c}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 70,
          right: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "30px 36px",
          borderRadius: 34,
          background: "white",
          boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
          opacity: linha,
          translate: `${(1 - linha) * 90}px 0px`,
          fontFamily: "Manrope",
        }}
      >
        <div>
          <div style={{ fontSize: 46, fontWeight: 800, color: BRAND.navy }}>Pagou 2 dias depois</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#dc2626", fontFamily: "Inter" }}>R$ 200 + R$ 20 multa + R$ 8 juros</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, color: VERDE }}>R$ 228</div>
      </div>
      <div style={{ position: "absolute", top: 990, left: 0, right: 0, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: "#94a3b8", opacity: linha }}>
        valores de exemplo, você escolhe os seus
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Opcional, assinatura igual, taxa só quando o pai paga             */
/* ------------------------------------------------------------------ */
const T = { assinatura: F + 34, taxa: F + 96, parcela: F + 172, menos: F + 220, cai: F + 268 };
const Fato: React.FC<{ texto: string; em: number }> = ({ texto, em }) => {
  const s = useSpring(em, { damping: 12, mass: 0.6 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Inter", fontWeight: 700, fontSize: 40, color: BRAND.navy, opacity: s, translate: `${(1 - s) * 60}px 0px` }}>
      <span style={{ width: 54, height: 54, borderRadius: "50%", background: "#dcfce7", color: VERDE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✓</span>
      <Destaque text={texto} />
    </div>
  );
};
const LinhaConta: React.FC<{ rot: string; valor: string; em: number; cor?: string; grande?: boolean }> = ({ rot, valor, em, cor = BRAND.navy, grande }) => {
  const s = useSpring(em, { damping: 12, mass: 0.6 });
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: s, translate: `0px ${(1 - s) * 30}px` }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: grande ? 38 : 36, color: "#475569" }}>{rot}</span>
      <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: grande ? 76 : 56, color: cor, letterSpacing: "-0.02em" }}>{valor}</span>
    </div>
  );
};
const Taxa: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpring(T.parcela - 6, { damping: 13, mass: 0.6 });
  const linha = interpolate(frame, [T.cai - 6, T.cai + 4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Manchete text="É **opcional**" ate={T.assinatura - 4} />
      <Manchete text="Taxa **só quando o pai paga**" de={T.assinatura - 4} ate={LEN(6) + 99} size={70} />
      <div style={{ position: "absolute", top: 510, left: 90, right: 60, display: "flex", flexDirection: "column", gap: 22 }}>
        <Fato texto="A assinatura **continua a mesma**" em={T.assinatura} />
        <Fato texto="Taxa **descontada sozinha**" em={T.taxa} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 70,
          right: 70,
          padding: "36px 44px",
          borderRadius: 40,
          background: "white",
          boxShadow: "0 24px 70px rgba(11,26,46,0.14)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          opacity: card,
          scale: String(0.9 + 0.1 * card),
        }}
      >
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 28, color: BRAND.blue, letterSpacing: "0.04em" }}>EXEMPLO</div>
        <LinhaConta rot="Parcela paga" valor="R$ 200,00" em={T.parcela} />
        <LinhaConta rot="Taxa" valor="− R$ 2,50" em={T.menos} cor="#dc2626" />
        <div style={{ height: 4, borderRadius: 2, background: "#e2e8f0", transformOrigin: "0% 50%", scale: `${linha} 1` }} />
        <LinhaConta rot="Cai na sua conta" valor="R$ 197,50" em={T.cai} cor={VERDE} grande />
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: "#94a3b8", opacity: card }}>
        valores de exemplo
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Troca quando quiser (Configurações > Pagamentos)                  */
/* ------------------------------------------------------------------ */
const W = { toque: F + 40 };
const Opcao: React.FC<{ icone: string; titulo: string; ativa: boolean; toqueEm?: number }> = ({ icone, titulo, ativa, toqueEm }) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "28px 30px",
      borderRadius: 32,
      background: ativa ? "#eef3ff" : "white",
      border: `4px solid ${ativa ? BRAND.blue : "#e2e8f0"}`,
      boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
    }}
  >
    <div style={{ fontSize: 56 }}>{icone}</div>
    <div style={{ flex: 1, fontFamily: "Inter", fontWeight: 800, fontSize: 38, color: BRAND.navy }}>{titulo}</div>
    <div style={{ width: 46, height: 46, borderRadius: "50%", border: `4px solid ${ativa ? BRAND.blue : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {ativa && <div style={{ width: 24, height: 24, borderRadius: "50%", background: BRAND.blue }} />}
    </div>
    {toqueEm !== undefined && <Toque em={toqueEm} size={110} />}
  </div>
);
const Troca: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(2, { damping: 13, mass: 0.6 });
  const cobrancaAtiva = frame >= W.toque;
  return (
    <AbsoluteFill>
      <Manchete text="Troca **quando quiser**" ate={LEN(7) + 99} />
      <Pilula texto="Configurações › Pagamentos" top={500} />
      <div style={{ position: "absolute", top: 610, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 22, opacity: s, translate: `0px ${(1 - s) * 60}px` }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34, color: "#475569", textAlign: "center", marginBottom: 6 }}>Como você deseja cobrar os pais?</div>
        <Opcao icone="🔔" titulo={NOME_LEMBRETE} ativa={!cobrancaAtiva} />
        <Opcao icone="✨" titulo={NOME_COBRANCA} ativa={cobrancaAtiva} toqueEm={W.toque} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Resumo + slogan                                                   */
/* ------------------------------------------------------------------ */
const Z = { cobranca: F + 82, slogan: F + 190, organiza: F + 218 };
const Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useSpring(2, { damping: 12, mass: 0.6 });
  const b = useSpring(Z.cobranca - 4, { damping: 12, mass: 0.6 });
  const destaca = useSpring(Z.cobranca + 10, { damping: 12, mass: 0.6 });
  const sai = interpolate(frame, [Z.slogan - 8, Z.slogan + 4], [1, 0], clamp);
  const logo = useSpring(Z.slogan, { damping: 11, mass: 0.7 });
  const l2 = useSpring(Z.organiza, { damping: 13, mass: 0.6 });
  const slogan: React.CSSProperties = { fontFamily: "Manrope", fontWeight: 800, fontSize: 84, letterSpacing: "-0.03em", color: BRAND.navy, textAlign: "center" };
  return (
    <AbsoluteFill>
      {frame < Z.slogan + 4 && (
        <>
          <Manchete text="**Resumindo**" ate={Z.slogan} />
          <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, opacity: sai }}>
            <Cartao icone="🔔" titulo="Lembrete" sub="O app cobra por você" apagado={destaca * 0.5} style={{ opacity: a * (1 - 0.35 * destaca), translate: `${(1 - a) * -200}px 0px` }} />
            <Cartao
              icone="✨"
              titulo="Cobrança **automática**"
              sub="Seu secretário financeiro: cuida de tudo"
              destaque={destaca}
              style={{ opacity: b, translate: `${(1 - b) * 200}px 0px`, scale: String(1 + 0.06 * destaca) }}
            />
          </div>
        </>
      )}
      {frame >= Z.slogan - 4 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              top: 520,
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 65%)",
              scale: String(logo),
            }}
          />
          <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 740, width: 560, opacity: logo, scale: String(0.5 + 0.5 * logo) }} />
          <div style={{ position: "absolute", top: 980, left: 60, right: 60 }}>
            <div style={{ ...slogan, opacity: logo }}>Você dirige.</div>
            <div style={{ ...slogan, opacity: l2, translate: `0px ${(1 - l2) * 30}px` }}>
              <Destaque text="A gente **organiza**." />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  // 1
  { at: 2, sfx: "whoosh-soft", volume: 0.5 },
  { at: 24, sfx: "pop", volume: 0.6 },
  // 2
  { at: B[2], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[2] + L.selo, sfx: "success", volume: 0.55 },
  { at: B[2] + L.troca, sfx: "whoosh-soft", volume: 0.5 },
  { at: B[2] + L.venc, sfx: "select", volume: 0.6 },
  { at: B[2] + L.atraso, sfx: "select", volume: 0.6 },
  { at: B[2] + L.chega - 2, sfx: "vibra", volume: 0.4 },
  { at: B[2] + L.chega, sfx: "notif", volume: 0.65 },
  // 3
  { at: B[3], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[3] + 6, sfx: "pop", volume: 0.5 },
  ...TAREFAS_VOCE.map((t): SfxEvent => ({ at: B[3] + t.em, sfx: "pop", volume: 0.55 })),
  // 4
  { at: B[4], sfx: "whoosh", volume: 0.5 },
  ...TAREFAS_AUTO.map((t): SfxEvent => ({ at: B[4] + t.em + 8, sfx: "select", volume: 0.6 })),
  { at: B[4] + C.avisa - 2, sfx: "vibra", volume: 0.45 },
  { at: B[4] + C.avisa, sfx: "notif", volume: 0.7 },
  // 5
  { at: B[5], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[5] + MJ.chips, sfx: "pop", volume: 0.55 },
  { at: B[5] + MJ.linha, sfx: "pop", volume: 0.55 },
  // 6
  { at: B[6], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[6] + T.assinatura, sfx: "select", volume: 0.55 },
  { at: B[6] + T.taxa, sfx: "select", volume: 0.55 },
  { at: B[6] + T.parcela, sfx: "pop", volume: 0.5 },
  { at: B[6] + T.menos, sfx: "pop", volume: 0.5 },
  { at: B[6] + T.cai, sfx: "success", volume: 0.65 },
  // 7
  { at: B[7], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[7] + W.toque, sfx: "tap" },
  // 8
  { at: B[8], sfx: "whoosh", volume: 0.5 },
  { at: B[8] + Z.cobranca + 10, sfx: "select", volume: 0.6 },
  { at: B[8] + Z.slogan, sfx: "whoosh", volume: 0.5 },
  { at: B[8] + Z.organiza, sfx: "chime", volume: 0.6 },
];

const CENAS: React.FC[] = [Gancho, Lembrete, ComVoce, AppFazTudo, MultaJuros, Taxa, Troca, Fechamento];

export const LembreteVsCobranca: React.FC = () => (
  <BrandBackground>
    {CENAS.map((Comp, i) => {
      const n = i + 1;
      const ultimo = n === CENAS.length;
      return (
        <SequenceCena key={n} n={n} ultimo={ultimo}>
          <Comp />
        </SequenceCena>
      );
    })}
    <Narracao pasta="diferenca" beats={BEATS} />
    <Sfx events={SFX} />
  </BrandBackground>
);

const SequenceCena: React.FC<{ n: number; ultimo: boolean; children: React.ReactNode }> = ({ n, ultimo, children }) => (
  <Sequence from={B[n]} durationInFrames={LEN(n)} name={`Cena ${n}`}>
    {ultimo ? <AbsoluteFill>{children}</AbsoluteFill> : <Cena len={LEN(n)}>{children}</Cena>}
  </Sequence>
);
