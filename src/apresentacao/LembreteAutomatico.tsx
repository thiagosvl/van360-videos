import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, BrandBackground } from "../components/brand";
import { Beat, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { MOTORISTA } from "../mocks/data";
import { TutorialParcelas } from "../tutoriais/TutorialParcelas";
import { Cena, Destaque, Manchete, Pilula, Toque, useSpring } from "./CobrancaAutomatica";
import { CHEGA, Gancho as WhatsLotado, Trecho, TrechoTutorial } from "./ApresentacaoApp";

/**
 * Venda: lembrete automático (~41s, narração do Thiago, sem CTA).
 * Cobrar pai cansa -> lembrete automático -> mensagem no vencimento e no atraso (modelo
 * WABA real) -> Pix opcional ("Copiar código Pix") -> sem custo a mais -> a baixa é com
 * você (trechos reais do TutorialParcelas) -> a cobrança automática faz até isso
 * (comparação, taxa só como detalhe) -> slogan.
 */
const FALAS: Array<[string, number]> = [
  ["Cansou de mandar mensagem cobrando pai todo mês?", 103],
  ["Com o lembrete automático do Van360, o app avisa os pais por você.", 160],
  ["No dia do vencimento, e se atrasar, o pai recebe a mensagem no WhatsApp com o valor certinho.", 192],
  ["Se quiser, a mensagem já vai com a sua chave Pix, pronta pra copiar.", 138],
  ["E não tem custo a mais: já faz parte da sua assinatura.", 111],
  ["Como o dinheiro cai direto na sua conta, a baixa é com você: registra o pagamento no app e manda o recibo pro pai.", 207],
  ["Quer que o app faça até isso? Na cobrança automática, o Pix dá baixa sozinho e o recibo chega na hora.", 204],
  ["Você dirige. A gente organiza.", 115],
];
export const BEATS: Beat[] = (() => {
  let t = 0;
  return FALAS.map(([text, duration]) => {
    const b = { text, from: t, duration };
    t += duration;
    return b;
  });
})();
export const LEMBRETE_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const LEN = (n: number) => BEATS[n - 1].duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const F = 6; // a fala começa 6 quadros depois do beat
const VERDE = "#16a34a";
const CINZA = "#94a3b8";

const PAI = "Rodrigo";
const ALUNO = "Davi";
const VALOR = "R$ 280,00";

/* ------------------------------------------------------------------ */
/* 1. Gancho: o WhatsApp lotando                                        */
/* ------------------------------------------------------------------ */
const Gancho: React.FC = () => (
  <AbsoluteFill>
    <Manchete text="Cansou de **cobrar pai**?" ate={LEN(1)} />
    <WhatsLotado />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* 2. Virada: logo + Lembrete automático                                */
/* ------------------------------------------------------------------ */
const V = { nome: F + 26, sub: F + 92 };
const Virada: React.FC = () => {
  const logo = useSpring(2, { damping: 11, mass: 0.7 });
  const nome = useSpring(V.nome, { damping: 13, mass: 0.6 });
  const sub = useSpring(V.sub, { damping: 14, mass: 0.6 });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 520,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 65%)",
          scale: String(logo),
        }}
      />
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 680, width: 600, scale: String(0.4 + 0.6 * logo), opacity: logo }} />
      <div
        style={{
          position: "absolute",
          top: 910,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          color: BRAND.navy,
        }}
      >
        <div style={{ fontSize: 96, letterSpacing: "-0.03em", lineHeight: 1.05, opacity: nome, scale: String(0.8 + 0.2 * nome) }}>
          🔔 <Destaque text="Lembrete **automático**" />
        </div>
        <div style={{ fontSize: 50, color: "#475569", marginTop: 26, opacity: sub, translate: `0px ${(1 - sub) * 30}px` }}>
          o app avisa os pais por você
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3 + 4. A mensagem no WhatsApp do pai (uma só), depois com o Pix      */
/* ------------------------------------------------------------------ */
const L3 = LEN(3);
const M = {
  venc: F + 6,
  atraso: F + 50,
  chega: F + 74,
  valor: F + 150,
  pix: L3 + F + 72,
  copia: L3 + F + 108,
};
const Chip: React.FC<{ texto: string; em: number }> = ({ texto, em }) => {
  const s = useSpring(em, { damping: 12, mass: 0.5 });
  return (
    <div
      style={{
        padding: "14px 30px",
        borderRadius: 999,
        background: "white",
        border: `3px solid ${BRAND.blue}`,
        color: BRAND.navy,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 36,
        boxShadow: "0 8px 24px rgba(37,99,235,0.15)",
        opacity: s,
        scale: String(0.6 + 0.4 * s),
      }}
    >
      {texto}
    </div>
  );
};
const Mensagem: React.FC = () => {
  const frame = useCurrentFrame();
  const msg = useSpring(M.chega, { damping: 14, mass: 0.7 });
  const pix = useSpring(M.pix, { damping: 10, mass: 0.5 });
  const copiado = useSpring(M.copia + 4, { damping: 12, mass: 0.5 });
  const opcional = useSpring(M.pix + 10, { damping: 12, mass: 0.5 });
  const brilho = interpolate(frame, [M.valor, M.valor + 8, M.valor + 40, M.valor + 50], [0, 1, 1, 0], clamp);
  const comPix = frame >= M.pix;
  const bump = comPix ? 1 + 0.04 * Math.sin(Math.min(1, pix) * Math.PI) : 1;
  return (
    <AbsoluteFill>
      <Manchete text="O pai é **lembrado sozinho**" ate={L3} size={72} />
      <Manchete text="Pix **pronto pra copiar**" de={L3} ate={L3 + LEN(4)} size={72} />
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
        <Chip texto="🔔 No vencimento" em={M.venc} />
        <Chip texto="⏰ Se atrasar" em={M.atraso} />
      </div>
      {frame >= M.chega - 2 && (
        <AbsoluteFill style={{ alignItems: "center", top: 660 }}>
          <div style={{ width: 330, scale: String(2.7 * (0.9 + 0.1 * msg) * bump), opacity: msg, transformOrigin: "50% 0%", position: "relative" }}>
            <WabaMessage motorista={MOTORISTA.apelido} hora="07:00" comPix={comPix}>
              {WABA_MODELOS.venceHoje({ responsavel: PAI, aluno: ALUNO, valor: VALOR })}
            </WabaMessage>
            {/* destaque no valor */}
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                top: 30,
                height: 58,
                borderRadius: 8,
                border: `2px solid ${BRAND.blue}`,
                background: "rgba(37,99,235,0.06)",
                opacity: brilho,
              }}
            />
            {comPix && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 33, height: 0 }}>
                <Toque em={M.copia} size={36} />
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}
      {comPix && frame < M.copia + 4 && (
        <div style={{ position: "absolute", top: 1440, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "14px 30px",
              borderRadius: 999,
              background: "#eef3ff",
              color: BRAND.blue,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 34,
              opacity: opcional,
              scale: String(0.7 + 0.3 * opcional),
            }}
          >
            Opcional: você escolhe
          </div>
        </div>
      )}
      {frame >= M.copia + 4 && (
        <div style={{ position: "absolute", top: 1440, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "16px 34px",
              borderRadius: 999,
              background: BRAND.navy,
              color: "white",
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 36,
              opacity: copiado,
              translate: `0px ${(1 - copiado) * 30}px`,
            }}
          >
            ✓ Código Pix copiado
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Sem custo a mais                                                  */
/* ------------------------------------------------------------------ */
const S = { card: 4, inclui: F + 44 };
const SemCusto: React.FC = () => {
  const card = useSpring(S.card, { damping: 12, mass: 0.6 });
  const inclui = useSpring(S.inclui, { damping: 11, mass: 0.5 });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Manchete text="**Sem custo** a mais" ate={LEN(5)} />
      <div
        style={{
          position: "absolute",
          top: 600,
          width: 860,
          padding: "60px 50px",
          borderRadius: 48,
          background: "white",
          boxShadow: "0 30px 80px rgba(11,26,46,0.14)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: card,
          scale: String(0.85 + 0.15 * card),
        }}
      >
        <div style={{ fontSize: 120, lineHeight: 1 }}>🔔</div>
        <div style={{ marginTop: 24, fontFamily: "Manrope", fontWeight: 800, fontSize: 64, color: BRAND.navy }}>Lembrete automático</div>
        <div style={{ marginTop: 18, fontFamily: "Manrope", fontWeight: 800, fontSize: 130, color: BRAND.blue, letterSpacing: "-0.04em" }}>R$ 0</div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: "#64748b" }}>a mais por isso</div>
        <div
          style={{
            marginTop: 40,
            padding: "18px 34px",
            borderRadius: 999,
            background: "#dcfce7",
            color: "#15803d",
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 40,
            opacity: inclui,
            scale: String(0.6 + 0.4 * inclui),
          }}
        >
          ✓ Já faz parte da sua assinatura
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 6. A baixa é com você (trechos reais do tutorial de Parcelas)        */
/* ------------------------------------------------------------------ */
const P = { registra: 60, recibo: 166 };
const TRECHOS: Trecho[] = [
  { em: P.registra, Comp: TutorialParcelas, de: 522, len: P.recibo - P.registra }, // registrar o pagamento
  { em: P.recibo, Comp: TutorialParcelas, de: 780, len: LEN(6) - P.recibo }, // o recibo pronto
];
const PixNaConta: React.FC = () => {
  const frame = useCurrentFrame();
  const chega = useSpring(8, { damping: 13, mass: 0.6 });
  const sai = interpolate(frame, [P.registra - 8, P.registra], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: sai }}>
      <Pilula texto="Sua conta" top={620} />
      <div
        style={{
          position: "absolute",
          top: 740,
          width: 860,
          padding: "34px 40px",
          borderRadius: 40,
          background: "white",
          boxShadow: "0 24px 60px rgba(11,26,46,0.14)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          opacity: chega,
          translate: `0px ${(1 - chega) * -160}px`,
        }}
      >
        <div style={{ width: 110, height: 110, borderRadius: 30, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>💸</div>
        <div style={{ fontFamily: "Inter" }}>
          <div style={{ fontSize: 34, color: "#64748b", fontWeight: 600 }}>Pix recebido de {PAI}</div>
          <div style={{ fontSize: 76, color: VERDE, fontWeight: 800, fontFamily: "Manrope" }}>+ {VALOR}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const BaixaComVoce: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {frame < P.registra && <PixNaConta />}
      {TRECHOS.map((t) => (
        <Sequence key={t.em} from={t.em} durationInFrames={t.len} layout="none">
          <TrechoTutorial t={t} />
        </Sequence>
      ))}
      <Manchete text="Cai **direto pra você**" ate={P.registra} />
      <Manchete text="A baixa é **com você**" de={P.registra} ate={LEN(6) + 999} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Comparação: a cobrança automática faz até isso                    */
/* ------------------------------------------------------------------ */
const K = { destaca: F + 58, baixa: F + 108, recibo: F + 150 };
const LINHAS: Array<{ txt: string; lembrete: boolean | string; em: number }> = [
  { txt: "Lembra o pai no WhatsApp", lembrete: true, em: 0 },
  { txt: "Pix pronto pra copiar", lembrete: "opcional", em: 0 },
  { txt: "Dá baixa sozinho", lembrete: false, em: K.baixa },
  { txt: "Recibo chega na hora", lembrete: false, em: K.recibo },
];
const Marca: React.FC<{ v: boolean | string; em?: number }> = ({ v, em = 0 }) => {
  const s = useSpring(em, { damping: 10, mass: 0.5 });
  const visivel = em === 0 ? 1 : s;
  if (typeof v === "string")
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: 50, color: VERDE, fontWeight: 800 }}>✓</span>
        <span style={{ fontSize: 22, color: "#64748b", fontWeight: 600, marginTop: -6 }}>{v}</span>
      </div>
    );
  return (
    <span style={{ fontSize: 50, fontWeight: 800, color: v ? VERDE : CINZA, opacity: visivel, scale: String(em === 0 ? 1 : 0.4 + 0.6 * s) }}>
      {v ? "✓" : "✗"}
    </span>
  );
};
const Comparacao: React.FC = () => {
  const frame = useCurrentFrame();
  const tabela = useSpring(4, { damping: 13, mass: 0.6 });
  const destaca = useSpring(K.destaca, { damping: 12, mass: 0.6 });
  const COL = 210;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Manchete text="Quer que o app faça **até isso**?" ate={K.destaca - 4} size={68} />
      <Manchete text="Cobrança **automática**" de={K.destaca - 4} ate={LEN(7) + 999} />
      <div
        style={{
          position: "absolute",
          top: 540,
          width: 960,
          borderRadius: 40,
          background: "white",
          boxShadow: "0 24px 70px rgba(11,26,46,0.14)",
          padding: "26px 30px 30px",
          fontFamily: "Inter",
          opacity: tabela,
          translate: `0px ${(1 - tabela) * 60}px`,
        }}
      >
        {/* coluna em destaque (cobrança automática) */}
        <div
          style={{
            position: "absolute",
            top: 14,
            bottom: 14,
            right: 24,
            width: COL,
            borderRadius: 28,
            background: "rgba(37,99,235,0.08)",
            border: `4px solid ${BRAND.blue}`,
            opacity: destaca,
            scale: String(0.9 + 0.1 * destaca),
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", paddingBottom: 18, borderBottom: "2px solid #e2e8f0" }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: COL, textAlign: "center", fontWeight: 800, fontSize: 30, color: BRAND.navy, lineHeight: 1.15 }}>
            Lembrete
            <br />
            automático
          </div>
          <div style={{ width: COL, textAlign: "center", fontWeight: 800, fontSize: 30, color: BRAND.blue, lineHeight: 1.15 }}>
            Cobrança
            <br />
            automática
          </div>
        </div>
        {LINHAS.map((l, i) => {
          const ativa = l.em > 0 && frame >= l.em;
          return (
            <div
              key={l.txt}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                height: 124,
                borderBottom: i < LINHAS.length - 1 ? "2px solid #f1f5f9" : undefined,
              }}
            >
              <div style={{ flex: 1, fontSize: 38, fontWeight: 700, color: ativa ? BRAND.navy : "#334155", paddingLeft: 10 }}>{l.txt}</div>
              <div style={{ width: COL, display: "flex", justifyContent: "center" }}>
                <Marca v={l.lembrete} />
              </div>
              <div style={{ width: COL, display: "flex", justifyContent: "center" }}>
                <Marca v={true} em={l.em} />
              </div>
            </div>
          );
        })}
        {/* detalhe pequeno: custo de cada um */}
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", paddingTop: 16, fontSize: 22, color: "#64748b", fontWeight: 600 }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: COL, textAlign: "center" }}>sem custo a mais</div>
          <div style={{ width: COL, textAlign: "center" }}>pequena taxa por Pix recebido</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Fechamento                                                        */
/* ------------------------------------------------------------------ */
const Z = { organiza: F + 34 };
const Fechamento: React.FC = () => {
  const logo = useSpring(2, { damping: 11, mass: 0.7 });
  return (
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
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 760, width: 560, opacity: logo, scale: String(0.5 + 0.5 * logo) }} />
      <Sequence from={0} layout="none">
        <SloganLinhas />
      </Sequence>
    </AbsoluteFill>
  );
};
const SloganLinhas: React.FC = () => {
  const l1 = useSpring(F, { damping: 13, mass: 0.6 });
  const l2 = useSpring(Z.organiza, { damping: 13, mass: 0.6 });
  const base: React.CSSProperties = { fontFamily: "Manrope", fontWeight: 800, fontSize: 84, letterSpacing: "-0.03em", color: BRAND.navy, textAlign: "center" };
  return (
    <div style={{ position: "absolute", top: 1000, left: 60, right: 60 }}>
      <div style={{ ...base, opacity: l1, translate: `0px ${(1 - l1) * 30}px` }}>Você dirige.</div>
      <div style={{ ...base, opacity: l2, translate: `0px ${(1 - l2) * 30}px` }}>
        <Destaque text="A gente **organiza**." />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  // 1
  ...CHEGA.map((c): SfxEvent => ({ at: c, sfx: "pop", volume: 0.35 })),
  // 2
  { at: B[2], sfx: "whoosh", volume: 0.6 },
  { at: B[2] + 4, sfx: "chime", volume: 0.55 },
  { at: B[2] + V.nome, sfx: "pop", volume: 0.5 },
  // 3 e 4
  { at: B[3], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[3] + M.venc, sfx: "select", volume: 0.6 },
  { at: B[3] + M.atraso, sfx: "select", volume: 0.6 },
  { at: B[3] + M.chega - 2, sfx: "vibra", volume: 0.4 },
  { at: B[3] + M.chega, sfx: "notif", volume: 0.65 },
  { at: B[3] + M.pix, sfx: "pop", volume: 0.6 },
  { at: B[3] + M.copia, sfx: "tap" },
  { at: B[3] + M.copia + 4, sfx: "pop", volume: 0.55 },
  // 5
  { at: B[5], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[5] + S.inclui, sfx: "success", volume: 0.6 },
  // 6 (os toques vêm dos próprios trechos do tutorial)
  { at: B[6], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[6] + 8, sfx: "success", volume: 0.5 },
  { at: B[6] + P.registra, sfx: "whoosh", volume: 0.5 },
  { at: B[6] + P.recibo, sfx: "whoosh", volume: 0.5 },
  // 7
  { at: B[7], sfx: "whoosh", volume: 0.5 },
  { at: B[7] + K.destaca, sfx: "select", volume: 0.6 },
  { at: B[7] + K.baixa, sfx: "pop", volume: 0.6 },
  { at: B[7] + K.recibo, sfx: "pop", volume: 0.6 },
  // 8
  { at: B[8], sfx: "whoosh", volume: 0.5 },
  { at: B[8] + Z.organiza, sfx: "chime", volume: 0.6 },
];

type Bloco = { Comp: React.FC; de: number; ate: number };
const BLOCOS: Bloco[] = [
  { Comp: Gancho, de: 1, ate: 1 },
  { Comp: Virada, de: 2, ate: 2 },
  { Comp: Mensagem, de: 3, ate: 4 },
  { Comp: SemCusto, de: 5, ate: 5 },
  { Comp: BaixaComVoce, de: 6, ate: 6 },
  { Comp: Comparacao, de: 7, ate: 7 },
  { Comp: Fechamento, de: 8, ate: 8 },
];

export const LembreteAutomatico: React.FC = () => (
  <BrandBackground>
    {BLOCOS.map(({ Comp, de, ate }, i) => {
      const len = B[ate] + LEN(ate) - B[de];
      const ultimo = i === BLOCOS.length - 1;
      return (
        <Sequence key={de} from={B[de]} durationInFrames={len} name={`Cena ${de}${ate > de ? `-${ate}` : ""}`}>
          {ultimo ? (
            <AbsoluteFill>
              <Comp />
            </AbsoluteFill>
          ) : (
            <Cena len={len}>
              <Comp />
            </Cena>
          )}
        </Sequence>
      );
    })}
    <Narracao pasta="lembrete" beats={BEATS} />
    <Sfx events={SFX} />
  </BrandBackground>
);
