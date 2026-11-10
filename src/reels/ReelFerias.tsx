import React, { createContext, useContext, useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Routes, Route } from "react-router-dom";
import { Check, Wallet, X } from "lucide-react";
import AssinarContrato from "@/pages/AssinarContrato";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { Finger } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { PEDRO_ID } from "../mocks/data";
import { Destacado, Fundo } from "./ReelPais";

/**
 * Reel "Pai não paga as férias?" (transportador escolar, sem a palavra "tio").
 * Só a voz do Thiago (ElevenLabs), uma fala por cena, em public/reel-ferias/g1..g6.mp3.
 * Tempos: DUR = duração real de cada fala; as legendas usam as pausas medidas em cada áudio
 * (ffmpeg silencedetect), em segundos a partir do início da fala.
 * Objetivo: seguidor. Fechamento chama para seguir @van360.oficial (sem preço, sem CTA de site).
 *
 * 1080x1920. Áreas cobertas pelo Reels: topo ~220px, rodapé ~420px, lateral direita ~140px.
 */

const FPS = 30;
const NAVY = "#0b1a2e";
const AMBER = "#FFB300";
const WHATS = "#25d366";
const BLUE = "#2563eb";

const DUR = [5.8, 7.16, 12.93, 6.35, 11.81, 2.04];
const START = 0.1;
const GAP = 0.35;
const f = (s: number) => Math.round(s * FPS);
const FADE = 6;

const L: number[] = (() => {
  let t = START;
  return DUR.map((d) => {
    const x = f(t);
    t += d + GAP;
    return x;
  });
})();
const FIM = L[5] + f(DUR[5]) + f(2.2);
export const REEL_FERIAS_DURATION = FIM;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};

/* ---------- tempo local (frames desde o início da fala da cena) ---------- */
const Off = createContext(0);
const useT = () => useCurrentFrame() - useContext(Off);

const Cena: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const from = i === 0 ? 0 : L[i] - FADE;
  const to = i === 5 ? FIM : L[i + 1];
  const dur = to - from;
  return (
    <Sequence from={from} durationInFrames={dur} name={`Cena ${i + 1}`}>
      <Off.Provider value={L[i] - from}>
        <Fade dur={dur} entra={i > 0} sai={i < 5}>
          {children}
        </Fade>
      </Off.Provider>
    </Sequence>
  );
};

const Fade: React.FC<{ dur: number; entra: boolean; sai: boolean; children: React.ReactNode }> = ({ dur, entra, sai, children }) => {
  const frame = useCurrentFrame();
  const a = entra ? interpolate(frame, [0, FADE], [0, 1], clamp) : 1;
  const b = sai ? interpolate(frame, [dur - FADE, dur], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{ opacity: Math.min(a, b) }}>{children}</AbsoluteFill>;
};

/* ---------- peças ---------- */
type Trecho = { de: number; ate: number; texto: string; grande?: boolean };

/** Legenda por trecho (segundos a partir do início da fala). */
const Legenda: React.FC<{ trechos: Trecho[]; top?: number; tamanho?: number }> = ({ trechos, top = 1240, tamanho = 60 }) => {
  const t = useT();
  const atual = trechos.find((x) => t >= f(x.de) - 2 && t < f(x.ate) + 2);
  if (!atual) return null;
  const op = interpolate(t, [f(atual.de), f(atual.de) + 5, f(atual.ate) - 3, f(atual.ate)], [0, 1, 1, 0.9], clamp);
  const grande = atual.grande;
  const pulso = grande ? 1 + 0.05 * Math.sin((t - f(atual.de)) / 3) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top,
        opacity: op,
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: grande ? tamanho * 2.1 : tamanho,
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
        color: grande ? AMBER : "white",
        textShadow: "0 4px 24px rgba(0,0,0,0.6)",
        textWrap: "balance",
        scale: String(pulso),
      }}
    >
      <Destacado texto={atual.texto} />
    </div>
  );
};

