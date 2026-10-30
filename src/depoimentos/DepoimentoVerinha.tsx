import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import { AlertCircle, Check, MapPin, MessageCircle, Mic, Play, Sparkles } from "lucide-react";
import Home from "@/pages/Home";
import { PhoneScreen } from "../components/PhoneScreen";
import { VideoStateProvider } from "../mocks/videoState";
import { usarLarguraDeCelular } from "../viewport";
import { AMBER, Ampliado, Celular, Destaque, Fundo, GREEN, NAVY, SeloTeste, Titulo, WHATS, useU } from "../loja/base";
import { BolhaLembrete, TelaParcelas, TelaWhatsAppPai } from "../loja/telas";
import { ESTADOS, PONTOS } from "./brasil-mapa";

/**
 * Depoimento da Tia Verinha (Gravataí, RS), para Reels e remarketing.
 * Áudio real dela, reeditado: o "30 anos no caderninho" abre como gancho,
 * depois a apresentação e o resto da fala (public/depoimentos/verinha.mp3, 39,1s).
 *
 * Os tempos das falas saíram das pausas do áudio (silencedetect), em frames a 30fps.
 * "caderninho" aqui é a fala dela, mantida de propósito (aprovado pelo Thiago).
 * Visual navy + âmbar das imagens da loja; medidas em "u" (1u = 1px numa largura de 1290).
 */
type Fala = { text: string; from: number; to: number };
export const FALAS: Fala[] = [
  { text: "Trabalho há mais de 30 anos com **transporte escolar**", from: 0, to: 79 },
  { text: "e sempre foi na base do **caderninho**, da planilha de Excel e da agenda.", from: 93, to: 216 },
  { text: "Eu sou a **Tia Verinha**,", from: 223, to: 260 },
  { text: "sou de **Gravataí**, Rio Grande do Sul,", from: 264, to: 319 },
  { text: "região metropolitana de Porto Alegre.", from: 327, to: 373 },
  { text: "Hoje, eu uso o **Van360** no meu dia a dia do transporte escolar.", from: 380, to: 515 },
  { text: "E uma das funções que eu mais gosto é a parte das **anotações de pagamentos**.", from: 523, to: 645 },
  { text: "Consigo registrar **quem já pagou**,", from: 659, to: 713 },
  { text: "quem ainda está **pendente**", from: 719, to: 754 },
  { text: "e consultar tudo de forma **rápida e organizada**.", from: 763, to: 841 },
  { text: "Isso evita **esquecimentos**,", from: 855, to: 889 },
  { text: "facilita meu **controle financeiro**", from: 901, to: 951 },
  { text: "e me dá muito mais **segurança** no dia a dia.", from: 960, to: 1016 },
  { text: "O aplicativo tornou minha rotina muito mais **prática e organizada**.", from: 1034, to: 1139 },
  { text: "**Recomendo!**", from: 1149, to: 1170 },
];

const FIM_AUDIO = 1174;
const FIM = 1320;
export const DEPOIMENTO_VERINHA_DURATION = FIM;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Entrada com mola a partir de `at` (0 → 1). */
const useMola = (at: number, damping = 15) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.7 } });
};

/** Some entre `de` e `ate` (1 → 0). */
const useSaida = (de: number, ate: number) => interpolate(useCurrentFrame(), [de, ate], [1, 0], clamp);

