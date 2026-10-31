import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneScreen } from "../components/PhoneScreen";
import { BRAND, BrandBackground, ease } from "../components/brand";
import { Beat, SemLegenda, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { usarLarguraDeCelular } from "../viewport";
import { TutorialAlunosSolicitacoes } from "../tutoriais/TutorialAlunosSolicitacoes";
import { TutorialAlunosLista } from "../tutoriais/TutorialAlunosLista";
import { TutorialCarteirinha } from "../tutoriais/TutorialCarteirinha";
import { TutorialParcelas } from "../tutoriais/TutorialParcelas";
import { TutorialContratos } from "../tutoriais/TutorialContratos";
import { TutorialGastos } from "../tutoriais/TutorialGastos";

/**
 * Apresentação do app (lead no WhatsApp e landing page), ~57s, narração do Thiago.
 * Gancho (WhatsApp lotado) -> problemas (cartões) -> virada (logo + 500 motoristas)
 * -> soluções (trechos curtos dos tutoriais) -> lista do que resolve -> 15 dias grátis.
 * A legenda é uma MANCHETE curta por cena (não a fala inteira).
 */
export const BEATS: Beat[] = (() => {
  const lista: Array<[string, number]> = [
    ["Quanto tempo você perde todo mês cobrando pai no WhatsApp?", 122],
    ["Pix que não cai, comprovante perdido, pai pedindo recibo, contrato no papel… e no fim do mês você nem sabe quanto sobrou.", 272],
    ["O Van360 cuida dessa parte pra você. Mais de 500 motoristas já usam.", 186],
    ["Todo mês, o app avisa os pais no WhatsApp, com o seu Pix. Você não precisa lembrar ninguém.", 190],
    ["Pagou? Você vê na hora quem pagou e quem falta, e o recibo sai pronto.", 157],
    ["E os pais ainda te ajudam com o cadastro dos filhos. Você não faz tudo sozinho.", 157],
    ["O contrato, o pai assina pelo celular. Sem papel, sem correr atrás.", 157],
    ["Anota os gastos da van e vê quanto sobrou de verdade no mês.", 143],
    ["Menos tempo cobrando e conferindo. Mais tempo pra você.", 125],
    ["Teste 15 dias grátis, sem cartão. Você dirige. A gente organiza.", 198],
  ];
  let t = 0;
  return lista.map(([text, duration]) => {
    const b = { text, from: t, duration };
    t += duration;
    return b;
  });
})();
export const APRESENTACAO_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const LEN = (n: number) => BEATS[n - 1].duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SCALE = 1.45;
const PHONE_TOP = 540;
const FADE = 8;
const FALA = 6; // a fala começa 6 quadros depois do beat

/* ------------------------------------------------------------------ */
/* Manchete: 2 a 4 palavras por cena, no lugar da legenda              */
/* ------------------------------------------------------------------ */
const MANCHETES: Array<[number, string]> = [
  [1, "Cobrando pai no **WhatsApp**?"],
  [4, "Cobrança **automática**"],
  [5, "Quem pagou, **na hora**"],
  [6, "Os pais **te ajudam**"],
  [7, "Contrato **sem papel**"],
  [8, "Seu **lucro de verdade**"],
];

const Destaque: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") ? (
        <span key={i} style={{ color: BRAND.blue }}>
          {p.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

const Manchete: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atual = MANCHETES.find(([n]) => frame >= B[n] && frame < B[n] + LEN(n));
  if (!atual) return null;
  const [n, text] = atual;
  const local = frame - B[n];
  const s = spring({ frame: local - 2, fps, config: { damping: 13, mass: 0.6 } });
  const sai = interpolate(local, [LEN(n) - 8, LEN(n)], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 60,
        right: 60,
        height: 170,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 76,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: BRAND.navy,
        opacity: Math.min(s, sai),
        scale: String(0.85 + 0.15 * s),
      }}
    >
      <span>
        <Destaque text={text} />
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cena com fade/slide na entrada e na saída                           */
/* ------------------------------------------------------------------ */
const Cena: React.FC<{ len: number; children: React.ReactNode; slide?: boolean }> = ({ len, children, slide = true }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, FADE], [0, 1], { ...clamp, easing: ease });
  const sai = interpolate(frame, [len - FADE, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra, sai), translate: slide ? `${(1 - entra) * 140}px 0px` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

const Rotulo: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", top: PHONE_TOP - 74, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "10px 26px", borderRadius: 999, background: "#eef3ff", color: BRAND.blue, fontFamily: "Inter", fontWeight: 700, fontSize: 30 }}>{texto}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* 1. Gancho: o WhatsApp lotando de pai cobrando/perguntando            */
/* ------------------------------------------------------------------ */
const CONVERSAS = [
  { nome: "Mãe do Miguel", msg: "Tio, esse mês vou atrasar um pouquinho 🙏", hora: "07:12", n: 3 },
  { nome: "Pai da Sofia", msg: "Já paguei! Pode mandar o recibo?", hora: "07:30", n: 2 },
  { nome: "Mãe da Helena", msg: "Quanto ficou a parcela de março?", hora: "08:05", n: 1 },
  { nome: "Avó do Arthur", msg: "Tio, cadê o contrato pra eu assinar?", hora: "08:41", n: 4 },
  { nome: "Pai do Lucas", msg: "Esqueci de pagar, faço amanhã", hora: "09:02", n: 2 },
  { nome: "Mãe do Davi", msg: "Me passa o Pix de novo?", hora: "09:18", n: 1 },
  { nome: "Mãe da Laura", msg: "Já mandei o comprovante ontem", hora: "10:07", n: 5 },
  { nome: "Pai do Pedro", msg: "Tio, o Pix deu erro aqui", hora: "10:22", n: 2 },
  { nome: "Mãe da Alice", msg: "Pode me mandar o valor de novo?", hora: "10:40", n: 3 },
];
/** quadro em que cada conversa chega (a mais nova entra no topo) */
const CHEGA = CONVERSAS.map((_, i) => 4 + i * 10);

const TelaConversas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chegaram = CONVERSAS.map((c, i) => ({ c, i })).filter(({ i }) => frame >= CHEGA[i]).reverse();
  const naoLidas = chegaram.reduce((t, { c }) => t + c.n, 0);
  return (
    <PhoneScreen route="/" scale={SCALE} showChrome={false} contentClassName="">
      <div className="absolute inset-0 flex flex-col bg-white" style={{ fontFamily: "Inter" }}>
        <div className="px-4 pb-2.5 bg-white" style={{ paddingTop: 40 }}>
          <div className="flex items-center justify-between">
            <span className="text-[22px] font-bold text-[#111b21]">WhatsApp</span>
            {naoLidas > 0 && (
              <span className="h-6 px-2.5 rounded-full bg-[#25d366] text-white text-[12px] font-bold flex items-center">{naoLidas} não lidas</span>
            )}
          </div>
          <div className="mt-3 h-9 rounded-full bg-[#f0f2f5] px-4 flex items-center text-[13px] text-[#667781]">Pesquisar</div>
        </div>
        <div className="flex-1 overflow-hidden">
          {chegaram.map(({ c, i }) => {
            const s = spring({ frame: frame - CHEGA[i], fps, config: { damping: 15, mass: 0.5 } });
            return (
              <div
                key={c.nome}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f2f5]"
                style={{ opacity: s, translate: `0px ${(1 - s) * -30}px`, background: frame - CHEGA[i] < 12 ? "#f0fdf4" : "white" }}
              >
                <div className="h-11 w-11 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold">{c.nome.split(" ").pop()![0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-[#111b21]">{c.nome}</span>
                    <span className="text-[11px] text-[#25d366] font-medium">{c.hora}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[13px] text-[#667781] truncate">{c.msg}</span>
                    <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-[#25d366] text-white text-[11px] font-bold flex items-center justify-center">{c.n}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneScreen>
  );
};

const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sobe = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  // o celular treme a cada mensagem nova
  const ultima = Math.max(...CHEGA.filter((c) => frame >= c), -99);
  const treme = frame - ultima < 6 ? Math.sin((frame - ultima) * 2.6) * 7 * (1 - (frame - ultima) / 6) : 0;
  return (
    <>
      <Rotulo texto="Seu WhatsApp hoje" />
      <AbsoluteFill style={{ alignItems: "center", top: PHONE_TOP }}>
        <div style={{ translate: `${treme}px ${(1 - sobe) * 160}px`, rotate: `${treme * 0.15}deg` }}>
          <TelaConversas />
        </div>
      </AbsoluteFill>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Problemas: cartões no ritmo da fala                              */
/* ------------------------------------------------------------------ */
// tempos tirados das pausas da fala 2
const PROBLEMAS = [
  { at: FALA + 2, icone: "💸", texto: "Pix que não cai", x: -170, y: 470, rot: -4 },
  { at: FALA + 40, icone: "🧾", texto: "Comprovante perdido", x: 170, y: 690, rot: 3 },
  { at: FALA + 84, icone: "🙋", texto: "Pai pedindo recibo", x: -170, y: 910, rot: 3 },
  { at: FALA + 126, icone: "📄", texto: "Contrato no papel", x: 170, y: 1130, rot: -3 },
];
const SOBROU = FALA + 176;

const Problemas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pergunta = spring({ frame: frame - SOBROU, fps, config: { damping: 10, mass: 0.7 } });
  const apaga = interpolate(frame, [SOBROU, SOBROU + 10], [1, 0.35], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 270,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 70,
          letterSpacing: "-0.03em",
          color: BRAND.navy,
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        }}
      >
        Todo mês, <span style={{ color: "#dc2626" }}>a mesma dor</span>
      </div>
      {PROBLEMAS.map((p) => {
        const s = spring({ frame: frame - p.at, fps, config: { damping: 11, mass: 0.6 } });
        if (frame < p.at) return null;
        return (
          <div
            key={p.texto}
            style={{
              position: "absolute",
              left: 540 + p.x - 330,
              top: p.y,
              width: 660,
              padding: "34px 40px",
              borderRadius: 32,
              background: "white",
              boxShadow: "0 24px 50px -18px rgba(11,26,46,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontFamily: "Manrope",
              fontWeight: 800,
              fontSize: 54,
              lineHeight: 1.1,
              color: BRAND.navy,
              opacity: s * apaga,
              scale: String(0.6 + 0.4 * s),
              rotate: `${p.rot * s}deg`,
              translate: `0px ${(1 - s) * 60}px`,
            }}
          >
            <span style={{ fontSize: 84 }}>{p.icone}</span>
            {p.texto}
          </div>
        );
      })}
      {frame >= SOBROU && (
        <div
          style={{
            position: "absolute",
            top: 1370,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "Manrope",
            fontWeight: 800,
            color: "#dc2626",
            scale: String(0.5 + 0.5 * pergunta),
            opacity: pergunta,
          }}
        >
          <div style={{ fontSize: 150, lineHeight: 1 }}>R$ ???</div>
          <div style={{ fontSize: 58, color: BRAND.navy, marginTop: 18 }}>Quanto sobrou?</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Virada: o logo entra e o contador de motoristas sobe             */
/* ------------------------------------------------------------------ */
const CONTA = FALA + 100; // "Mais de quinhentos motoristas"
const Virada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 2, fps, config: { damping: 11, mass: 0.7 } });
  const frase = spring({ frame: frame - (FALA + 30), fps, config: { damping: 15 } });
  const cont = spring({ frame: frame - CONTA, fps, config: { damping: 15 } });
  const numero = Math.round(interpolate(frame, [CONTA, CONTA + 34], [0, 500], { ...clamp, easing: ease }));
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* brilho atrás do logo */}
      <div
        style={{
          position: "absolute",
          top: 560,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 65%)",
          scale: String(logo),
        }}
      />
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 760, width: 640, scale: String(0.4 + 0.6 * logo), opacity: logo }} />
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: BRAND.navy,
          opacity: frase,
          translate: `0px ${(1 - frase) * 30}px`,
        }}
      >
        <Destaque text="A gente **cuida disso** pra você" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1060,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          opacity: cont,
          translate: `0px ${(1 - cont) * 40}px`,
        }}
      >
        <div style={{ fontSize: 150, color: BRAND.blue, lineHeight: 1, letterSpacing: "-0.04em" }}>+{numero}</div>
        <div style={{ fontSize: 50, color: BRAND.navy, marginTop: 10 }}>motoristas já usam 🚐</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4 a 8. Soluções: trechos curtos dos tutoriais (telas reais)          */
