import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import MenuPage from "@/pages/MenuPage";
import { ReferAndEarnDialog } from "@/components/dialogs/ReferAndEarnDialog";
import { buildReferralShareMessage } from "@/utils/whatsappTemplates";
import { usarLarguraDeCelular } from "../viewport";
import { PhoneScreen } from "../components/PhoneScreen";
import { ReferralHowItWorksDrawer } from "@/components/features/subscription/ReferralHowItWorksDrawer";
import { WhatsAppChat } from "../components/WhatsAppChat";
import { AcoesNaTela } from "../components/AcoesNaTela";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { LINK_INDICACAO } from "../mocks/useSubscription";

/**
 * Apresentação: Indique e Ganhe (indicar outros motoristas).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Conhece outro motorista de van? **Indique e ganhe**.", from: 0, duration: 135 },
  { text: "Cada colega que assinar vale **30 dias grátis** para você.", from: 135, duration: 150 },
  { text: "E ele ganha **50% de desconto** no primeiro mês.", from: 285, duration: 165 },
  { text: "É só mandar o seu link **pelo WhatsApp**.", from: 450, duration: 165 },
  { text: "Quanto mais indicar, **mais meses grátis**.", from: 615, duration: 150 },
  { text: "Indicou, assinou, **ganhou**.", from: 765, duration: 120 },
];
export const TUTORIAL_INDICACAO_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;

type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "app", from: 0, to: B[4] + 40, label: "Seu celular" },
  { id: "whatsapp", from: B[4] + 40, to: B[5], label: "Seu WhatsApp" },
  { id: "app-fim", from: B[5], to: TUTORIAL_INDICACAO_DURATION, label: "Seu celular" },
];

const SegmentShell: React.FC<{ seg: Segment; first: boolean; last: boolean; children: React.ReactNode }> = ({ seg, first, last, children }) => {
  const frame = useCurrentFrame();
  const len = seg.to - seg.from;
  const rise = usePhoneRise(4);
  const enter = first ? 0 : interpolate(frame, [0, SLIDE], [1150, 0], { ...clamp, easing: ease });
  const exit = last ? 0 : interpolate(frame, [len, len + SLIDE], [0, -1150], { ...clamp, easing: ease });
  const labelIn = interpolate(frame, [first ? 20 : 6, (first ? 20 : 6) + 10], [0, 1], clamp);
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

/* pontos de toque (px do celular 390x844), conferidos em stills */
const P = {
  indique: { x: 195, y: 300 },
  comoFunciona: { x: 195, y: 330 },
  entendi: { x: 195, y: 750 },
  whatsapp: { x: 270, y: 640 },
};

const T = {
  tocaIndique: 100,
  abreDialogo: 106,
  tocaComoFunciona: B[3] + 20,
  abreDrawer: B[3] + 26,
  tocaEntendi: B[4] - 10,
  fechaDrawer: B[4] - 4,
  tocaWhatsApp: B[4] + 30,
};

const TelaApp: React.FC = () => {
  const frame = useCurrentFrame();
  const dialogo = frame >= T.abreDialogo;
  const drawer = frame >= T.abreDrawer && frame < T.fechaDrawer;
  return (
    <VideoStateProvider value={{ indicacoes: 2 }}>
      <PhoneScreen
        route="/menu"
        pageTitle="Menu"
        scale={SCALE}
        overlay={
          <>
            {dialogo && (
              <React.Fragment key={`dialogo-${drawer}`}>
                <ReferAndEarnDialog isOpen onClose={noop} />
                {drawer && (
                  <>
                    {/* a gaveta real "Como funciona?", aberta por fora do diálogo (no app ela sobe do pé da tela) */}
                    <div style={{ position: "absolute", left: -999, top: 0 }} data-gatilho-drawer>
                      <ReferralHowItWorksDrawer bonusDaysPerReferral={30} />
                    </div>
                    <AcoesNaTela dentro="[data-gatilho-drawer]" passos={[{ tocar: "Como funciona?" }]} />
                  </>
                )}
              </React.Fragment>
            )}
            <Finger
              showFrom={T.tocaIndique - 24}
              hideAt={T.tocaWhatsApp + 8}
              steps={[
                { at: T.tocaIndique - 24, ...P.indique },
                { at: T.tocaIndique, ...P.indique, tap: true },
                { at: T.tocaComoFunciona, ...P.comoFunciona, tap: true },
                { at: T.tocaEntendi, ...P.entendi, tap: true },
                { at: T.tocaWhatsApp, ...P.whatsapp, tap: true },
              ]}
            />
          </>
        }
      >
        <Routes>
          <Route path="/menu" element={<MenuPage />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

const TelaWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  // a mensagem pronta do app é longa: desce até o link
  const rolagem = interpolate(frame, [50, 100], [0, 300], { ...clamp, easing: ease });
  return (
    <PhoneScreen route="/menu" scale={SCALE} showChrome={false} contentClassName="">
      <WhatsAppChat contato="Rogério (Van Escolar)" mensagem={buildReferralShareMessage(LINK_INDICACAO)} enviaEm={20} rolagem={rolagem} />
    </PhoneScreen>
  );
};

/** De volta ao app: mais um colega assinou, os dias grátis sobem. */
const TelaFim: React.FC = () => {
  const frame = useCurrentFrame();
  const indicacoes = frame >= 50 ? 3 : 2;
  // aproxima nos números (Indicações e Dias Ganhos) enquanto sobem
  const zoom = interpolate(frame, [20, 40, 130, 150], [1, 1.4, 1.4, 1], { ...clamp, easing: ease });
  return (
    // recorte: o celular ampliado não invade a legenda (nada acima de 70px do topo do celular)
    <div style={{ clipPath: "inset(-70px -500px -600px -500px)" }}>
    <div style={{ scale: String(zoom), transformOrigin: `${(12 + 195) * SCALE}px ${(12 + 482) * SCALE}px` }}>
    <VideoStateProvider value={{ indicacoes }}>
      <PhoneScreen
        route="/menu"
        pageTitle="Menu"
        scale={SCALE}
        overlay={<ReferAndEarnDialog isOpen onClose={noop} />}
      >
        <Routes>
          <Route path="/menu" element={<MenuPage />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
    </div>
    </div>
  );
};

const TELAS: Record<string, React.FC> = { app: TelaApp, whatsapp: TelaWhatsApp, "app-fim": TelaFim };

export const TutorialIndicacao: React.FC = () => {
  usarLarguraDeCelular();
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[6] + 20, B[6] + 40], [0, 1], clamp);
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
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};
