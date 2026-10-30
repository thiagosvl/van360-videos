import React from "react";
import { AbsoluteFill, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import { MapPin, Mic, Play } from "lucide-react";
import Home from "@/pages/Home";
import Renovacoes from "@/pages/Renovacoes";
import Rotas from "@/pages/Rotas";
import { PhoneScreen } from "../components/PhoneScreen";
import { VideoStateProvider } from "../mocks/videoState";
import { ANO_DESTINO, EstadoRenovacao, dadosRenovacao } from "../mocks/renovacao";
import { PEDRO_ID } from "../mocks/data";
import { AMBER, Celular, NAVY, SeloTeste, Titulo, useU } from "../loja/base";
import { ESTADOS, PONTOS, pontoNoEstado } from "./brasil-mapa";

/**
 * Peças comuns dos vídeos de depoimento (Reels/TikTok/anúncio), visual navy + âmbar.
 * Medidas em "u" (1u = 1px numa largura de 1290), como nas imagens da loja.
 * O DepoimentoVerinha tem as versões originais destas peças; os novos usam daqui.
 */

export type Fala = { text: string; from: number; to: number };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Entrada com mola a partir de `at` (0 → 1). */
export const useMola = (at: number, damping = 15) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.7 } });
};

/** Some entre `de` e `ate` (1 → 0). */
export const useSaida = (de: number, ate: number) => interpolate(useCurrentFrame(), [de, ate], [1, 0], clamp);

