import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AlertCircle, Check, ClipboardCheck, FileSignature, Gift, Navigation, RefreshCw, Sparkles } from "lucide-react";
import { usarHoje } from "../clock";
import { usarLarguraDeCelular } from "../viewport";
import { AMBER, BLUE, Destaque, Fundo, GREEN, RED, useU } from "../loja/base";
import { TelaChamada, TelaContratos, TelaParcelas } from "../loja/telas";
import {
  BalaoAudio, CenaMapa, CelularTelas, ChipBrasil, FaixaEscolar, Fechamento, Legenda, NOTIF, SeloJaDisponivel, Surge,
  TelaInicio, TelaNotificacoesPai, TelaRenovacao, TelaRotas, clamp, useMola, useSaida,
} from "./base";
import { FALAS, FIM_AUDIO, SEGUNDOS_AUDIO } from "./ricardo-falas";

/**
 * Depoimento do Tio Ricardo (Ângelo's Transporte Escolar, Santa Maria, DF).
 * Áudio real reeditado (scripts/depoimentos/ricardo.json): o "fim da papelada" abre
 * como gancho. O que ele citou como "novas melhorias" (rastreamento e renovação) já foi
 * lançado: aparece com o selo "Já disponível". Rastreamento = os avisos de rota que o
 * pai recebe (o mapa ao vivo está desligado no app, ENABLE_LIVE_TRACKING).
 */
const FIM = FIM_AUDIO + 140;
export const DEPOIMENTO_RICARDO_DURATION = FIM;

// momentos da fala (frames, ver ricardo-falas.ts)
const T = {
  papelada: 67,
  mapa: 137,
  santaMaria: 175,
  app: 216,
  rota: 378,
  chamada: 442,
  pais: 561,
  financeiro: 711,
  pagas: 800,
  atraso: 882,
  recibos: 944,
  contratos: 1031,
  assinatura: 1177,
  melhorias: 1220,
  rastreamento: 1310,
  renovacao: 1344,
  completo: 1423,
  colegas: 1585,
};