/* ------------------------------------------------------------------ */
type Trecho = { em: number; Comp: React.FC; de: number; len: number };
const TRECHOS: Trecho[] = [
  { em: B[4], Comp: TutorialParcelas, de: 985, len: LEN(4) }, // lembretes no WhatsApp do pai, com o Pix
  { em: B[5], Comp: TutorialParcelas, de: 662, len: 95 }, // painel: quem pagou, quem falta
  { em: B[5] + 95, Comp: TutorialParcelas, de: 795, len: LEN(5) - 95 }, // recibo pronto
  { em: B[6], Comp: TutorialAlunosSolicitacoes, de: 285, len: 62 }, // o pai preenche o cadastro
  { em: B[6] + 62, Comp: TutorialAlunosLista, de: 150, len: 42 }, // a lista de alunos
  { em: B[6] + 104, Comp: TutorialCarteirinha, de: 85, len: LEN(6) - 104 }, // a carteirinha
  { em: B[7], Comp: TutorialContratos, de: 945, len: LEN(7) }, // o pai assina com o dedo
  { em: B[8], Comp: TutorialGastos, de: 752, len: LEN(8) }, // lucro de verdade
];

/** Um trecho de tutorial, sem a legenda e sem a narração dele, com fade curto. */
const TrechoTutorial: React.FC<{ t: Trecho }> = ({ t }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6, t.len - 6, t.len], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <SemLegenda.Provider value>
        <Sequence from={-t.de} layout="none">
          <t.Comp />
        </Sequence>
      </SemLegenda.Provider>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 9. O que o Van360 resolve: lista marcando ✓                          */