/* ------------------------------------------------------------------ */
/* Legenda                                                             */
/* ------------------------------------------------------------------ */
export const Legenda: React.FC<{ falas: Fala[]; fim: number }> = ({ falas, fim }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const i = falas.findIndex((f, k) => {
    const prox = falas[k + 1]?.from ?? fim;
    const de = k === 0 ? 0 : f.from; // a primeira fala já está na tela no primeiro quadro
    return frame >= de && frame < Math.min(prox, f.to + 24);
  });
  if (i < 0) return null;
  const f = falas[i];
  const local = frame - f.from;
  const primeira = i === 0;
  const op = primeira ? 1 : interpolate(local, [0, 5], [0, 1], clamp);
  const sobe = primeira ? 0 : interpolate(local, [0, 10], [22, 0], clamp);
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
        fontSize: (longa ? 74 : 92) * u,
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
/* Faixa ESCOLAR (marca da série: o motorista se reconhece sem ler)    */
/* ------------------------------------------------------------------ */
export const FaixaEscolar: React.FC<{ largura?: number }> = ({ largura = 1120 }) => {
  const u = useU();
  const k = largura / 1120;
  return (
    <div
      style={{
        width: largura * u,
        height: 250 * k * u,
        background: "#FFCC00",
        borderTop: `${18 * k * u}px solid #111`,
        borderBottom: `${18 * k * u}px solid #111`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 190 * k * u,
        letterSpacing: "0.1em",
        color: "#111",
        paddingLeft: 19 * k * u,
        boxShadow: "0 30px 60px -15px rgba(0,0,0,0.55)",
      }}
    >
      ESCOLAR
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Balão de áudio fixo (modelo do WhatsApp), do começo ao fim da fala  */
/* ------------------------------------------------------------------ */
const ONDA = Array.from({ length: 38 }, (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
const AZUL_AUDIO = "#4fb3e8";

export const BalaoAudio: React.FC<{ nome: string; local: string; avatar: string; fim: number; segundos: number }> = ({
  nome,
  local,
  avatar,
  fim,
  segundos,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const sai = useSaida(fim + 4, fim + 16);
  const p = interpolate(frame, [0, fim], [0, 1], clamp);
  const seg = Math.min(segundos, Math.floor(frame / fps));
  const tempo = `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
  const tocando = frame < fim;
  const W = 1010;
  const ondaW = 560;
  return (
    <div
      style={{
        position: "absolute",
        top: 560 * u,
        left: ((1290 - W) / 2) * u,
        width: W * u,
        opacity: sai,
        background: "white",
        borderRadius: 34 * u,
        borderTopLeftRadius: 8 * u,
        padding: `${22 * u}px ${30 * u}px ${18 * u}px ${36 * u}px`,
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.55)",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * u, marginBottom: 6 * u }}>
        <span style={{ fontWeight: 700, fontSize: 40 * u, color: "#c2410c", whiteSpace: "nowrap" }}>{nome}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 * u, fontWeight: 500, fontSize: 34 * u, color: "#667781", whiteSpace: "nowrap" }}>
          <MapPin style={{ width: 30 * u, height: 30 * u, color: "#ef4444" }} strokeWidth={2.6} />
          {local} · motorista escolar
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * u }}>
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
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Img
            src={staticFile(avatar)}
            style={{ width: 150 * u, height: 150 * u, borderRadius: "50%", objectFit: "cover", display: "block", border: `${2 * u}px solid #e5e7eb`, background: "white" }}
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
/* Mapa: Van360 em todo o Brasil + close na cidade                      */
/* ------------------------------------------------------------------ */
export type MapaProps = {
  /** frames (no tempo da composição) */
  ini: number;
  zoom: number;
  fim: number;
  uf: string;
  lon: number;
  lat: number;
  /** ampliação no close */
  escalaZoom: number;
  cidade: string;
  sub: string;
  /** deslocamento do enquadramento no close (em unidades do mapa), para caber a etiqueta */
  dx?: number;
  dy?: number;
  /** pontos que acendem no close (ex.: região de SP) */
  pontosZoom?: Array<[number, number]>;
  /** selo de baixo: no Brasil e, se houver, no close */
  chip?: React.ReactNode;
  chipZoom?: React.ReactNode;
  /** começa já no close (segunda passagem pelo mapa) */
  jaNoZoom?: boolean;
};

const Chip: React.FC<{ children: React.ReactNode; op: number }> = ({ children, op }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: 1980 * u, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: op, translate: `0px ${(1 - op) * 30 * u}px` }}>
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
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 22 * u, height: 22 * u, borderRadius: "50%", background: AMBER }} />
        {children}
      </div>
    </div>
  );
};

export const ChipBrasil = () => (
  <>
    Van360 em <span style={{ color: AMBER }}>todo o Brasil</span>
  </>
);

export const CenaMapa: React.FC<MapaProps> = ({ ini, zoom, fim, uf, lon, lat, escalaZoom, cidade, sub, dx = 25, dy = 0, pontosZoom, chip, chipZoom, jaNoZoom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const [px, py] = pontoNoEstado(uf, lon, lat);
  const entra = useMola(ini, 16);
  const sai = useSaida(fim - 14, fim);
  const z = jaNoZoom ? 1 : spring({ frame: frame - zoom, fps, config: { damping: 20, mass: 1 } });
  const escala = interpolate(z, [0, 1], [1, escalaZoom]);
  const cx = interpolate(z, [0, 1], [306, px - dx]);
  const cy = interpolate(z, [0, 1], [320, py - dy]);
  const k = 1150 / 613;
  const titulo = useMola(ini + 8, 15);
  const pinMola = useMola(zoom + 14, 11);
  const pin = jaNoZoom ? 1 : pinMola;
  const rotulo = useMola(jaNoZoom ? ini + 6 : zoom + 12, 14);
  const chipZMola = useMola(jaNoZoom ? ini + 20 : zoom + 30, 14);
  const chipZ = chipZoom ? chipZMola : 0;
  // posição do pin na tela (em u), para a etiqueta acompanhar
  const pinX = 645 + (px - cx) * k * escala;
  const pinY = 600 + (py - cy) * k * escala;
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra, sai) }}>
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
            {Object.entries(ESTADOS).map(([e, d]) => (
              <path
                key={e}
                d={d}
                fill={e === uf ? interpolateColors(z, [0, 1], ["#24467f", "#2563eb"]) : "#24467f"}
                stroke="#5b7bb5"
                strokeWidth={1.1 / escala}
                strokeLinejoin="round"
              />
            ))}
            {PONTOS.map(([, x, y], i) => {
              const ordem = (i * 37) % PONTOS.length;
              const a = jaNoZoom ? 1 : spring({ frame: frame - (ini + 4 + ordem * 0.4), fps, config: { damping: 12 } });
              const brilho = 0.55 + 0.45 * Math.abs(Math.sin((frame + i * 7) / 9));
              return <circle key={i} cx={x} cy={y} r={(5.5 * a) / Math.sqrt(escala)} fill={AMBER} opacity={(1 - z * 0.75) * brilho} />;
            })}
            {pontosZoom?.map(([x, y], i) => {
              const a = spring({ frame: frame - ((jaNoZoom ? ini : zoom) + 10 + ((i * 13) % pontosZoom.length) * 0.8), fps, config: { damping: 12 } });
              const brilho = 0.6 + 0.4 * Math.abs(Math.sin((frame + i * 5) / 8));
              return <circle key={`z${i}`} cx={x} cy={y} r={(4.2 * a) / Math.sqrt(escala)} fill={AMBER} opacity={brilho} />;
            })}
            <circle cx={px} cy={py} r={(7 + 10 * Math.abs(Math.sin(frame / 8))) / escala} fill="none" stroke={AMBER} strokeWidth={2.4 / escala} opacity={pin} />
            <circle cx={px} cy={py} r={6.5 / escala} fill={AMBER} stroke="white" strokeWidth={2 / escala} opacity={Math.max(pin, 1 - z)} />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            left: (pinX + 40) * u,
            top: (pinY - 50) * u,
            opacity: rotulo * z,
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
          {cidade}
          <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 34 * u, color: "#6b7280" }}>{sub}</div>
        </div>
      </div>
      {chip && <Chip op={titulo * (1 - chipZ)}>{chip}</Chip>}
      {chipZoom && <Chip op={chipZ}>{chipZoom}</Chip>}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Celular: telas em sequência com fade curto                          */