/* ------------------------------------------------------------------ */
/* Legenda: branca, palavra-chave em âmbar, no topo                    */
/* ------------------------------------------------------------------ */
const Legenda: React.FC = () => {
  const frame = useCurrentFrame();
  const u = useU();
  const i = FALAS.findIndex((f, k) => {
    const prox = FALAS[k + 1]?.from ?? FIM_AUDIO;
    return frame >= f.from && frame < Math.min(prox, f.to + 24);
  });
  if (i < 0) return null;
  const f = FALAS[i];
  const local = frame - f.from;
  const op = f.from === 0 ? 1 : interpolate(local, [0, 5], [0, 1], clamp);
  const sobe = f.from === 0 ? 0 : interpolate(local, [0, 10], [22, 0], clamp);
  const parts = f.text.split(/(\*\*[^*]+\*\*)/g);
  const longa = f.text.length > 60;
  return (
    <div
      style={{
        position: "absolute",
        top: 150 * u,
        left: 80 * u,
        right: 80 * u,
        height: 380 * u,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: (longa ? 78 : 94) * u,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        color: "white",
        textWrap: "balance",
        opacity: op,
        translate: `0px ${sobe * u}px`,
        textShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <span>
        {parts.map((p, k) =>
          p.startsWith("**") ? (
            <span key={k} style={{ color: AMBER }}>
              {p.slice(2, -2)}
            </span>
          ) : (
            <React.Fragment key={k}>{p}</React.Fragment>
          ),
        )}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cena 1: 30 anos no papel                                            */
/* ------------------------------------------------------------------ */
const Papel: React.FC<{ at: number; x: number; y: number; rot: number; children: React.ReactNode }> = ({ at, x, y, rot, children }) => {
  const u = useU();
  const s = useMola(at, 13);
  const sai = useSaida(208, 226);
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        rotate: `${rot + (1 - s) * 14}deg`,
        scale: String((0.6 + 0.4 * s) * (0.85 + 0.15 * sai)),
        opacity: Math.min(s, sai),
        translate: `0px ${(1 - s) * 140 * u + (1 - sai) * 120 * u}px`,
        filter: `drop-shadow(0 ${30 * u}px ${40 * u}px rgba(0,0,0,0.45))`,
      }}
    >
      {children}
    </div>
  );
};

const anotacao: React.CSSProperties = { fontFamily: "Inter", fontStyle: "italic", fontWeight: 500, color: "#1e3a8a" };

const Caderno: React.FC = () => {
  const u = useU();
  const linhas = [
    ["Ana B.", "pagou 05/03", false],
    ["Davi", "R$ 280 ???", false],
    ["Miguel", "falta fev.", true],
    ["Sofia", "cobrar!!", false],
    ["Lucas", "pix? ver extrato", false],
  ] as const;
  return (
    <div
      style={{
        width: 560 * u,
        height: 660 * u,
        borderRadius: 18 * u,
        background: "#fffdf3",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${78 * u}px, #c7d7f2 ${78 * u}px, #c7d7f2 ${81 * u}px)`,
        backgroundPosition: `0 ${120 * u}px`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* margem vermelha */}
      <div style={{ position: "absolute", left: 92 * u, top: 0, bottom: 0, width: 3 * u, background: "#f2a1a1" }} />
      {/* espiral */}
      <div style={{ position: "absolute", top: 18 * u, left: 40 * u, right: 40 * u, display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ width: 26 * u, height: 26 * u, borderRadius: "50%", background: "#2b3442" }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 76 * u, left: 116 * u, ...anotacao, fontSize: 40 * u, color: "#9f1239", fontWeight: 700 }}>
        Março
      </div>
      {linhas.map(([nome, nota, riscado], i) => (
        <div
          key={nome}
          style={{
            position: "absolute",
            top: (140 + i * 81) * u,
            left: 116 * u,
            right: 24 * u,
            display: "flex",
            gap: 22 * u,
            ...anotacao,
            fontSize: 38 * u,
            textDecoration: riscado ? "line-through" : undefined,
            rotate: `${(i % 2 ? 1 : -1) * 0.8}deg`,
          }}
        >
          <span style={{ fontWeight: 700 }}>{nome}</span>
          <span style={{ color: nota.includes("?") || nota.includes("!") ? "#b91c1c" : "#1e3a8a" }}>{nota}</span>
        </div>
      ))}
    </div>
  );
};

const Planilha: React.FC = () => {
  const u = useU();
  const rows = [
    ["Aluno", "Jan", "Fev", "Mar"],
    ["Ana", "ok", "ok", "ok"],
    ["Davi", "ok", "ok", ""],
    ["Miguel", "ok", "", ""],
    ["Sofia", "ok", "ok", "?"],
    ["Lucas", "", "ok", ""],
  ];
  const cell = 132;
  return (
    <div style={{ width: 600 * u, borderRadius: 18 * u, background: "white", overflow: "hidden" }}>
      <div style={{ background: "#107c41", color: "white", fontFamily: "Inter", fontWeight: 700, fontSize: 32 * u, padding: `${16 * u}px ${24 * u}px` }}>
        mensalidades_2026.xlsx
      </div>
      <div style={{ padding: 12 * u }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex" }}>
            {r.map((c, j) => (
              <div
                key={j}
                style={{
                  width: (j === 0 ? 168 : cell) * u,
                  height: 66 * u,
                  border: `${1.5 * u}px solid #d4d4d4`,
                  marginLeft: -1.5 * u,
                  marginTop: -1.5 * u,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12 * u,
                  fontFamily: "Inter",
                  fontSize: 30 * u,
                  fontWeight: i === 0 ? 700 : 500,
                  color: c === "?" ? "#b91c1c" : "#262626",
                  background: i === 0 ? "#f1f5f2" : c === "" && j > 0 ? "#fde8e8" : "white",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Agenda: React.FC = () => {
  const u = useU();
  const notas = ["10: cobrar Sofia", "12: recibo do Davi", "15: ligar mãe do Lucas", "20: contrato Ana??"];
  return (
    <div style={{ width: 500 * u, borderRadius: 18 * u, background: "#fff8e7", overflow: "hidden", borderLeft: `${22 * u}px solid #7c2d12` }}>
      <div style={{ background: "#9a3412", color: "#ffedd5", fontFamily: "Manrope", fontWeight: 800, fontSize: 36 * u, padding: `${14 * u}px ${24 * u}px`, letterSpacing: "0.08em" }}>
        AGENDA · MARÇO
      </div>
      <div style={{ padding: `${18 * u}px ${24 * u}px ${26 * u}px` }}>
        {notas.map((n) => (
          <div key={n} style={{ ...anotacao, fontSize: 34 * u, color: "#7c2d12", padding: `${10 * u}px 0`, borderBottom: `${2 * u}px dashed #f3c99a` }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
};

/** A faixa amarela obrigatória das vans escolares: o motorista se reconhece sem ler. */
const FaixaEscolar: React.FC = () => {
  const u = useU();
  return (
    <div
      style={{
        width: 1120 * u,
        height: 250 * u,
        background: "#FFCC00",
        borderTop: `${18 * u}px solid #111`,
        borderBottom: `${18 * u}px solid #111`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 190 * u,
        letterSpacing: "0.1em",
        color: "#111",
        paddingLeft: 0.1 * 190 * u,
        boxShadow: "0 30px 60px -15px rgba(0,0,0,0.55)",
      }}
    >
      ESCOLAR
    </div>
  );
};

const CenaAntes: React.FC = () => {
  const frame = useCurrentFrame();
  const u = useU();
  // a faixa já está na tela no primeiro quadro (capa do TikTok/Reels) e "assenta" com um leve tranco
  const assenta = useMola(0, 9);
  const sub = useMola(14, 14);
  const sai = interpolate(frame, [112, 128], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 1000 * u, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: sai }}>
        <div style={{ rotate: "-4deg", scale: String(1.06 - 0.06 * assenta) }}>
          <FaixaEscolar />
        </div>
        <div
          style={{
            marginTop: 90 * u,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 76 * u,
            color: "white",
            letterSpacing: "-0.02em",
            opacity: sub,
            translate: `0px ${(1 - sub) * 30 * u}px`,
          }}
        >
          <span style={{ color: AMBER }}>30 anos</span> na estrada
        </div>
      </div>
      {/* o papel de sempre */}
      <Papel at={124} x={80} y={900} rot={-7}>
        <Caderno />
      </Papel>
      <Papel at={158} x={620} y={1150} rot={6}>
        <Planilha />
      </Papel>
      <Papel at={190} x={140} y={1560} rot={-3}>
        <Agenda />
      </Papel>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Balão de áudio fixo (modelo do WhatsApp), o vídeo inteiro           */
/* ------------------------------------------------------------------ */
const ONDA = Array.from({ length: 38 }, (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
const AZUL_AUDIO = "#4fb3e8";
const DURACAO_AUDIO = 39; // segundos de public/depoimentos/verinha.mp3

const BalaoAudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const entra = 1; // já na tela no primeiro quadro
  const sai = useSaida(FIM_AUDIO + 4, FIM_AUDIO + 16);
  const p = interpolate(frame, [0, FIM_AUDIO], [0, 1], clamp);
  const seg = Math.min(DURACAO_AUDIO, Math.floor(frame / fps));
  const tempo = `0:${String(seg).padStart(2, "0")}`;
  const tocando = frame < FIM_AUDIO;
  const W = 1010; // largura do balão em u
  const ondaW = 560;
  return (
    <div
      style={{
        position: "absolute",
        top: 560 * u,
        left: (1290 - W) / 2 * u,
        width: W * u,
        opacity: Math.min(entra, sai),
        translate: `0px ${(1 - entra) * -30 * u}px`,
        background: "white",
        borderRadius: 34 * u,
        borderTopLeftRadius: 8 * u,
        padding: `${22 * u}px ${30 * u}px ${18 * u}px ${36 * u}px`,
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.55)",
        fontFamily: "Inter",
      }}
    >
      {/* remetente, como num grupo */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * u, marginBottom: 6 * u }}>
        <span style={{ fontWeight: 700, fontSize: 40 * u, color: "#c2410c" }}>Tia Verinha</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 * u, fontWeight: 500, fontSize: 34 * u, color: "#667781" }}>
          <MapPin style={{ width: 30 * u, height: 30 * u, color: "#ef4444" }} strokeWidth={2.6} />
          Gravataí, RS · motorista escolar
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * u }}>
        {/* pausa / play */}
        <div style={{ width: 60 * u, display: "flex", justifyContent: "center", gap: 12 * u, flexShrink: 0 }}>
          {tocando ? (
            <>
              <div style={{ width: 13 * u, height: 50 * u, borderRadius: 4 * u, background: "#54656f" }} />
              <div style={{ width: 13 * u, height: 50 * u, borderRadius: 4 * u, background: "#54656f" }} />
            </>
          ) : (
            <Play style={{ width: 54 * u, height: 54 * u, color: "#54656f" }} fill="#54656f" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {/* onda + bolinha de progresso */}
          <div style={{ position: "relative", width: ondaW * u, height: 84 * u, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {ONDA.map((h, i) => (
              <div key={i} style={{ width: 8 * u, height: h * 70 * u, borderRadius: 8 * u, background: i / ONDA.length <= p ? AZUL_AUDIO : "#c5ccd2" }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: p * ondaW * u,
                top: "50%",
                width: 36 * u,
                height: 36 * u,
                translate: "-50% -50%",
                borderRadius: "50%",
                background: AZUL_AUDIO,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 * u, color: "#667781", marginTop: 4 * u }}>
            <span>{tempo}</span>
            <span>07:30</span>
          </div>
        </div>
        {/* foto com o microfone */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Img
            src={staticFile("depoimentos/verinha-avatar.png")}
            style={{ width: 150 * u, height: 150 * u, borderRadius: "50%", objectFit: "cover", display: "block", border: `${2 * u}px solid #e5e7eb` }}
          />
          <Mic
            style={{ position: "absolute", left: -10 * u, bottom: -2 * u, width: 50 * u, height: 50 * u, color: AZUL_AUDIO }}
            strokeWidth={2.4}
            fill={AZUL_AUDIO}
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cena 2: Van360 em todo o Brasil, e o close em Gravataí              */
/* ------------------------------------------------------------------ */
// lon/lat -> coordenadas do mapa (calibrado pelo contorno do RS; bom o bastante para pontos)
const ponto = (lon: number, lat: number) => [255.9 + (lon + 57.65) * 15.5, 518.5 + (-27.08 - lat) * 18] as const;
const GRAVATAI = ponto(-50.99, -29.94);

const CenaMapa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const INI = 222;
  const ZOOM = 266; // "sou de Gravataí"
  const entra = useMola(INI, 16);
  const sai = useSaida(366, 380);
  const z = spring({ frame: frame - ZOOM, fps, config: { damping: 20, mass: 1 } });
  // enquadramento: Brasil inteiro -> RS com Gravataí no centro
  const escala = interpolate(z, [0, 1], [1, 3.4]);
  const cx = interpolate(z, [0, 1], [306, GRAVATAI[0] - 25]);
  const cy = interpolate(z, [0, 1], [320, GRAVATAI[1]]);
  const MAPA = 1150; // largura do mapa na tela, em u (escala 1)
  const k = MAPA / 613;
  const titulo = useMola(INI + 8, 15);
  const pin = useMola(ZOOM + 14, 11);
  const rotulo = useMola(ZOOM + 22, 14);
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra, sai) }}>
      {/* janela do mapa */}
      <div style={{ position: "absolute", top: 830 * u, left: 0, width: 1290 * u, height: 1200 * u, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 645 * u,
            top: 600 * u,
            width: 613 * k * u,
            height: 639 * k * u,
            transformOrigin: "0 0",
            translate: `${-cx * k * escala * u}px ${-cy * k * escala * u}px`,
            scale: String(escala),
          }}
        >
          <svg viewBox="0 0 613 639" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {Object.entries(ESTADOS).map(([uf, d]) => (
              <path
                key={uf}
                d={d}
                fill={uf === "RS" ? interpolateColors(z, [0, 1], ["#24467f", "#2563eb"]) : "#24467f"}
                stroke="#5b7bb5"
                strokeWidth={1.1 / escala}
                strokeLinejoin="round"
              />
            ))}
            {/* motoristas pelo país */}
            {PONTOS.map(([, x, y], i) => {
              const ordem = (i * 37) % PONTOS.length; // espalha o acendimento pelo país
              const a = spring({ frame: frame - (INI + 4 + ordem * 0.4), fps, config: { damping: 12 } });
              const brilho = 0.55 + 0.45 * Math.abs(Math.sin((frame + i * 7) / 9));
              return (
                <circle key={i} cx={x} cy={y} r={(5.5 * a) / Math.sqrt(escala)} fill={AMBER} opacity={(1 - z * 0.75) * brilho} />
              );
            })}
            {/* Gravataí */}
            <circle cx={GRAVATAI[0]} cy={GRAVATAI[1]} r={(7 + 10 * Math.abs(Math.sin(frame / 8))) / escala} fill="none" stroke={AMBER} strokeWidth={2.4 / escala} opacity={pin} />
            <circle cx={GRAVATAI[0]} cy={GRAVATAI[1]} r={6.5 / escala} fill={AMBER} stroke="white" strokeWidth={2 / escala} opacity={Math.max(pin, 1 - z)} />
          </svg>
        </div>
        {/* etiqueta da cidade, presa ao pin */}
        <div
          style={{
            position: "absolute",
            left: 645 * u + 25 * k * escala * u + 40 * u,
            top: 600 * u - 50 * u,
            opacity: rotulo,
            translate: `${(1 - rotulo) * 30 * u}px 0px`,
            padding: `${18 * u}px ${34 * u}px`,
            borderRadius: 26 * u,
            background: "white",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 54 * u,
            color: NAVY,
            whiteSpace: "nowrap",
          }}
        >
          Gravataí, RS
          <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 34 * u, color: "#6b7280" }}>Região de Porto Alegre</div>
        </div>
      </div>
      {/* Van360 em todo o Brasil */}
      <div
        style={{
          position: "absolute",
          top: 1980 * u,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: titulo,
          translate: `0px ${(1 - titulo) * 30 * u}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18 * u,
            padding: `${20 * u}px ${42 * u}px`,
            borderRadius: 999,
            background: "rgba(255,179,0,0.14)",
            border: `${2 * u}px solid rgba(255,179,0,0.5)`,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 50 * u,
            color: "white",
          }}
        >
          <span style={{ width: 22 * u, height: 22 * u, borderRadius: "50%", background: AMBER }} />
          Van360 em <span style={{ color: AMBER }}>todo o Brasil</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Cena 3: o celular                                                   */
/* ------------------------------------------------------------------ */
const TelaInicio: React.FC = () => (
  <VideoStateProvider value={{ comResumo: true }}>
    <PhoneScreen route="/inicio" pageTitle="Início" scale={1}>
      <Routes>
        <Route path="/inicio" element={<Home />} />
      </Routes>
    </PhoneScreen>
  </VideoStateProvider>
);

/** Telas do celular em sequência, com fade curto entre elas. */
const TELAS: Array<{ de: number; ate: number; tela: React.FC<{ scrollY?: number }> }> = [
  { de: 380, ate: 530, tela: TelaInicio },
  { de: 520, ate: 862, tela: TelaParcelas },
  { de: 852, ate: 967, tela: TelaWhatsAppPai },
  { de: 957, ate: 1041, tela: () => <TelaParcelas recibo /> },
  { de: 1031, ate: FIM_AUDIO + 14, tela: TelaInicio },
];

const CelularDepoimento: React.FC = () => {
  const frame = useCurrentFrame();
  const sobe = useMola(380, 17);
  const sai = useSaida(FIM_AUDIO, FIM_AUDIO + 14);
  // na lista de parcelas, desce um pouco para mostrar os nomes ("rápida e organizada")
  const scroll = interpolate(frame, [770, 835], [0, 330], { ...clamp });
  return (
    <div style={{ opacity: sai, translate: `0px ${(1 - sobe) * 1100}px` }}>
      <Celular top={880} escala={2.05}>
        <div style={{ position: "relative", width: 414, height: 868 }}>
          {TELAS.map(({ de, ate, tela: T }, i) => {
            if (frame < de || frame >= ate) return null;
            const op = interpolate(frame, [de, de + 10, ate - 10, ate], [0, 1, 1, 0], clamp);
            return (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : op }}>
                <T scrollY={T === TelaParcelas ? scroll : 0} />
              </div>
            );
          })}
        </div>
      </Celular>
    </div>
  );
};

/** Cartão flutuante que entra com mola e sai com fade. */
const Surge: React.FC<{ at: number; ate: number; children: React.ReactNode }> = ({ at, ate, children }) => {
  const s = useMola(at, 13);
  const sai = useSaida(ate - 10, ate);
  return <AbsoluteFill style={{ opacity: Math.min(s, sai), scale: String(0.8 + 0.2 * s) }}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/* Fechamento                                                          */
/* ------------------------------------------------------------------ */
const Fechamento: React.FC = () => {
  const u = useU();
  // frames relativos ao início do fechamento
  const logo = useMola(6, 13);
  const titulo = useMola(16, 15);
  const selo = useMola(36, 11);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 520 * u, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, scale: String(0.7 + 0.3 * logo) }}>
        <div style={{ background: "white", borderRadius: 48 * u, padding: 22 * u, boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile("logo-van360-3.png")} style={{ height: 180 * u, display: "block" }} />
        </div>
      </div>
      <div style={{ opacity: titulo, translate: `0px ${(1 - titulo) * 40 * u}px` }}>
        <Titulo top={840} titulo={"Você dirige.\n**A gente organiza.**"} />
      </div>
      <div style={{ opacity: selo, scale: String(0.8 + 0.2 * selo) }}>
        <SeloTeste y={1230} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1400 * u,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 44 * u,
          color: "rgba(226,234,246,0.85)",
          opacity: selo,
        }}
      >
        Sem cartão · van360.com.br
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const DepoimentoVerinha: React.FC = () => {
  usarLarguraDeCelular();
  return (
    <AbsoluteFill>
      <Fundo />
      <Audio src={staticFile("depoimentos/verinha.mp3")} />

      <Sequence from={0} durationInFrames={230} name="Antes: 30 anos no papel">
        <CenaAntes />
      </Sequence>

      <Sequence from={0} durationInFrames={400} name="Mapa" layout="none">
        <CenaMapa />
      </Sequence>

      <Sequence from={0} durationInFrames={FIM_AUDIO + 20} name="Celular" layout="none">
        <CelularDepoimento />
      </Sequence>

      {/* quem já pagou / quem falta (dados do mock de março: 19 pagas, 5 a receber, 2 atrasadas) */}
      <Surge at={663} ate={850}>
        <Destaque x={40} y={1330} rot={-3} cor={GREEN} icone={Check} titulo="19 já pagaram" texto="R$ 5.320 recebido" />
      </Surge>
      <Surge at={721} ate={850}>
        <Destaque x={560} y={1760} rot={3} cor={AMBER} icone={AlertCircle} titulo="5 pendentes" texto="Você vê na hora" />
      </Surge>

      {/* evita esquecimentos: o lembrete chega sozinho no WhatsApp do pai */}
      <Surge at={872} ate={962}>
        <Ampliado x={150} y={1290} largura={340} escala={2.9} rot={-2}>
          <BolhaLembrete />
        </Ampliado>
      </Surge>
      <Surge at={902} ate={962}>
        <Destaque x={520} y={1790} rot={3} cor={WHATS} icone={MessageCircle} titulo="Lembrete automático" texto="Ninguém esquece" />
      </Surge>

      {/* segurança: pagou, o recibo sai pronto */}
      <Surge at={968} ate={1036}>
        <Destaque x={40} y={1330} rot={-3} cor={AMBER} icone={Sparkles} titulo="Recibo pronto" texto="Para mandar pro pai" />
      </Surge>

      <Sequence from={FIM_AUDIO} name="Fechamento">
        <Fechamento />
      </Sequence>

      <BalaoAudio />
      <Legenda />
    </AbsoluteFill>
  );
};
