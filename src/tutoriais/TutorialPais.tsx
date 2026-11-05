import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import { ResponsavelCarteirinhaBase } from "@/pages/ResponsavelCarteirinhaBase";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { Circulo } from "../components/Circulo";
import { TelaBloqueio } from "../components/TelaBloqueio";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { VideoStateProvider } from "../mocks/videoState";
import { ANA_ID, MOTORISTA } from "../mocks/data";
import { usarLarguraDeCelular } from "../viewport";

/**
 * Tutorial para os PAIS (o motorista manda para os clientes dele):
 * baixar, entrar com o telefone do cadastro + senha de 4 números, carteirinha,
 * recibos, contrato, ausência e avisos da rota. Fecha valorizando o motorista que usa o Van360.
 */
export const BEATS: Beat[] = [
  { text: "Seu filho vai de van com o Van360? Então você acompanha **tudo pelo celular**.", from: 0, duration: 178 },
  { text: "Baixe o app Van360, escolha **responsável** e entre com o telefone que está no cadastro do seu filho.", from: 178, duration: 219 },
  { text: "No primeiro acesso, você cria uma **senha de 4 números**. Pronto, já está dentro.", from: 397, duration: 174 },
  { text: "Aqui está a **carteirinha** do seu filho, com a escola, o horário e os dados do transporte.", from: 571, duration: 170 },
  { text: "Em Parcelas, você vê o que já foi pago e abre o **recibo** quando quiser.", from: 741, duration: 147 },
  { text: "O **contrato** assinado fica guardado aqui, pra ver quando precisar.", from: 888, duration: 125 },
  { text: "Seu filho não vai? Avise a **ausência** pelo app, e o motorista já fica sabendo.", from: 1013, duration: 159 },
  { text: "E você recebe um **aviso** quando a van sai, quando seu filho embarca e quando ele chega em casa.", from: 1172, duration: 174 },
  { text: "Seu motorista escolheu o Van360 pra deixar tudo mais **organizado e tranquilo** pra você.", from: 1346, duration: 200 },
];
export const TUTORIAL_PAIS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;

/* toques (px do celular 390x844), conferidos em stills */
const P = {
  perfilResponsavel: { x: 187, y: 496 },
  avancar: { x: 195, y: 555 },
  criarSenha: { x: 195, y: 565 },
  cardParcelas: { x: 67, y: 596 },
  marco: { x: 195, y: 385 }, // com a lista rolada em 330
  xRecibo: { x: 341, y: 164 },
  abaGeral: { x: 60, y: 456 },
  cardContrato: { x: 67, y: 715 },
  abaAusencias: { x: 90, y: 456 },
  registrar: { x: 292, y: 534 },
  dataAusencia: { x: 195, y: 492 },
  salvarAusencia: { x: 284, y: 641 },
};

const T = {
  tocaResponsavel: B[2] + 76,
  formTelefone: B[2] + 82,
  tel: [B[2] + 110, B[2] + 124, B[2] + 138],
  tocaAvancar: B[2] + 196,
  pin: B[2] + 202,
  digitos: [B[3] + 36, B[3] + 46, B[3] + 56, B[3] + 66],
  tocaCriar: B[3] + 100,
  carteirinha: B[3] + 108,
  // parcelas e recibo
  tocaParcelas: B[5] + 12,
  abaParcelas: B[5] + 18,
  rola: [B[5] + 28, B[5] + 48],
  tocaMarco: B[5] + 66,
  abreRecibo: B[5] + 72,
  tocaX: B[5] + 128,
  fechaRecibo: B[5] + 134,
  // contrato
  tocaGeral: B[6] + 14,
  abaGeral: B[6] + 20,
  tocaContrato: B[6] + 38,
  abaContrato: B[6] + 44,
  // ausência
  tocaAusencias: B[7] + 10,
  abaAusencias: B[7] + 16,
  tocaRegistrar: B[7] + 34,
  abreAusencia: B[7] + 40,
  tocaData: B[7] + 66,
  tocaSalvar: B[7] + 106,
  salvo: B[7] + 112,
};

