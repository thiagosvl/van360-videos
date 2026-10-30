import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Rotas from "@/pages/Rotas";
import { ChamadaEscolaDialog } from "@/components/dialogs/ChamadaEscolaDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { AcoesNaTela } from "../components/AcoesNaTela";
import { BRAND, BrandBackground, ease } from "../components/brand";
import { Beat, Caption, Finger, SemLegenda, beatsDuration } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { PASSAGEIROS } from "../mocks/data";
import { usarLarguraDeCelular } from "../viewport";
import { TutorialAlunosSolicitacoes } from "../tutoriais/TutorialAlunosSolicitacoes";
import { TutorialParcelas } from "../tutoriais/TutorialParcelas";
import { TutorialContratos } from "../tutoriais/TutorialContratos";
import { TutorialGastos } from "../tutoriais/TutorialGastos";

/**
 * Apresentação do app (landing page e resposta no WhatsApp), ~90s, narração do Thiago.
 * Reaproveita trechos dos tutoriais (telas reais) e tem cenas próprias no começo e no fim.
 */
export const BEATS: Beat[] = [
  { text: "Cobrar pai no WhatsApp, anotar pagamento no caderno, correr atrás de recibo… **dá para largar isso**.", from: 0, duration: 180 },
  { text: "Mais de **500 motoristas** já organizam o transporte escolar no celular com o Van360.", from: 180, duration: 150 },
  { text: "Você manda um link, o pai **preenche o cadastro** do filho e a **carteirinha digital** fica pronta.", from: 330, duration: 360 },
  { text: "Todo mês, o app avisa o pai **no WhatsApp**, com a sua chave Pix.", from: 690, duration: 240 },
  { text: "E você vê na hora **quem pagou** e quem está devendo.", from: 930, duration: 180 },
  { text: "Pagou? O **recibo** sai pronto.", from: 1110, duration: 180 },
  { text: "O contrato, o pai **assina pelo celular**, com validade jurídica. Sem papel.", from: 1290, duration: 315 },
  { text: "Você anota os gastos da van e o app mostra o seu **lucro de verdade**, mês a mês.", from: 1605, duration: 300 },
  { text: "Monta as **rotas** e faz a chamada na saída da escola em poucos toques.", from: 1905, duration: 240 },
  { text: "Menos tempo cobrando e conferindo, **mais tempo para você**.", from: 2145, duration: 150 },
  { text: "Teste **15 dias grátis**, sem cartão.", from: 2295, duration: 150 },
  { text: "Você dirige. **A gente organiza.**", from: 2445, duration: 180 },
];
export const APRESENTACAO_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const FADE = 10;

/* ------------------------------------------------------------------ */
/* trechos dos tutoriais: [início no vídeo, componente, de, até]       */
/* ------------------------------------------------------------------ */
type Trecho = { em: number; Comp: React.FC; de: number; ate: number };
const TRECHOS: Trecho[] = [
  { em: B[3], Comp: TutorialAlunosSolicitacoes, de: 300, ate: 480 }, // o pai preenche o cadastro
  { em: B[3] + 180, Comp: TutorialAlunosSolicitacoes, de: 828, ate: 1008 }, // carteirinha pronta
  { em: B[4], Comp: TutorialParcelas, de: 1170, ate: 1410 }, // lembretes no WhatsApp do pai
  { em: B[5], Comp: TutorialParcelas, de: 150, ate: 330 }, // painel: quem pagou, quem deve
  { em: B[6], Comp: TutorialParcelas, de: 840, ate: 1020 }, // recibo
  { em: B[7], Comp: TutorialContratos, de: 795, ate: 1110 }, // assinatura do pai
  { em: B[8], Comp: TutorialGastos, de: 700, ate: 1000 }, // lucro real
];

