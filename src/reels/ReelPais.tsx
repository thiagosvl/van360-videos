import React from "react";
import {
  AbsoluteFill, Audio, Img, Sequence, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Mic, Play } from "lucide-react";

/**
 * Reel "Toda van escolar ouve isso" (série: Coisas que todo tio escuta).
 * Objetivo: seguidor. Sem tela do app: áudios de pais chegando no WhatsApp do tio,
 * fechamento na voz do Thiago chamando para seguir.
 *
 * Falas geradas no ElevenLabs (eleven_v4) e colocadas em public/reel-pais/:
 *   f1..f5.mp3 (pais, vozes da biblioteca) e t6.mp3 (voz clonada do Thiago).
 * Os tempos abaixo usam a duração real de cada fala. Se trocar o take, ajuste `seg`.
 * Sem os arquivos, o vídeo renderiza sem som (útil para conferir a imagem).
 *
 * 1080x1920. Áreas cobertas pelo Reels: topo ~220px, rodapé ~420px, lateral direita ~140px.
 */

const FPS = 30;
const NAVY = "#0b1a2e";
const AMBER = "#FFB300";
const WHATS = "#25d366";

type Fala = { arquivo: string; nome: string; inicial: string; cor: string; hora: string; texto: string; seg: number };

export const FALAS: Fala[] = [
  { arquivo: "f1", nome: "Mãe da Ana", inicial: "A", cor: "#e879a7", hora: "06:12", texto: "Oi tio, bom dia! A Ana já embarcou?", seg: 3.56 },
  { arquivo: "f2", nome: "Pai do Davi", inicial: "D", cor: "#3b82f6", hora: "12:47", texto: "Fala, tio! Já mandei o Pix, confere aí, tá?", seg: 3.09 },
  { arquivo: "f3", nome: "Mãe do Miguel", inicial: "M", cor: "#a855f7", hora: "18:30", texto: "Ô tio... esqueci de pagar. Posso mandar semana que vem?", seg: 5.07 },
  { arquivo: "f4", nome: "Vó da Alice", inicial: "V", cor: "#f97316", hora: "21:40", texto: "Oi, tio... me passa a chave de novo? Não tô achando aqui.", seg: 4.44 },
  { arquivo: "f5", nome: "Pai do Enzo", inicial: "E", cor: "#14b8a6", hora: "23:05", texto: "Tio, desculpa o horário... manda o recibo de março?", seg: 3.87 },
];
const FECHO = { arquivo: "t6", seg: 7.0, partes: [
  { texto: "Se você ouviu pelo menos um desses essa semana...", ate: 3.3 },
  { texto: "segue a gente. Aqui é conteúdo pra quem vive o **transporte escolar.**", ate: 6.96 },
] };

const GANCHO = 2.0; // s antes do primeiro áudio
const ENTRE = 0.45; // s entre áudios
const f = (s: number) => Math.round(s * FPS);

/** Início (frame) de cada fala e do fechamento. */
const INICIOS = (() => {
  const out: number[] = [];
  let t = GANCHO;
  for (const fl of FALAS) {
    out.push(f(t));
    t += fl.seg + ENTRE;
  }
  out.push(f(t + 0.2));
  return out;
})();
const INICIO_FECHO = INICIOS[FALAS.length];
export const REEL_PAIS_DURATION = INICIO_FECHO + f(FECHO.seg) + f(2.2);

const temAudio = (nome: string) => getStaticFiles().some((s) => s.name === `reel-pais/${nome}.mp3`);

/** **palavra** em âmbar */
const Destacado: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") ? (
        <span key={i} style={{ color: AMBER }}>
          {p.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

const Fundo: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 1000,
        width: 1500,
        height: 1500,
        translate: "-50% -50%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.5) 0%, rgba(37,99,235,0.15) 40%, rgba(11,26,46,0) 70%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)",
        backgroundSize: "30px 30px",
        maskImage: "linear-gradient(to bottom, black 0%, transparent 40%)",
      }}
    />
  </AbsoluteFill>
);