/* ------------------------------------------------------------------ */
export type TelaNoTempo = { de: number; ate: number; render: (frame: number) => React.ReactNode };

export const CelularTelas: React.FC<{ telas: TelaNoTempo[]; sobe: number; fim: number; top?: number; escala?: number }> = ({
  telas,
  sobe,
  fim,
  top = 880,
  escala = 2.05,
}) => {
  const frame = useCurrentFrame();
  const s = useMola(sobe, 17);
  const sai = useSaida(fim, fim + 14);
  if (frame < sobe - 2 || frame > fim + 16) return null;
  return (
    <div style={{ opacity: sai, translate: `0px ${(1 - s) * 1100}px` }}>
      <Celular top={top} escala={escala}>
        <div style={{ position: "relative", width: 414, height: 868 }}>
          {telas.map(({ de, ate, render }, i) => {
            if (frame < de || frame >= ate) return null;
            const op = interpolate(frame, [de, de + 10, ate - 10, ate], [0, 1, 1, 0], clamp);
            return (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : op }}>
                {render(frame)}
              </div>
            );
          })}
        </div>
      </Celular>
    </div>
  );
};

/** Cartão flutuante que entra com mola e sai com fade. */
export const Surge: React.FC<{ at: number; ate: number; children: React.ReactNode }> = ({ at, ate, children }) => {
  const frame = useCurrentFrame();
  const s = useMola(at, 13);
  const sai = useSaida(ate - 10, ate);
  if (frame < at - 1 || frame > ate) return null;
  return <AbsoluteFill style={{ opacity: Math.min(s, sai), scale: String(0.8 + 0.2 * s) }}>{children}</AbsoluteFill>;
};

