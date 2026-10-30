import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ClipboardCheck, Fuel, Wallet, X } from "lucide-react";
import { usarLarguraDeCelular } from "../viewport";
import { AMBER, Ampliado, Celular, Destaque, Fundo, GREEN, NAVY, RED, Rotulo, useU } from "../loja/base";
import { BolhaLembrete, TelaCarteirinha, TelaChamada, TelaParcelas, TelaRelatorios, TelaWhatsAppPai } from "../loja/telas";
import {
  BalaoAudio, CenaMapa, CelularTelas, ChipBrasil, FaixaEscolar, Fechamento, Legenda, NOTIF, Surge, TelaInicio,
  TelaNotificacoesPai, clamp, useMola, useSaida,
} from "./base";
import { PONTOS_SP } from "./brasil-mapa";
import { FALAS, FIM_AUDIO, SEGUNDOS_AUDIO } from "./flavio-falas";

/**
 * Depoimento do Tio Flávio (Americana, interior de SP). Fala menos de tela e mais de
 * confiança: "não fico mais sem", custo-benefício, bom pros dois lados, e a região
 * aderindo (SP = 270 usuários, 42% da base em out/2026).
 * Áudio real reeditado (scripts/depoimentos/flavio.json), com redução de ruído leve.
 */
const FIM = FIM_AUDIO + 140;
export const DEPOIMENTO_FLAVIO_DURATION = FIM;

const T = {
  mapa: 122,
  americana: 164,
  app: 226,
  sensacional: 453,
  custoBeneficio: 577,
  rotina: 645,
  custo: 871,
  aluno: 931,
  doisLados: 963,
  pai: 1065,
  condutores: 1105,
  seguranca: 1128,
  fluxo: 1308,
  regiao: 1420,
};