/** Um trecho de tutorial, sem a legenda dele, com fade curto na entrada e na saída. */
const TrechoTutorial: React.FC<{ t: Trecho }> = ({ t }) => {
  const frame = useCurrentFrame(); // relativo ao início do trecho
  const len = t.ate - t.de;
  const opacity = interpolate(frame, [0, FADE, len - FADE, len], [0, 1, 1, 0], clamp);
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
/* Gancho: a bagunça no WhatsApp                                       */
/* ------------------------------------------------------------------ */
const CONVERSAS = [
  { nome: "Mãe do Miguel", msg: "Tio, esse mês vou atrasar um pouquinho 🙏", hora: "07:12", n: 3 },
  { nome: "Pai da Sofia", msg: "Já paguei! Pode mandar o recibo?", hora: "07:30", n: 2 },
  { nome: "Mãe da Helena", msg: "Quanto ficou a parcela de março?", hora: "08:05", n: 1 },
  { nome: "Avó do Arthur", msg: "Tio, cadê o contrato pra eu assinar?", hora: "08:41", n: 4 },
  { nome: "Pai do Lucas", msg: "Esqueci de pagar, faço amanhã", hora: "09:02", n: 2 },
  { nome: "Mãe do Davi", msg: "Me passa o Pix de novo?", hora: "09:18", n: 1 },
  { nome: "Mãe da Laura", msg: "Já mandei o comprovante ontem", hora: "10:07", n: 5 },
];

const TelaConversas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <PhoneScreen route="/" scale={SCALE} showChrome={false} contentClassName="">
      <div className="absolute inset-0 flex flex-col bg-white" style={{ fontFamily: "Inter" }}>
        <div className="px-4 pb-2.5 bg-white" style={{ paddingTop: 40 }}>
          <div className="flex items-center justify-between">
            <span className="text-[22px] font-bold text-[#111b21]">WhatsApp</span>
            <span className="text-[#54656f] text-lg">⋮</span>
          </div>
          <div className="mt-3 h-9 rounded-full bg-[#f0f2f5] px-4 flex items-center text-[13px] text-[#667781]">Pesquisar</div>
        </div>
        <div className="flex-1 overflow-hidden">
          {CONVERSAS.map((c, i) => {
            // cada conversa chega por cima, empurrando as outras (a mais nova no topo)
            const chega = 8 + (CONVERSAS.length - 1 - i) * 16;
            const s = spring({ frame: frame - chega, fps, config: { damping: 16, mass: 0.6 } });
            if (frame < chega) return null;
            return (
              <div
                key={c.nome}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f2f5]"
                style={{ opacity: s, translate: `0px ${(1 - s) * -24}px` }}
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

/* ------------------------------------------------------------------ */
/* "Mais de 500 motoristas": a tela Início com os números do mês       */
/* ------------------------------------------------------------------ */
const TelaInicio: React.FC = () => (
  <VideoStateProvider value={{ comResumo: true }}>
    <PhoneScreen route="/inicio" pageTitle="Início" scale={SCALE}>
      <Routes>
        <Route path="/inicio" element={<Home />} />
      </Routes>
    </PhoneScreen>
  </VideoStateProvider>
);

/* ------------------------------------------------------------------ */
/* Rotas e chamada na escola                                           */
/* ------------------------------------------------------------------ */
const ALUNOS_CHAMADA = PASSAGEIROS.filter((p: any) => p.escola.id === "e1").map((p: any, i) => ({
  id: `par-${p.id}`,
  tipo_no: "passageiro",
  passageiro_id: p.id,
  nome: p.nome,
  ordem: i + 1,
  status: "pendente",
  passageiro: { ...p, turma: p.turma },
})) as any[];

const R = { abreChamada: 75, tocaAusente: 125, tocaConfirmar: 190 };
const TelaRotas: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[9]
  const chamada = frame >= R.abreChamada && frame < R.tocaConfirmar + 8;
  const passo = frame >= R.tocaAusente + 2 ? 1 : 0;
  return (
    <PhoneScreen
      route="/rotas"
      pageTitle="Rotas"
      scale={SCALE}
      overlay={
        <>
          {chamada && (
            <React.Fragment key={`chamada-${passo}`}>
              <ChamadaEscolaDialog open onOpenChange={noop} escolaNome="Colégio Aurora" alunos={ALUNOS_CHAMADA} isSubmitting={false} onConfirmChamada={async () => {}} />
              {/* a Ana faltou hoje: um toque na linha dela */}
              <AcoesNaTela passos={[{ tocarTexto: "Ana Beatriz Souza" }].slice(0, passo)} />
            </React.Fragment>
          )}
          <Finger
            showFrom={R.abreChamada + 20}
            hideAt={R.tocaConfirmar + 8}
            steps={[
              { at: R.abreChamada + 20, x: 195, y: 395 },
              { at: R.tocaAusente, x: 195, y: 395, tap: true },
              { at: R.tocaConfirmar, x: 283, y: 587, tap: true },
            ]}
          />
        </>
      }
    >
      <Routes>
        <Route path="/rotas" element={<Rotas />} />
      </Routes>
    </PhoneScreen>
  );
};

/* ------------------------------------------------------------------ */
/* Cena própria: rótulo + celular entrando                             */
/* ------------------------------------------------------------------ */
const Cena: React.FC<{ len: number; rotulo: string; children: React.ReactNode }> = ({ len, rotulo, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sobe = spring({ frame, fps, config: { damping: 18, mass: 0.8 } });
  const opacity = interpolate(frame, [0, FADE, len - FADE, len], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", top: PHONE_TOP - 74, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "10px 26px", borderRadius: 999, background: "#eef3ff", color: BRAND.blue, fontFamily: "Inter", fontWeight: 700, fontSize: 30 }}>{rotulo}</div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: PHONE_TOP }}>
        <div style={{ translate: `0px ${(1 - sobe) * 120}px` }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Fechamento: 15 dias grátis e o slogan                               */
/* ------------------------------------------------------------------ */
const Fechamento: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[10]
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const selo = spring({ frame: frame - (B[11] - B[10]), fps, config: { damping: 12 } });
  const slogan = spring({ frame: frame - (B[12] - B[10]), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: 120 }}>
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 560, scale: String(logo), opacity: logo }} />
      <div
        style={{
          marginTop: 70,
          padding: "22px 44px",
          borderRadius: 999,
          background: BRAND.blue,
          color: "white",
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 50,
          scale: String(selo),
          opacity: selo,
          boxShadow: "0 20px 40px -12px rgba(37,99,235,0.5)",
        }}
      >
        15 dias grátis · sem cartão
      </div>
      <div
        style={{
          marginTop: 80,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 66,
          color: BRAND.navy,
          textAlign: "center",
          lineHeight: 1.15,
          opacity: slogan,
          translate: `0px ${(1 - slogan) * 30}px`,
        }}
      >
        Você dirige.
        <br />
        <span style={{ color: BRAND.blue }}>A gente organiza.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const ApresentacaoApp: React.FC = () => {
  usarLarguraDeCelular();
  return (
    <BrandBackground>
      <Sequence from={0} durationInFrames={B[2] + FADE} name="Gancho">
        <Cena len={B[2] + FADE} rotulo="Seu WhatsApp hoje">
          <TelaConversas />
        </Cena>
      </Sequence>
      <Sequence from={B[2]} durationInFrames={B[3] - B[2] + FADE} name="500 motoristas">
        <Cena len={B[3] - B[2] + FADE} rotulo="Com o Van360">
          <TelaInicio />
        </Cena>
      </Sequence>
      {TRECHOS.map((t, i) => (
        <Sequence key={i} from={t.em} durationInFrames={t.ate - t.de} name={`Trecho ${i + 1}`}>
          <TrechoTutorial t={t} />
        </Sequence>
      ))}
      <Sequence from={B[9]} durationInFrames={B[10] - B[9] + FADE} name="Rotas">
        <Cena len={B[10] - B[9] + FADE} rotulo="Seu celular">
          <TelaRotas />
        </Cena>
      </Sequence>
      <Sequence from={B[10]} name="Fechamento">
        <Fechamento />
      </Sequence>
      {/* por cima de tudo (os trechos de tutorial trazem o próprio fundo).
          Nos dois últimos beats o fechamento mostra o texto (selo e slogan). */}
      <Caption beats={BEATS.slice(0, 10)} />
    </BrandBackground>
  );
};