/** Carimbo "Já disponível" (recurso que o cliente citou como futuro e já foi lançado). */
export const SeloJaDisponivel: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = -6 }) => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: x * u,
        top: y * u,
        rotate: `${rot}deg`,
        padding: `${18 * u}px ${40 * u}px`,
        borderRadius: 22 * u,
        background: "#10b981",
        color: "white",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: 58 * u,
        letterSpacing: "0.04em",
        boxShadow: "0 24px 50px -14px rgba(0,0,0,0.55)",
        border: `${5 * u}px solid white`,
        whiteSpace: "nowrap",
      }}
    >
      ✓ JÁ DISPONÍVEL
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Fechamento                                                          */
/* ------------------------------------------------------------------ */
export const Fechamento: React.FC = () => {
  const u = useU();
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
      <div style={{ position: "absolute", top: 1400 * u, left: 0, right: 0, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 44 * u, color: "rgba(226,234,246,0.85)", opacity: selo }}>
        Sem cartão · van360.com.br
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Telas                                                               */
/* ------------------------------------------------------------------ */
export const TelaInicio: React.FC = () => (
  <VideoStateProvider value={{ comResumo: true }}>
    <PhoneScreen route="/inicio" pageTitle="Início" scale={1}>
      <Routes>
        <Route path="/inicio" element={<Home />} />
      </Routes>
    </PhoneScreen>
  </VideoStateProvider>
);

export const TelaRotas: React.FC = () => (
  <PhoneScreen route="/rotas" pageTitle="Rotas" scale={1}>
    <Routes>
      <Route path="/rotas" element={<Rotas />} />
    </Routes>
  </PhoneScreen>
);

/** Lista da renovação (mesmo estado final do tutorial: Ana e Pedro confirmados, Laura saindo). */
const TODOS = dadosRenovacao({}).passageiros.map((p) => p.passageiro_id);
const RENOVACAO_FINAL: EstadoRenovacao = {
  periodo: true,
  reajuste: 10,
  status: { p7: "recusado", p1: "confirmado", [PEDRO_ID]: "confirmado" },
  notificados: TODOS.filter((id) => id !== "p7" && id !== "p1"),
};
/** Precisa de usarHoje("2026-12-10T13:00:00Z") enquanto aparece (a renovação acontece em dezembro). */
export const TelaRenovacao: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => (
  <VideoStateProvider value={{ renovacao: RENOVACAO_FINAL }}>
    <PhoneScreen route={`/renovacoes?ano=${ANO_DESTINO}`} pageTitle="Renovação" scale={1} scrollY={scrollY}>
      <Routes>
        <Route path="/renovacoes" element={<Renovacoes />} />
      </Routes>
    </PhoneScreen>
  </VideoStateProvider>
);

/**
 * Tela bloqueada do celular do pai recebendo as notificações do Van360.
 * Textos = modelos reais do back-end (FirebasePassengerTemplates), com a aluna Ana.
 */
export type Notificacao = { at: number; titulo: string; corpo: string };
export const NOTIF = {
  embarque: (hora: string) => ({ titulo: "Embarque Confirmado ✅", corpo: `A Ana embarcou na van às ${hora} a caminho da escola!` }),
  desembarque: (hora: string) => ({ titulo: "Desembarque Confirmado ✅", corpo: `A Ana desembarcou com segurança às ${hora}!` }),
  aCaminho: () => ({ titulo: "Van a Caminho! 🚌", corpo: "A van está a caminho para buscar a Ana." }),
  rotaIniciada: (hora: string) => ({
    titulo: "Rota Iniciada! 🚌",
    corpo: `A van iniciou a rota de ida para a escola às ${hora}. Avisaremos quando estiver a caminho da sua residência!`,
  }),
};

export const TelaNotificacoesPai: React.FC<{ notifs: Notificacao[]; hora: string; frame: number }> = ({ notifs, hora, frame }) => {
  const { fps } = useVideoConfig();
  return (
    <PhoneScreen route="/" scale={1} showChrome={false} contentClassName="">
      <div
        className="absolute inset-0 flex flex-col items-center"
        style={{ fontFamily: "Inter", background: "linear-gradient(160deg, #3b5998 0%, #1e3a6e 45%, #0f1f3d 100%)" }}
      >
        <div style={{ marginTop: 70, color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600 }}>quinta-feira, 12 de março</div>
        <div style={{ color: "white", fontSize: 76, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em" }}>{hora}</div>
        <div style={{ marginTop: 26, width: "100%", padding: "0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs
            .filter((n) => frame >= n.at)
            .reverse()
            .map((n) => {
              const s = spring({ frame: frame - n.at, fps, config: { damping: 15, mass: 0.6 } });
              return (
                <div
                  key={n.titulo + n.at}
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 20,
                    padding: "12px 14px",
                    opacity: s,
                    translate: `0px ${(1 - s) * -30}px`,
                    scale: String(0.94 + 0.06 * s),
                    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <img src="/assets/logo-van360.webp" style={{ width: 20, height: 20, borderRadius: 5, background: "white", objectFit: "contain" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#444", letterSpacing: "0.02em" }}>VAN360</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#666" }}>agora</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{n.titulo}</div>
                  <div style={{ fontSize: 14, color: "#222", lineHeight: 1.3 }}>{n.corpo}</div>
                </div>
              );
            })}
        </div>
      </div>
    </PhoneScreen>
  );
};