/** Etiqueta âmbar + título da cena (zona segura: abaixo de 250px). */
const Cabecalho: React.FC<{ titulo: string }> = ({ titulo }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: t + 6, fps, config: { damping: 15, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", top: 250, left: 120, right: 120, textAlign: "center", opacity: entra }}>
      <div
        style={{
          display: "inline-block",
          padding: "12px 30px",
          borderRadius: 999,
          background: AMBER,
          color: NAVY,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: "0.05em",
        }}
      >
        TRANSPORTADOR ESCOLAR
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: "white",
          scale: String(0.92 + 0.08 * entra),
        }}
      >
        <Destacado texto={titulo} />
      </div>
    </div>
  );
};

const pop = (t: number, quando: number, fps: number) => spring({ frame: t - f(quando), fps, config: { damping: 13, stiffness: 170 } });

/* ---------- cena 1: a mensagem do pai ---------- */
const Cena1: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const p = pop(t, 0.1, fps);
  return (
    <AbsoluteFill>
      <Cabecalho titulo="Férias de **janeiro**" />
      <div style={{ position: "absolute", top: 700, left: 120, right: 120, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 800,
            opacity: Math.max(0, Math.min(1, p)),
            translate: `0 ${(1 - Math.min(1, p)) * 60}px`,
            background: "white",
            borderRadius: "10px 44px 44px 44px",
            padding: "26px 36px 20px",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
          }}
        >
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32, color: "#1f9d55", marginBottom: 8 }}>Pai do Lucas</div>
          <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 48, lineHeight: 1.3, color: "#111b21" }}>
            Meu filho não tem aula em janeiro, então não vou pagar.
          </div>
          <div style={{ fontFamily: "Inter", fontSize: 26, color: "#667781", textAlign: "right", marginTop: 6 }}>08:15</div>
        </div>
      </div>
      <Legenda
        trechos={[
          { de: 0, ate: 2.8, texto: "“Meu filho não tem aula em janeiro, então **não vou pagar**.”" },
          { de: 3.3, ate: 5.8, texto: "Transportador escolar, **você já ouviu isso**?" },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- grade de meses / parcelas ---------- */
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Chip: React.FC<{ rotulo: string; estado: "paga" | "nao" | "neutro"; entra: number }> = ({ rotulo, estado, entra }) => {
  const e = Math.max(0, Math.min(1, entra));
  const cor = estado === "paga" ? BLUE : estado === "nao" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.14)";
  return (
    <div
      style={{
        width: 196,
        height: 118,
        borderRadius: 28,
        background: cor,
        border: estado === "nao" ? "2px dashed rgba(255,255,255,0.35)" : "2px solid rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity: e,
        scale: String(0.8 + 0.2 * e),
        color: estado === "nao" ? "rgba(255,255,255,0.55)" : "white",
      }}
    >
      <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 40 }}>{rotulo}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter", fontWeight: 700, fontSize: 26 }}>
        {estado === "paga" ? (
          <>
            <Check style={{ width: 28, height: 28 }} strokeWidth={3.4} /> paga
          </>
        ) : estado === "nao" ? (
          <>
            <X style={{ width: 28, height: 28 }} strokeWidth={3.4} /> sem aula
          </>
        ) : (
          "parcela"
        )}
      </span>
    </div>
  );
};

const Grade: React.FC<{ itens: Array<{ rotulo: string; estado: "paga" | "nao" | "neutro"; entra: number }> }> = ({ itens }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 196px)", gap: 20 }}>
    {itens.map((it, i) => (
      <Chip key={i} {...it} />
    ))}
  </div>
);