/** Ondas do áudio: animadas enquanto toca, preenchidas conforme o progresso. */
const Onda: React.FC<{ progresso: number; tocando: boolean; frame: number }> = ({ progresso, tocando, frame }) => {
  const n = 34;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, height: 60, flex: 1 }}>
      {Array.from({ length: n }).map((_, i) => {
        const base = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6));
        const mexe = tocando ? 0.65 + 0.35 * Math.abs(Math.sin(frame / 3 + i)) : 1;
        const passou = i / n < progresso;
        return (
          <div
            key={i}
            style={{
              width: 7,
              height: 60 * base * mexe,
              borderRadius: 4,
              background: passou ? "#34b7f1" : "#c5ccd3",
            }}
          />
        );
      })}
    </div>
  );
};

/** Balão de áudio recebido no WhatsApp. */
const BalaoAudio: React.FC<{ fl: Fala; inicio: number }> = ({ fl, inicio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - inicio;
  const dur = f(fl.seg);
  const entra = spring({ frame: local, fps, config: { damping: 16, stiffness: 160 } });
  const progresso = Math.min(Math.max(local / dur, 0), 1);
  const tocando = local >= 0 && local < dur;
  const s = Math.ceil(fl.seg);
  return (
    <div
      style={{
        opacity: entra,
        translate: `0 ${(1 - entra) * 60}px`,
        alignSelf: "center",
        width: 780,
        background: "white",
        borderRadius: "10px 40px 40px 40px",
        padding: "22px 30px 16px 22px",
        boxShadow: tocando ? "0 30px 60px -20px rgba(0,0,0,0.7), 0 0 0 4px rgba(255,179,0,0.85)" : "0 24px 50px -24px rgba(0,0,0,0.7)",
      }}
    >
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: "#1f9d55", marginLeft: 8, marginBottom: 8 }}>{fl.nome}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 999,
              background: fl.cor,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Manrope",
              fontWeight: 800,
              fontSize: 44,
            }}
          >
            {fl.inicial}
          </div>
          <div
            style={{
              position: "absolute",
              right: -6,
              bottom: -4,
              width: 38,
              height: 38,
              borderRadius: 999,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mic style={{ width: 26, height: 26, color: tocando || progresso >= 1 ? "#34b7f1" : WHATS }} strokeWidth={2.6} />
          </div>
        </div>
        <Play style={{ width: 46, height: 46, color: "#54656f", fill: "#54656f", flexShrink: 0 }} />
        <Onda progresso={progresso} tocando={tocando} frame={frame} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingLeft: 118 }}>
        <span style={{ fontFamily: "Inter", fontSize: 26, color: "#667781" }}>0:0{s}</span>
        <span style={{ fontFamily: "Inter", fontSize: 26, color: "#667781" }}>{fl.hora}</span>
      </div>
    </div>
  );
};

/** Legenda grande da fala atual. */
const Legenda: React.FC<{ texto: string; de: number; ate: number }> = ({ texto, de, ate }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [de, de + 5, ate - 4, ate], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: 1240,
        opacity: op,
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 60,
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
        color: "white",
        textShadow: "0 4px 24px rgba(0,0,0,0.6)",
        textWrap: "balance",
      }}
    >
      “<Destacado texto={texto} />”
    </div>
  );
};

/** Pilha de balões: mostra os últimos 3, os antigos sobem e somem. */
const Conversa: React.FC = () => {
  const frame = useCurrentFrame();
  const atual = INICIOS.slice(0, FALAS.length).filter((i) => frame >= i).length - 1;
  const visiveis = FALAS.map((fl, i) => ({ fl, i })).filter(({ i }) => i <= atual && i > atual - 2);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: 1920 - 1200,
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      {visiveis.map(({ fl, i }) => (
        <div key={fl.arquivo} style={{ display: "flex", justifyContent: "center", opacity: i === atual ? 1 : 0.55 }}>
          <BalaoAudio fl={fl} inicio={INICIOS[i]} />
        </div>
      ))}
    </div>
  );
};

/** Topo: gancho + contador de mensagens. */
const Topo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const tremor = frame < GANCHO * FPS ? Math.sin(frame * 2.2) * 6 * (1 - frame / (GANCHO * FPS)) : 0;
  const chegaram = INICIOS.slice(0, FALAS.length).filter((i) => frame >= i).length;
  return (
    <div style={{ position: "absolute", top: 250, left: 120, right: 120, textAlign: "center", translate: `${tremor}px 0` }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 26px",
          borderRadius: 999,
          background: WHATS,
          color: "white",
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 32,
          opacity: entra,
        }}
      >
        WhatsApp · {9 + chegaram} mensagens não lidas
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: "white",
          opacity: entra,
          scale: String(0.9 + 0.1 * entra),
        }}
      >
        Toda <span style={{ color: AMBER }}>van escolar</span>
        <br />
        ouve isso:
      </div>
    </div>
  );
};