/* ------------------------------------------------------------------ */
const ITENS = ["Cobrança automática", "Recibo pronto", "Cadastro pelos pais", "Contrato sem papel", "Lucro de verdade"];
const MARCA = ITENS.map((_, i) => 8 + i * 14);
const MAIS_TEMPO = FALA + 70;

const Resolve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titulo = spring({ frame: frame - MAIS_TEMPO, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 270,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: BRAND.navy,
          opacity: titulo,
          scale: String(0.85 + 0.15 * titulo),
        }}
      >
        <Destaque text="Mais tempo **pra você**" />
      </div>
      <div style={{ position: "absolute", top: 560, display: "flex", flexDirection: "column", gap: 30 }}>
        {ITENS.map((item, i) => {
          const s = spring({ frame: frame - MARCA[i], fps, config: { damping: 12, mass: 0.6 } });
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "26px 40px 26px 28px",
                width: 760,
                borderRadius: 30,
                background: "white",
                boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: 50,
                color: BRAND.navy,
                opacity: s,
                translate: `${(1 - s) * -80}px 0px`,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  background: "#16a34a",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  scale: String(s),
                }}
              >
                ✓
              </div>
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 10. Fechamento: 15 dias grátis e o slogan                            */
/* ------------------------------------------------------------------ */
const SELO = FALA + 8;
const SLOGAN_1 = FALA + 84;
const SLOGAN_2 = FALA + 116;

const Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 2, fps, config: { damping: 14 } });
  const selo = spring({ frame: frame - SELO, fps, config: { damping: 10 } });
  const s1 = spring({ frame: frame - SLOGAN_1, fps, config: { damping: 14 } });
  const s2 = spring({ frame: frame - SLOGAN_2, fps, config: { damping: 14 } });
  const pulsa = 1 + 0.03 * Math.sin(Math.max(0, frame - SELO - 20) / 5);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 400, width: 560, scale: String(logo), opacity: logo }} />
      <div
        style={{
          position: "absolute",
          top: 640,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 70px",
          borderRadius: 48,
          background: BRAND.blue,
          color: "white",
          fontFamily: "Manrope",
          fontWeight: 800,
          scale: String(selo * pulsa),
          opacity: selo,
          boxShadow: "0 30px 60px -20px rgba(37,99,235,0.6)",
        }}
      >
        <div style={{ fontSize: 120, lineHeight: 1, letterSpacing: "-0.04em" }}>15 dias</div>
        <div style={{ fontSize: 58, marginTop: 8 }}>grátis · sem cartão</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1060,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 76,
          color: BRAND.navy,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        <div style={{ opacity: s1, translate: `0px ${(1 - s1) * 30}px` }}>Você dirige.</div>
        <div style={{ color: BRAND.blue, opacity: s2, translate: `0px ${(1 - s2) * 30}px` }}>A gente organiza.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  // gancho: cada mensagem chega com notificação; vibração no começo
  { at: 0, sfx: "vibra", volume: 0.5 },
  ...CHEGA.map((c, i): SfxEvent => ({ at: c, sfx: "notif", volume: 0.55 - i * 0.03 })),
  { at: CHEGA[4], sfx: "vibra", volume: 0.4 },
  // problemas
  { at: B[2], sfx: "whoosh", volume: 0.5 },
  ...PROBLEMAS.map((p): SfxEvent => ({ at: B[2] + p.at, sfx: "pop", volume: 0.7 })),
  { at: B[2] + SOBROU, sfx: "close", volume: 0.7 },
  // virada
  { at: B[3], sfx: "whoosh", volume: 0.7 },
  { at: B[3] + 4, sfx: "chime", volume: 0.55 },
  { at: B[3] + CONTA, sfx: "select", volume: 0.5 },
  { at: B[3] + CONTA + 34, sfx: "success", volume: 0.6 },
  // soluções: troca de cena
  ...[4, 5, 6, 7, 8].map((n): SfxEvent => ({ at: B[n], sfx: "whoosh-soft", volume: 0.5 })),
  // lista do que resolve
  { at: B[9], sfx: "whoosh", volume: 0.5 },
  ...MARCA.map((m): SfxEvent => ({ at: B[9] + m, sfx: "select", volume: 0.55 })),
  // fechamento
  { at: B[10], sfx: "whoosh", volume: 0.5 },
  { at: B[10] + SELO, sfx: "pop", volume: 0.7 },
  { at: B[10] + SLOGAN_2, sfx: "chime", volume: 0.6 },
];