/* ---------- cena 2: o que o pai ACHA ---------- */
const Cena2: React.FC = () => {
  const t = useT();
  const sem = (m: string) => m === "Jan" || m === "Jul";
  return (
    <AbsoluteFill>
      <Cabecalho titulo="O que o pai **acha**" />
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Grade
          itens={MESES.map((m, i) => ({
            rotulo: m,
            // até "só pelo que usa" todos parecem "paga só quando usa"; depois as férias ficam sem aula
            estado: sem(m) && t >= f(4.3) ? "nao" : "neutro",
            entra: interpolate(t, [f(0.3) + i * 3, f(0.3) + i * 3 + 8], [0, 1], clamp),
          })).map((x) => ({ ...x, estado: x.estado as "neutro" | "nao" }))}
        />
      </div>
      <Legenda
        trechos={[
          { de: 0, ate: 4.0, texto: "Isso acontece porque o pai “**ACHA**” que paga **mês a mês**, só pelo que usa." },
          { de: 4.3, ate: 7.16, texto: "Aí chegam as férias, e ele acha que **não deve nada**." },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- cena 3: o combinado é parcela ---------- */
const Pilula: React.FC<{ texto: string; destaque?: boolean; entra: number }> = ({ texto, destaque, entra }) => {
  const e = Math.max(0, Math.min(1, entra));
  return (
    <div
      style={{
        opacity: e,
        translate: `0 ${(1 - e) * 40}px`,
        padding: "26px 56px",
        borderRadius: 999,
        background: destaque ? AMBER : "rgba(255,255,255,0.12)",
        color: destaque ? NAVY : "white",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 62,
        border: destaque ? "none" : "2px solid rgba(255,255,255,0.18)",
        boxShadow: destaque ? "0 24px 50px -14px rgba(255,179,0,0.5)" : "none",
      }}
    >
      {texto}
    </div>
  );
};

const Cena3: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const mostraGrade = t < f(5.0) || t >= f(8.7);
  const checks = t >= f(8.7);
  const cardEntra = pop(t, 1.95, fps);
  const gradeEntra = (i: number) => interpolate(t, [f(3.0) + i * 3, f(3.0) + i * 3 + 8], [0, 1], clamp);
  const pilulas = interpolate(t, [f(4.8), f(5.2)], [0, 1], clamp) * interpolate(t, [f(8.4), f(8.8)], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Cabecalho titulo="O que está **combinado**" />
      {/* valor do ano */}
      {t >= f(1.9) && t < f(3.0) && (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, cardEntra), scale: String(0.8 + 0.2 * Math.min(1, cardEntra)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "36px 60px", borderRadius: 40, background: "white", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)" }}>
            <Wallet style={{ width: 80, height: 80, color: BLUE }} strokeWidth={2.2} />
            <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 72, color: NAVY }}>Valor do ano</span>
          </div>
        </div>
      )}
      {/* parcelas */}
      {mostraGrade && t >= f(3.0) && (
        <div style={{ position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Grade
            itens={Array.from({ length: 12 }).map((_, i) => ({
              rotulo: `${i + 1}ª`,
              estado: (checks && t >= f(8.9) + i * 4 ? "paga" : "neutro") as "paga" | "neutro",
              entra: gradeEntra(i),
            }))}
          />
        </div>
      )}
      {/* 10, 11, 12 */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 34, opacity: pilulas }}>
        <Pilula texto="10 parcelas" entra={t >= f(5.8) ? 1 : 0} />
        <Pilula texto="11 parcelas" entra={t >= f(6.7) ? 1 : 0} />
        <Pilula texto="12 parcelas · a maioria" destaque entra={t >= f(7.5) ? 1 : 0} />
      </div>
      <Legenda
        trechos={[
          { de: 0, ate: 1.9, texto: "Mas o seu combinado não é esse." },
          { de: 1.95, ate: 4.4, texto: "É um valor do ano, dividido em **parcelas**." },
          { de: 4.5, ate: 8.5, texto: "Tem transportador que divide em 10, outros em 11, a **maioria em 12**." },
          { de: 8.7, ate: 12.93, texto: "É como uma compra parcelada: você paga todas, **tendo férias ou não**." },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- cena 4: "mês a mês" x parcela ---------- */
const Cena4: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const a = pop(t, 0.2, fps);
  const b = pop(t, 3.3, fps);
  const apagou = interpolate(t, [f(3.2), f(3.6)], [1, 0.35], clamp);
  return (
    <AbsoluteFill>
      <Cabecalho titulo="A conversa **muda**" />
      <div style={{ position: "absolute", top: 660, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 40 }}>
        <div
          style={{
            opacity: Math.min(1, a) * apagou,
            padding: "40px 44px",
            borderRadius: 36,
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <X style={{ width: 74, height: 74, color: "#f87171", flexShrink: 0 }} strokeWidth={3.4} />
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 56, lineHeight: 1.12, color: "white", textDecoration: t >= f(3.3) ? "line-through" : "none" }}>
            Pago mês a mês, só pelo que uso
          </span>
        </div>
        <div
          style={{
            opacity: Math.max(0, Math.min(1, b)),
            scale: String(0.9 + 0.1 * Math.min(1, Math.max(0, b))),
            padding: "40px 44px",
            borderRadius: 36,
            background: BLUE,
            display: "flex",
            alignItems: "center",
            gap: 28,
            boxShadow: "0 30px 60px -20px rgba(37,99,235,0.7)",
          }}
        >
          <Check style={{ width: 74, height: 74, color: AMBER, flexShrink: 0 }} strokeWidth={3.6} />
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 56, lineHeight: 1.12, color: "white" }}>Compra parcelada em 12x</span>
        </div>
      </div>
      <Legenda
        trechos={[
          { de: 0, ate: 3.0, texto: "Muitas vezes o ruído vem de **como a gente explica**." },
          { de: 3.25, ate: 6.35, texto: "Quando o pai entende que é **parcela**, a conversa muda." },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- cena 5: o contrato digital (tela real do app) ---------- */
const RolaMain: React.FC<{ y: number }> = ({ y }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const main = ref.current?.closest(".phone-screen")?.querySelector("main");
    const conteudo = main?.firstElementChild as HTMLElement | null;
    if (!main || !conteudo) return;
    const max = Math.max(0, conteudo.offsetHeight + 128 - main.clientHeight);
    conteudo.style.translate = `0px ${-Math.min(y, max)}px`;
  });
  return <div ref={ref} />;
};

const P = { assinar: { x: 195, y: 790 }, tocarParaAssinar: { x: 195, y: 420 }, confirmar: { x: 293, y: 692 } };
const A = { tocaAssinar: 222, abreDialogo: 228, tocaQuadro: 252, desenhaDe: 260, desenhaAte: 320, tocaConfirmar: 328, assinado: 336 };

const Cena5: React.FC = () => {
  const t = useT();
  const assinado = t >= A.assinado;
  const dialogo = t >= A.abreDialogo && !assinado;
  const editando = t >= A.tocaQuadro + 4;
  const progresso = interpolate(t, [A.desenhaDe, A.desenhaAte], [0, 1], clamp);
  const y = interpolate(t, [20, 190], [0, 640], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  const rotuloIn = interpolate(t, [6, 16], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 236, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: rotuloIn }}>
        <div style={{ padding: "10px 26px", borderRadius: 999, background: "#ecfdf5", color: "#047857", fontFamily: "Inter", fontWeight: 700, fontSize: 30, letterSpacing: "0.02em" }}>
          Celular do pai
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <VideoStateProvider value={{ assinar: { assinado }, assinatura: { editando, progresso } }}>
          <PhoneScreen
            key={`${assinado}-${dialogo}-${editando}`}
            route={`/assinar/tk-${PEDRO_ID}`}
            scale={1.1}
            showChrome={false}
            contentClassName="tela-cheia"
            overlay={
              <>
                <RolaMain y={y} />
                {dialogo && <SignatureDialog isOpen onClose={noop} onAssinar={noop} isSigning={false} sigCanvas={{ current: null }} />}
                <Finger
                  showFrom={A.tocaAssinar - 24}
                  hideAt={A.tocaQuadro + 8}
                  steps={[
                    { at: A.tocaAssinar - 24, ...P.assinar },
                    { at: A.tocaAssinar, ...P.assinar, tap: true },
                    { at: A.tocaQuadro, ...P.tocarParaAssinar, tap: true },
                  ]}
                />
                <Finger showFrom={A.desenhaAte + 2} hideAt={A.tocaConfirmar + 8} steps={[{ at: A.desenhaAte + 2, ...P.confirmar }, { at: A.tocaConfirmar, ...P.confirmar, tap: true }]} />
              </>
            }
          >
            <Routes>
              <Route path="/assinar/:token" element={<AssinarContrato />} />
            </Routes>
          </PhoneScreen>
        </VideoStateProvider>
      </AbsoluteFill>
      <Legenda
        top={1310}
        tamanho={52}
        trechos={[
          { de: 0, ate: 3.0, texto: "E nada deixa isso mais claro do que o **contrato**," },
          { de: 3.1, ate: 4.8, texto: "com o número de **parcelas** escrito." },
          { de: 5.0, ate: 7.2, texto: "Se você vai fazer os contratos do ano que vem," },
          { de: 7.3, ate: 10.2, texto: "dá pra fazer tudo **digital** no Van360," },
          { de: 10.3, ate: 11.81, texto: "e o pai **assina no celular**." },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- cena 6: fechamento ---------- */
const Cena6: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: t + 6, fps, config: { damping: 16, stiffness: 120 } });
  const botao = spring({ frame: t - f(0.7), fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: NAVY }} />
      <div style={{ position: "absolute", top: 330, left: 120, right: 120, textAlign: "center", opacity: entra }}>
        <div style={{ display: "inline-block", background: "white", borderRadius: 32, padding: "18px 30px", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}>
          <img src={staticFile("logo-van360-horizontal.png")} style={{ height: 76, display: "block" }} />
        </div>
        <div style={{ marginTop: 70, fontFamily: "Manrope", fontWeight: 800, fontSize: 92, lineHeight: 1.05, letterSpacing: "-0.035em", color: "white" }}>
          Contrato digital
          <br />
          <span style={{ color: AMBER }}>pra todos os alunos</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 940, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            scale: String(Math.max(botao, 0)),
            padding: "34px 64px",
            borderRadius: 999,
            background: AMBER,
            color: NAVY,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 58,
            boxShadow: "0 24px 50px -12px rgba(0,0,0,0.6)",
          }}
        >
          Siga @van360.oficial
        </div>
      </div>
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: "rgba(226,234,246,0.85)", opacity: Math.max(botao, 0) }}>
        Você dirige. A gente organiza.
      </div>
      <Legenda trechos={[{ de: 0, ate: 2.2, texto: "Segue o nosso **perfil no Instagram**." }]} />
    </AbsoluteFill>
  );
};