/** Fechamento: chamada para seguir. */
const Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const botao = spring({ frame: frame - f(FECHO.partes[0].ate), fps, config: { damping: 12, stiffness: 160 } });
  const fim = f(FECHO.seg);
  const parte = frame < f(FECHO.partes[0].ate) ? 0 : 1;
  const ini = parte === 0 ? 0 : f(FECHO.partes[0].ate);
  const op = interpolate(frame, [ini, ini + 5], [0, 1], { extrapolateRight: "clamp" }) * (frame < fim + 4 ? 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: NAVY, opacity: Math.min(1, interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" })) }} />
      <div style={{ position: "absolute", top: 330, left: 120, right: 120, textAlign: "center", opacity: entra }}>
        <div
          style={{
            display: "inline-block",
            background: "white",
            borderRadius: 32,
            padding: "18px 30px",
            boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)",
          }}
        >
          <Img src={staticFile("logo-van360-horizontal.png")} style={{ height: 76, display: "block" }} />
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "white",
          }}
        >
          Ouviu algum
          <br />
          <span style={{ color: AMBER }}>essa semana?</span>
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
      <div
        style={{
          position: "absolute",
          top: 1110,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 40,
          color: "rgba(226,234,246,0.85)",
          opacity: Math.max(botao, 0),
        }}
      >
        Você dirige. A gente organiza.
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 1260,
          opacity: op,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.2,
          color: "white",
          textWrap: "balance",
        }}
      >
        <Destacado texto={FECHO.partes[parte].texto} />
      </div>
    </AbsoluteFill>
  );
};

export const ReelPais: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Topo />
    <Conversa />
    {FALAS.map((fl, i) => (
      <Legenda key={fl.arquivo} texto={fl.texto} de={INICIOS[i]} ate={INICIOS[i] + f(fl.seg) + 6} />
    ))}
    {FALAS.map((fl, i) =>
      temAudio(fl.arquivo) ? (
        <Sequence key={`a-${fl.arquivo}`} from={INICIOS[i]} name={fl.nome}>
          <Audio src={staticFile(`reel-pais/${fl.arquivo}.mp3`)} />
        </Sequence>
      ) : null,
    )}
    <Sequence from={INICIO_FECHO} name="Fechamento">
      <Fechamento />
      {temAudio(FECHO.arquivo) ? <Audio src={staticFile(`reel-pais/${FECHO.arquivo}.mp3`)} /> : null}
    </Sequence>
  </AbsoluteFill>
);

/* ---------------- Capa (1080x1920; a grade do perfil mostra o miolo 3:4, y 240 a 1680) ---------------- */

export const CapaReelPais: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <div style={{ position: "absolute", top: 330, left: 90, right: 90, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          padding: "14px 32px",
          borderRadius: 999,
          background: AMBER,
          color: NAVY,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: "0.04em",
        }}
      >
        COISAS QUE TODO TIO ESCUTA
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 120,
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          color: "white",
        }}
      >
        Toda <span style={{ color: AMBER }}>van escolar</span>
        <br />
        ouve isso
      </div>
    </div>
    <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {FALAS.slice(0, 3).map((fl, i) => (
        <div key={fl.arquivo} style={{ translate: `${(i - 1) * 40}px 0`, rotate: `${[-2, 1.5, -1][i]}deg` }}>
          <CapaBalao fl={fl} />
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

const CapaBalao: React.FC<{ fl: Fala }> = ({ fl }) => (
  <div
    style={{
      width: 720,
      background: "white",
      borderRadius: "10px 40px 40px 40px",
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      gap: 18,
      boxShadow: "0 24px 50px -20px rgba(0,0,0,0.7)",
    }}
  >
    <div
      style={{
        width: 84,
        height: 84,
        borderRadius: 999,
        background: fl.cor,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 40,
        flexShrink: 0,
      }}
    >
      {fl.inicial}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#1f9d55" }}>{fl.nome}</span>
      <Onda progresso={0} tocando={false} frame={0} />
    </div>
  </div>
);