/* ------------------------------------------------------------------ */
/* Gancho: o app que ele abre todo dia                                 */
/* ------------------------------------------------------------------ */
const CenaGancho: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const assenta = useMola(0, 9);
  const icone = useMola(-30, 10); // já aceso no primeiro quadro
  const sai = useSaida(105, 121);
  const pulsa = 1 + 0.04 * Math.sin(frame / 5);
  const COLS = 4;
  const N = 16;
  const DESTAQUE = 9;
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      <div style={{ position: "absolute", top: 860 * u, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 2 }}>
        <div style={{ rotate: "-3deg", scale: String(1.05 - 0.05 * assenta) }}>
          <FaixaEscolar largura={760} />
        </div>
      </div>
      {/* tela inicial de um celular: ícones apagados e o Van360 aceso */}
      <div
        style={{
          position: "absolute",
          top: 1150 * u,
          left: 225 * u,
          width: 840 * u,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          rowGap: 50 * u,
          justifyItems: "center",
        }}
      >
        {Array.from({ length: N }).map((_, i) => {
          if (i === DESTAQUE) {
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * u, zIndex: 1 }}>
                <div
                  style={{
                    width: 160 * u,
                    height: 160 * u,
                    borderRadius: 40 * u,
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: String((0.6 + 0.9 * icone) * pulsa),
                    boxShadow: `0 0 ${80 * icone * u}px ${20 * icone * u}px rgba(255,179,0,0.55)`,
                  }}
                >
                  <Img src={staticFile("logo-van360-3.png")} style={{ width: 130 * u }} />
                </div>
                <span style={{ marginTop: 40 * icone * u, fontFamily: "Inter", fontWeight: 700, fontSize: 40 * u, color: "white", opacity: icone }}>Van360</span>
              </div>
            );
          }
          const s = useMola(i * 1.5 - 24, 14);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * u, opacity: s * (1 - 0.6 * icone) }}>
              <div style={{ width: 150 * u, height: 150 * u, borderRadius: 38 * u, background: "rgba(255,255,255,0.12)" }} />
              <div style={{ width: 90 * u, height: 14 * u, borderRadius: 7 * u, background: "rgba(255,255,255,0.14)" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Custo-benefício sem citar preço: um app no lugar de tudo isso        */
/* ------------------------------------------------------------------ */
const SUBSTITUI = ["Caderno de pagamentos", "Planilha de Excel", "Recibo de papel", "Cobrar pai no WhatsApp", "Contrato impresso"];

const CartaoTudoNumApp: React.FC<{ at: number }> = ({ at }) => {
  const u = useU();
  const frame = useCurrentFrame();
  const fim = useMola(at + 12 + SUBSTITUI.length * 9, 13);
  return (
    <div style={{ position: "absolute", top: 1180 * u, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          rotate: "-2deg",
          width: 900 * u,
          padding: `${44 * u}px ${56 * u}px`,
          borderRadius: 48 * u,
          background: "white",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
          border: `${6 * u}px solid ${AMBER}`,
        }}
      >
        {SUBSTITUI.map((t, i) => {
          const risca = interpolate(frame, [at + 6 + i * 9, at + 14 + i * 9], [0, 1], clamp);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 24 * u, padding: `${10 * u}px 0` }}>
              <div
                style={{
                  width: 54 * u,
                  height: 54 * u,
                  borderRadius: "50%",
                  background: risca > 0.5 ? RED : "#e5e7eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: 34 * u, height: 34 * u, opacity: risca }} strokeWidth={3.2} />
              </div>
              <span style={{ position: "relative", fontFamily: "Inter", fontWeight: 600, fontSize: 46 * u, color: risca > 0.5 ? "#9ca3af" : NAVY }}>
                {t}
                <span style={{ position: "absolute", left: 0, top: "52%", height: 5 * u, width: `${risca * 100}%`, background: RED, borderRadius: 3 * u }} />
              </span>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 26 * u,
            paddingTop: 30 * u,
            borderTop: `${3 * u}px dashed #e5e7eb`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24 * u,
            opacity: fim,
            scale: String(0.85 + 0.15 * fim),
          }}
        >
          <Img src={staticFile("logo-van360-3.png")} style={{ height: 96 * u }} />
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 64 * u, color: NAVY, letterSpacing: "-0.03em" }}>
            Tudo num <span style={{ color: "#d97706" }}>app só</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Bom pros dois lados: o celular do pai e o seu                       */
/* ------------------------------------------------------------------ */
const DoisLados: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a T.doisLados
  const pai = useMola(T.pai - T.doisLados - 30, 15);
  const seu = useMola(T.condutores - T.doisLados - 30, 15);
  const sai = interpolate(frame, [T.seguranca - T.doisLados - 4, T.seguranca - T.doisLados + 10], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(sai, Math.max(pai, seu)) }}>
      <div style={{ opacity: pai, translate: `${(1 - pai) * -300}px 0px` }}>
        <Rotulo x={390} y={850} texto="Celular do pai" cor="verde" />
        <Celular top={950} x={-250} escala={1.45} rot={-4}>
          <TelaWhatsAppPai />
        </Celular>
        <Ampliado x={95} y={1330} largura={340} escala={1.65} rot={-4}>
          <BolhaLembrete />
        </Ampliado>
      </div>
      <div style={{ opacity: seu, translate: `${(1 - seu) * 300}px 0px` }}>
        <Rotulo x={910} y={880} texto="Seu celular" />
        <Celular top={980} x={260} escala={1.45} rot={4}>
          <TelaParcelas />
        </Celular>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const TELAS = [
  { de: T.app, ate: T.sensacional + 6, render: () => <TelaInicio /> },
  { de: T.sensacional, ate: T.rotina + 6, render: () => <TelaParcelas /> },
  { de: T.rotina, ate: T.aluno - 10, render: () => <TelaRelatorios /> },
  { de: T.aluno - 16, ate: T.doisLados + 6, render: () => <TelaCarteirinha /> },
  // dois lados: o celular sai de cena (cena própria com dois aparelhos)
  {
    de: T.seguranca,
    ate: T.fluxo + 6,
    render: (f: number) => (
      <TelaNotificacoesPai hora="12:41" frame={f} notifs={[{ at: T.seguranca + 28, ...NOTIF.embarque("06:52") }, { at: T.seguranca + 90, ...NOTIF.desembarque("12:41") }]} />
    ),
  },
  { de: T.fluxo, ate: T.regiao + 6, render: () => <TelaChamada /> },
];

/** O celular some durante "os dois lados" (cena com dois aparelhos) e volta em seguida. */
const Celulares: React.FC = () => {
  const frame = useCurrentFrame();
  const escondido = frame >= T.doisLados && frame < T.seguranca;
  const op = interpolate(frame, [T.doisLados - 6, T.doisLados + 4, T.seguranca - 4, T.seguranca + 8], [1, 0, 0, 1], clamp);
  return (
    <div style={{ opacity: escondido ? 0 : op }}>
      <CelularTelas telas={TELAS} sobe={T.app} fim={T.regiao - 4} />
    </div>
  );
};

export const DepoimentoFlavio: React.FC = () => {
  usarLarguraDeCelular();
  return (
    <AbsoluteFill>
      <Fundo />
      <Audio src={staticFile("depoimentos/flavio.mp3")} />

      <Sequence from={0} durationInFrames={125} name="Gancho: não fico sem">
        <CenaGancho />
      </Sequence>

      <Sequence from={0} durationInFrames={T.app + 10} name="Mapa: Americana" layout="none">
        <CenaMapa
          ini={T.mapa - 4}
          zoom={T.americana - 18}
          fim={T.app + 8}
          uf="SP"
          lon={-47.33}
          lat={-22.74}
          escalaZoom={4.2}
          dx={20}
          cidade="Americana, SP"
          sub="Interior de São Paulo"
          chip={<ChipBrasil />}
        />
      </Sequence>

      <Celulares />

      <Surge at={T.custoBeneficio - 14} ate={T.rotina + 50}>
        <CartaoTudoNumApp at={T.custoBeneficio - 14} />
      </Surge>
      <Surge at={T.custo} ate={T.aluno - 12}>
        <Destaque x={40} y={1330} rot={-3} cor={RED} icone={Fuel} titulo="Custos da van" texto="Gastos e lucro do mês" />
      </Surge>
      <Surge at={T.aluno} ate={T.doisLados}>
        <Destaque x={560} y={1760} rot={3} cor={GREEN} icone={Wallet} titulo="Tudo do aluno" texto="Na carteirinha digital" />
      </Surge>

      <Sequence from={T.doisLados} durationInFrames={T.seguranca - T.doisLados + 12} name="Dois lados">
        <DoisLados />
      </Sequence>

      <Surge at={T.fluxo + 24} ate={T.regiao}>
        <Destaque x={40} y={1700} rot={-3} cor={GREEN} icone={ClipboardCheck} titulo="Entrada e saída" texto="6 embarcaram, 2 faltaram" />
      </Surge>

      {/* a região aderindo: volta ao mapa, já no close, e SP acende */}
      <Sequence from={0} durationInFrames={FIM_AUDIO + 20} name="Mapa: região" layout="none">
        {/* só aparece a partir de T.regiao */}
        <MapaRegiao />
      </Sequence>

      <Sequence from={FIM_AUDIO} name="Fechamento">
        <Fechamento />
      </Sequence>

      <BalaoAudio nome="Tio Flávio" local="Americana, SP" avatar="depoimentos/flavio-avatar.png" fim={FIM_AUDIO} segundos={SEGUNDOS_AUDIO} />
      <Legenda falas={FALAS} fim={FIM_AUDIO} />
    </AbsoluteFill>
  );
};

const MapaRegiao: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.regiao - 2) return null;
  return (
    <CenaMapa
      ini={T.regiao}
      zoom={T.regiao}
      fim={FIM_AUDIO + 10}
      uf="SP"
      lon={-47.33}
      lat={-22.74}
      escalaZoom={2.6}
      dx={-25}
      dy={-8}
      jaNoZoom
      pontosZoom={PONTOS_SP}
      cidade="Americana, SP"
      sub="Interior de São Paulo"
      chipZoom={
        <>
          <span style={{ color: AMBER }}>Centenas de usuários</span> em SP
        </>
      }
    />
  );
};