const temAudio = (n: string) => getStaticFiles().some((s) => s.name === `reel-ferias/${n}.mp3`);

export const ReelFerias: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Cena i={0}>
      <Cena1 />
    </Cena>
    <Cena i={1}>
      <Cena2 />
    </Cena>
    <Cena i={2}>
      <Cena3 />
    </Cena>
    <Cena i={3}>
      <Cena4 />
    </Cena>
    <Cena i={4}>
      <Cena5 />
    </Cena>
    <Cena i={5}>
      <Cena6 />
    </Cena>
    {DUR.map((_, i) =>
      temAudio(`g${i + 1}`) ? (
        <Sequence key={i} from={L[i]} name={`Voz ${i + 1}`}>
          <Audio src={staticFile(`reel-ferias/g${i + 1}.mp3`)} />
        </Sequence>
      ) : null,
    )}
  </AbsoluteFill>
);

/* ---------------- Capa (1080x1920; a grade do perfil mostra o miolo 3:4, y 240 a 1680) ---------------- */

export const CapaReelFerias: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <div style={{ position: "absolute", top: 380, left: 100, right: 100, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "14px 32px", borderRadius: 999, background: AMBER, color: NAVY, fontFamily: "Manrope", fontWeight: 800, fontSize: 34, letterSpacing: "0.05em" }}>
        TRANSPORTADOR ESCOLAR
      </div>
      <div style={{ marginTop: 44, fontFamily: "Manrope", fontWeight: 800, fontSize: 124, lineHeight: 1.02, letterSpacing: "-0.035em", color: "white" }}>
        Pai não paga
        <br />
        as <span style={{ color: AMBER }}>férias?</span>
      </div>
    </div>
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 760,
          rotate: "-1.5deg",
          background: "white",
          borderRadius: "10px 44px 44px 44px",
          padding: "26px 36px 20px",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: "#1f9d55", marginBottom: 8 }}>Pai do Lucas</div>
        <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 46, lineHeight: 1.3, color: "#111b21" }}>
          Meu filho não tem aula em janeiro, então não vou pagar.
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