/* ------------------------------------------------------------------ */
/* Gancho: a pilha de contratos de papel                               */
/* ------------------------------------------------------------------ */
const Folha: React.FC<{ i: number }> = ({ i }) => {
  const u = useU();
  const frame = useCurrentFrame();
  const entra = useMola(i * 6 - 30, 14); // as primeiras já estão na mesa no primeiro quadro
  // depois do "melhor", as folhas voam para fora
  const voa = interpolate(frame, [100 + i * 3, 128 + i * 3], [0, 1], { ...clamp });
  const lado = i % 2 ? 1 : -1;
  const rot = [-8, 5, -3, 7, -1][i];
  return (
    <div
      style={{
        position: "absolute",
        left: (305 + lado * (i * 14)) * u,
        top: (980 + i * 26) * u,
        width: 680 * u,
        height: 880 * u,
        rotate: `${rot + voa * lado * 40}deg`,
        translate: `${voa * lado * 1100 * u}px ${(1 - entra) * 500 * u - voa * 200 * u}px`,
        opacity: entra,
        background: "#fdfdfb",
        borderRadius: 10 * u,
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.55)",
        padding: `${56 * u}px ${54 * u}px`,
        fontFamily: "Inter",
        color: "#222",
      }}
    >
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 32 * u, lineHeight: 1.25 }}>
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS
        <br />
        DE TRANSPORTE ESCOLAR
      </div>
      {Array.from({ length: 11 }).map((_, k) => (
        <div key={k} style={{ height: 14 * u, marginTop: (k === 0 ? 46 : 22) * u, width: `${k % 4 === 3 ? 62 : 100}%`, background: "#d8dbe0", borderRadius: 4 * u }} />
      ))}
      <div style={{ position: "absolute", left: 54 * u, right: 54 * u, bottom: 90 * u, display: "flex", justifyContent: "space-between" }}>
        {["Contratante", "Contratado"].map((t) => (
          <div key={t} style={{ width: 250 * u, borderTop: `${3 * u}px solid #333`, paddingTop: 10 * u, fontSize: 26 * u, textAlign: "center", color: "#555" }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

const CenaPapelada: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const assenta = useMola(0, 9);
  const sai = useSaida(118, 134);
  // "papelada": a pilha dá uma tremida
  const treme = frame >= T.papelada && frame < T.papelada + 16 ? Math.sin((frame - T.papelada) * 1.6) * 6 * (1 - (frame - T.papelada) / 16) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 860 * u, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: sai, zIndex: 2 }}>
        <div style={{ rotate: "-3deg", scale: String(1.05 - 0.05 * assenta) }}>
          <FaixaEscolar largura={760} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, translate: `${treme * u}px 0px` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Folha key={i} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const TELAS = [
  { de: T.app, ate: T.rota + 6, render: () => <TelaInicio /> },
  { de: T.rota, ate: T.chamada + 8, render: () => <TelaRotas /> },
  { de: T.chamada, ate: T.pais + 6, render: () => <TelaChamada /> },
  {
    de: T.pais,
    ate: T.financeiro + 6,
    render: (f: number) => (
      <TelaNotificacoesPai hora="12:41" frame={f} notifs={[{ at: 600, ...NOTIF.embarque("06:52") }, { at: 652, ...NOTIF.desembarque("12:41") }]} />
    ),
  },
  { de: T.financeiro, ate: T.recibos + 4, render: () => <TelaParcelas /> },
  { de: T.recibos, ate: T.contratos + 6, render: () => <TelaParcelas recibo /> },
  { de: T.contratos, ate: T.melhorias + 6, render: () => <TelaContratos /> },
  {
    de: T.melhorias,
    ate: T.renovacao + 4,
    render: (f: number) => (
      <TelaNotificacoesPai hora="06:41" frame={f} notifs={[{ at: 1232, ...NOTIF.rotaIniciada("06:30") }, { at: 1290, ...NOTIF.aCaminho() }]} />
    ),
  },
  {
    de: T.renovacao,
    ate: T.completo + 6,
    render: (f: number) => <TelaRenovacao scrollY={interpolate(f, [T.renovacao + 20, T.renovacao + 70], [330, 700], clamp)} />,
  },
  { de: T.completo, ate: FIM_AUDIO + 16, render: () => <TelaInicio /> },
];

export const DepoimentoRicardo: React.FC = () => {
  usarLarguraDeCelular();
  const frame = useCurrentFrame();
  // a tela de renovação vive em dezembro; o resto do vídeo, no "hoje" padrão
  usarHoje(frame >= T.renovacao - 2 && frame < T.completo + 8 ? "2026-12-10T13:00:00Z" : "2026-03-12T13:00:00Z");
  return (
    <AbsoluteFill>
      <Fundo />
      <Audio src={staticFile("depoimentos/ricardo.mp3")} />

      <Sequence from={0} durationInFrames={140} name="Gancho: papelada">
        <CenaPapelada />
      </Sequence>

      <Sequence from={0} durationInFrames={T.app + 10} name="Mapa" layout="none">
        <CenaMapa
          ini={T.mapa - 4}
          zoom={T.santaMaria - 22}
          fim={T.app + 8}
          uf="DF"
          lon={-48.01}
          lat={-16.02}
          escalaZoom={9}
          dx={4}
          cidade="Santa Maria, DF"
          sub="Distrito Federal"
          chip={<ChipBrasil />}
        />
      </Sequence>

      <CelularTelas telas={TELAS} sobe={T.app} fim={FIM_AUDIO} />

      {/* rota e chamada (dados da tela: 6 embarcaram, 2 faltaram) */}
      <Surge at={T.chamada + 30} ate={T.pais}>
        <Destaque x={40} y={1700} rot={-3} cor={GREEN} icone={ClipboardCheck} titulo="Chamada em um toque" texto="6 embarcaram, 2 faltaram" />
      </Surge>

      {/* financeiro (mock de março: 19 pagas, 2 em atraso) */}
      <Surge at={T.pagas} ate={T.recibos}>
        <Destaque x={40} y={1330} rot={-3} cor={GREEN} icone={Check} titulo="19 já pagaram" texto="R$ 5.320 recebido" />
      </Surge>
      <Surge at={T.atraso} ate={T.recibos}>
        <Destaque x={600} y={1760} rot={3} cor={RED} icone={AlertCircle} titulo="2 em atraso" texto="Você vê na hora" />
      </Surge>
      <Surge at={T.recibos + 8} ate={T.contratos}>
        <Destaque x={40} y={1330} rot={-3} cor={AMBER} icone={Sparkles} titulo="Recibo pronto" texto="Com a sua logo" />
      </Surge>

      {/* contratos */}
      <Surge at={T.assinatura} ate={T.melhorias + 2}>
        <Destaque x={60} y={1500} rot={-3} cor={GREEN} icone={FileSignature} titulo="Assinado pelo pai" texto="Pelo celular, sem papel" />
      </Surge>

      {/* o que ele esperava já está no app */}
      <Surge at={T.rastreamento} ate={T.renovacao + 2}>
        <SeloJaDisponivel x={540} y={880} rot={6} />
        <Destaque x={60} y={1760} rot={-3} cor={BLUE} icone={Navigation} titulo="Avisos da rota" texto="No celular do pai" />
      </Surge>
      <Surge at={T.renovacao + 6} ate={T.completo}>
        <SeloJaDisponivel x={540} y={880} rot={6} />
        <Destaque x={60} y={1760} rot={-3} cor={BLUE} icone={RefreshCw} titulo="Renovação 2027" texto="O pai confirma pelo link" />
      </Surge>

      {/* passando para os colegas: Indique e Ganhe */}
      <Surge at={T.colegas - 70} ate={FIM_AUDIO + 4}>
        <Destaque x={480} y={1700} rot={3} cor={AMBER} icone={Gift} titulo="Indique e ganhe" texto="+30 dias grátis pra você" />
      </Surge>

      <Sequence from={FIM_AUDIO} name="Fechamento">
        <Fechamento />
      </Sequence>

      <BalaoAudio nome="Tio Ricardo" local="Santa Maria, DF" avatar="depoimentos/ricardo-avatar.png" fim={FIM_AUDIO} segundos={SEGUNDOS_AUDIO} />
      <Legenda falas={FALAS} fim={FIM_AUDIO} />
    </AbsoluteFill>
  );
};