const TELEFONE = ["(11) 9", "(11) 98765", "(11) 98765-4321"];

type Segment = { id: string; from: number; to: number; label: string | null };
const SEGMENTS: Segment[] = [
  { id: "app", from: 0, to: B[8], label: "Seu celular" },
  { id: "avisos", from: B[8], to: B[9], label: "Seu celular" },
  { id: "fim", from: B[9], to: TUTORIAL_PAIS_DURATION, label: null },
];

const SegmentShell: React.FC<{ seg: Segment; first: boolean; last: boolean; children: React.ReactNode }> = ({ seg, first, last, children }) => {
  const frame = useCurrentFrame();
  const len = seg.to - seg.from;
  const rise = usePhoneRise(4);
  const enter = first ? 0 : interpolate(frame, [0, SLIDE], [1150, 0], { ...clamp, easing: ease });
  const exit = last ? 0 : interpolate(frame, [len, len + SLIDE], [0, -1150], { ...clamp, easing: ease });
  const labelIn = interpolate(frame, [first ? 20 : 6, (first ? 20 : 6) + 10], [0, 1], clamp);
  if (!seg.label) return <AbsoluteFill style={{ translate: `${enter}px 0px` }}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ translate: `${enter + exit}px 0px` }}>
      <div style={{ position: "absolute", top: PHONE_TOP - 74, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: labelIn }}>
        <div style={{ padding: "10px 26px", borderRadius: 999, background: "#eef3ff", color: BRAND.blue, fontFamily: "Inter", fontWeight: 700, fontSize: 30, letterSpacing: "0.02em" }}>
          {seg.label}
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: PHONE_TOP }}>
        <div style={{ translate: first ? `0px ${rise}px` : undefined }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Aviso do app (mesmo texto do toast real). */
const ToastSucesso: React.FC<{ desde: number; ate: number; texto: string }> = ({ desde, ate, texto }) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= ate) return null;
  const s = interpolate(frame, [desde, desde + 8, ate - 6, ate], [0, 1, 1, 0], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 46, left: 16, right: 16, zIndex: 80, opacity: s, translate: `0px ${(1 - s) * -24}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(11,26,46,0.16)", fontFamily: "Inter", fontSize: 14, fontWeight: 600, color: "#0b1a2e" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill="#16a34a" />
          <path d="M5.5 10.3l3 3 6-6.3" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {texto}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Seu celular: login e carteirinha                                     */
/* ------------------------------------------------------------------ */
const TelaApp: React.FC = () => {
  const f = useCurrentFrame();
  const login = f < T.carteirinha;
  const route = f < T.formTelefone ? "/login" : login ? "/login?tipo=responsavel" : "/responsavel/carteirinha";
  const telefone = TELEFONE.filter((_, i) => f >= T.tel[i]).pop() ?? "";
  const pin = "2468".slice(0, T.digitos.filter((d) => f >= d).length);
  const aba =
    f >= T.abaAusencias ? "ausencias" : f >= T.abaContrato ? "contrato" : f >= T.abaGeral ? "geral" : f >= T.abaParcelas ? "parcelas" : "geral";
  const scroll = aba === "parcelas" ? interpolate(f, [T.rola[0], T.rola[1], T.fechaRecibo + 4, T.fechaRecibo + 20], [0, 330, 330, 0], { ...clamp, easing: ease }) : 0;
  const ausencias = f >= T.salvo ? ["2026-03-13"] : [];

  // um dedo por trecho (some entre um trecho e outro, sem ficar parado na tela)
  const grupos: Array<Array<{ at: number; x: number; y: number }>> = [
    [{ at: T.tocaResponsavel, ...P.perfilResponsavel }, { at: T.tocaAvancar, ...P.avancar }, { at: T.tocaCriar, ...P.criarSenha }],
    [{ at: T.tocaParcelas, ...P.cardParcelas }, { at: T.tocaMarco, ...P.marco }, { at: T.tocaX, ...P.xRecibo }],
    [{ at: T.tocaGeral, ...P.abaGeral }, { at: T.tocaContrato, ...P.cardContrato }],
    [{ at: T.tocaAusencias, ...P.abaAusencias }, { at: T.tocaRegistrar, ...P.registrar }, { at: T.tocaData, ...P.dataAusencia }, { at: T.tocaSalvar, ...P.salvarAusencia }],
  ];

  return (
    <VideoStateProvider
      value={{
        responsavel: { step: f >= T.pin ? "pin" : "phone", telefone, pin, ausencias },
        abaForcada: login ? undefined : aba,
        dataAusencia: f >= T.tocaData + 2 ? "2026-03-13" : undefined,
      }}
    >
      <PhoneScreen
        key={route}
        route={route}
        scale={SCALE}
        showChrome={false}
        contentClassName={login ? "tela-cheia" : ""}
        scrollY={scroll}
        overlay={
          <>
            {f >= T.abreRecibo && f < T.fechaRecibo && (
              <ReceiptDialog
                isOpen
                onClose={noop}
                receiptUrl={staticFile("recibos/recibo-ana-marco.png")}
                cobrancaId="ana-2026-3"
                mes={3}
                ano={2026}
                passageiroId={ANA_ID}
                nomePassageiro="Ana Beatriz Souza"
                nomeResponsavel="Juliana Souza"
              />
            )}
            {f >= T.abreAusencia && f < T.salvo && (
              <ResponsavelNotificarAusenciaDialog
                open
                onOpenChange={noop}
                passageiroId={ANA_ID}
                passageiroNome="Ana Beatriz Souza"
                rotas={[{ id: "r1", nome: "Ida Manhã", periodo: "manha" }]}
                token="video"
              />
            )}
            {/* destaques */}
            <Circulo x={187} y={615} w={290} h={64} desde={B[1] + 50} ate={T.tocaResponsavel - 30} />
            <Circulo x={195} y={360} w={320} h={74} desde={B[4] + 30} ate={B[5]} />
            <Circulo x={195} y={640} w={340} h={130} desde={T.abaContrato + 10} ate={B[7]} />
            <Circulo x={110} y={572} w={180} h={60} desde={T.salvo + 10} ate={B[8]} />
            <ToastSucesso desde={T.salvo} ate={T.salvo + 45} texto="Ausência registrada com sucesso!" />
            {grupos.map((g, i) => (
              <Finger key={i} showFrom={g[0].at - 22} hideAt={g[g.length - 1].at + 10} steps={[{ ...g[0], at: g[0].at - 22 }, ...g.map((p) => ({ ...p, tap: true }))]} />
            ))}
          </>
        }
      >
        <Routes>
          <Route path={login ? "/login" : "/responsavel/carteirinha"} element={login ? <Login /> : <ResponsavelCarteirinhaBase />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Seu celular bloqueado: os avisos da rota (textos reais do back-end)  */
/* ------------------------------------------------------------------ */
const AVISO = { sai: 30, embarca: 70, chega: 128 };
const TelaAvisos: React.FC = () => (
  <PhoneScreen route="/" scale={SCALE} showChrome={false} contentClassName="">
    <TelaBloqueio
      hora="12:38"
      data="quinta-feira, 12 de março"
      notificacoes={[
        { titulo: "Rota Iniciada! 🚌", corpo: "A van iniciou a rota de ida para a escola às 06:42. Avisaremos quando estiver a caminho da sua residência!", chegaEm: AVISO.sai, hora: "06:42" },
        { titulo: "Embarque Confirmado ✅", corpo: "A Ana embarcou na van às 06:51 a caminho da escola!", chegaEm: AVISO.embarca, hora: "06:51" },
        { titulo: "Desembarque Confirmado ✅", corpo: "A Ana desembarcou com segurança às 12:38!", chegaEm: AVISO.chega },
      ]}
    />
  </PhoneScreen>
);

/* ------------------------------------------------------------------ */
/* Fechamento: o que o pai tem, graças ao motorista                    */
/* ------------------------------------------------------------------ */
const ITENS = ["Carteirinha do seu filho", "Recibos sempre à mão", "Contrato guardado", "Ausência em um toque", "Avisos da rota"];
const MARCA = ITENS.map((_, i) => 10 + i * 14);
const Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const selo = spring({ frame: frame - (MARCA[4] + 24), fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 520, display: "flex", flexDirection: "column", gap: 22 }}>
        {ITENS.map((item, i) => {
          const s = spring({ frame: frame - MARCA[i], fps, config: { damping: 12, mass: 0.6 } });
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "22px 36px 22px 24px",
                width: 760,
                borderRadius: 28,
                background: "white",
                boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: 46,
                color: BRAND.navy,
                opacity: s,
                translate: `${(1 - s) * -80}px 0px`,
              }}
            >
              <div style={{ width: 62, height: 62, borderRadius: 999, background: "#16a34a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, scale: String(s) }}>✓</div>
              {item}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1270, display: "flex", alignItems: "center", gap: 22, opacity: selo, scale: String(0.8 + 0.2 * selo) }}>
        <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 40, color: BRAND.navy }}>{MOTORISTA.apelido} usa</div>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ height: 70 }} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  ...[T.tocaResponsavel, T.tocaAvancar, T.tocaCriar, T.tocaParcelas, T.tocaMarco, T.tocaX, T.tocaGeral, T.tocaContrato, T.tocaAusencias, T.tocaRegistrar, T.tocaData, T.tocaSalvar].map(
    (at): SfxEvent => ({ at, sfx: "tap" }),
  ),
  ...T.tel.map((at): SfxEvent => ({ at, sfx: "select", volume: 0.3 })),
  ...T.digitos.map((at): SfxEvent => ({ at, sfx: "select", volume: 0.35 })),
  { at: T.carteirinha, sfx: "success", volume: 0.7 },
  { at: T.abreRecibo, sfx: "open", volume: 0.5 },
  { at: T.fechaRecibo, sfx: "close", volume: 0.5 },
  { at: T.abreAusencia, sfx: "open", volume: 0.5 },
  { at: T.salvo, sfx: "success", volume: 0.7 },
  ...SEGMENTS.slice(0, -1).map((s): SfxEvent => ({ at: s.to, sfx: "whoosh", volume: 0.55 })),
  ...Object.values(AVISO).flatMap((a): SfxEvent[] => [
    { at: B[8] + a - 2, sfx: "vibra", volume: 0.4 },
    { at: B[8] + a, sfx: "notif", volume: 0.7 },
  ]),
  ...MARCA.map((m): SfxEvent => ({ at: B[9] + m, sfx: "select", volume: 0.5 })),
  { at: B[9] + MARCA[4] + 24, sfx: "chime", volume: 0.6 },
];

const TELAS: Record<string, React.FC> = { app: TelaApp, avisos: TelaAvisos, fim: Fechamento };

export const TutorialPais: React.FC = () => {
  usarLarguraDeCelular();
  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      {SEGMENTS.map((seg, i) => {
        const Tela = TELAS[seg.id];
        const last = i === SEGMENTS.length - 1;
        return (
          <Sequence key={seg.id} from={seg.from} durationInFrames={seg.to - seg.from + (last ? 0 : SLIDE)} name={seg.id}>
            <SegmentShell seg={seg} first={i === 0} last={last}>
              <Tela />
            </SegmentShell>
          </Sequence>
        );
      })}
      <Narracao pasta="pais" beats={BEATS} />
      <Sfx events={SFX} />
    </BrandBackground>
  );
};