/* ------------------------------------------------------------------ */

export const ApresentacaoApp: React.FC = () => {
  usarLarguraDeCelular();
  return (
    <BrandBackground>
      <Sequence from={0} durationInFrames={B[2]} name="Gancho">
        <Cena len={B[2]} slide={false}>
          <Gancho />
        </Cena>
      </Sequence>
      <Sequence from={B[2]} durationInFrames={LEN(2)} name="Problemas">
        <Cena len={LEN(2)}>
          <Problemas />
        </Cena>
      </Sequence>
      <Sequence from={B[3]} durationInFrames={LEN(3)} name="Virada">
        <Cena len={LEN(3)} slide={false}>
          <Virada />
        </Cena>
      </Sequence>
      {TRECHOS.map((t, i) => (
        <Sequence key={i} from={t.em} durationInFrames={t.len} name={`Trecho ${i + 1}`}>
          <TrechoTutorial t={t} />
        </Sequence>
      ))}
      <Sequence from={B[9]} durationInFrames={LEN(9)} name="Resolve">
        <Cena len={LEN(9)}>
          <Resolve />
        </Cena>
      </Sequence>
      <Sequence from={B[10]} name="Fechamento">
        <Cena len={LEN(10) + 99}>
          <Fechamento />
        </Cena>
      </Sequence>
      {/* manchete por cima de tudo (os trechos de tutorial trazem o próprio fundo) */}
      <Manchete />
      <Narracao pasta="apresentacao" beats={BEATS} />
      <Sfx events={SFX} />
    </BrandBackground>
  );
};
