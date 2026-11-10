import React, { createContext, useContext, useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Routes, Route } from "react-router-dom";
import { ArrowDown, Check, FileText, Users, Wallet } from "lucide-react";
import AssinarContrato from "@/pages/AssinarContrato";
import PassageiroCarteirinha from "@/pages/PassageiroCarteirinha";
import PassageiroExternalForm from "@/pages/PassageiroExternalForm";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { buildPrePassageiroShareMessage } from "@/utils/whatsappTemplates";
import { PhoneScreen } from "../components/PhoneScreen";
import { WhatsAppChat } from "../components/WhatsAppChat";
import { BotaoLink, WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { Finger } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import { MOCK_PROFILE } from "../mocks/useProfile";
import { LINK_DOMINIO, MOTORISTA, NOVO_ALUNO, PEDRO_ID, PRE_PASSAGEIRO } from "../mocks/data";
import { Destacado, Fundo } from "./ReelPais";

/**
 * Anúncio (captação): "Já organizou os seus alunos de 2027?"
 * Voz do Thiago (ElevenLabs), uma fala por cena, em public/anuncio-2027/g1..g6.mp3.
 * Objetivo: lead (teste grátis de 15 dias). Fechamento: slogan + "Clique agora e saiba mais" (botão do anúncio).
 * Mostra cadastro por link, contrato no WhatsApp, carteirinha e cobrança automática, sem falar de Renovações.
 *
 * 1080x1920. Áreas cobertas pelo Reels/anúncio: topo ~220px, rodapé ~420px (botão do anúncio), lateral direita ~140px.
 */

const FPS = 30;
const NAVY = "#0b1a2e";
const AMBER = "#FFB300";
const BLUE = "#2563eb";

const DUR = [4.36, 7.47, 10.27, 4.6, 5.15, 6.11];
const START = 0.1;
const GAP = 0.25;
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
const FIM = L[5] + f(DUR[5]) + f(1.2);
export const ANUNCIO_2027_DURATION = FIM;

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
const CAP_BOTTOM = 440; // borda inferior da legenda em y=1480, logo acima da faixa do rodapé do Reels (~420px)
const Legenda: React.FC<{ trechos: Trecho[]; tamanho?: number; oculta?: [number, number][]; degrade?: boolean }> = ({ trechos, tamanho = 56, oculta, degrade }) => {
  const t = useT();
  const atual = trechos.find((x) => t >= f(x.de) - 2 && t < f(x.ate) + 2);
  if (!atual) return null;
  if (oculta && oculta.some(([a, b]) => t >= a && t < b)) return null;
  const op = interpolate(t, [f(atual.de), f(atual.de) + 5, f(atual.ate) - 3, f(atual.ate)], [0, 1, 1, 0.9], clamp);
  const grande = atual.grande;
  const pulso = grande ? 1 + 0.05 * Math.sin((t - f(atual.de)) / 3) : 1;
  return (
    <>
    <div
      style={{
        position: "absolute",
        left: degrade ? 80 : 130,
        right: degrade ? 100 : 150,
        bottom: CAP_BOTTOM,
        opacity: op,
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: grande ? tamanho * 2.1 : tamanho,
        lineHeight: 1.26,
        letterSpacing: "-0.02em",
        color: grande ? AMBER : "white",
        textShadow: "0 4px 24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)",
        textWrap: "balance",
        scale: String(pulso),
      }}
    >
      {degrade ? (
        <span style={{ display: "inline-block", background: "rgba(11,26,46,0.86)", padding: "18px 38px 22px", borderRadius: 36, boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}>
          <Destacado texto={atual.texto} />
        </span>
      ) : (
        <Destacado texto={atual.texto} />
      )}
    </div>
    </>
  );
};

/** Etiqueta âmbar só no gancho (segmenta quem assiste). Zona segura: abaixo de 235px. */
const Etiqueta: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: t + 6, fps, config: { damping: 15, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", top: 250, left: 80, right: 100, textAlign: "center", opacity: entra }}>
      <div
        style={{
          display: "inline-block",
          padding: "14px 34px",
          borderRadius: 999,
          background: AMBER,
          color: NAVY,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: "0.06em",
        }}
      >
        TRANSPORTADOR ESCOLAR
      </div>
    </div>
  );
};

/** Área do elemento principal da cena: entre o cabeçalho e a legenda. */
const Hero: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 240, height: 1000, left: 70, right: 110, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    {children}
  </div>
);

const pop = (t: number, quando: number, fps: number) => spring({ frame: t - f(quando), fps, config: { damping: 13, stiffness: 170 } });

/* ---------- cena 1: gancho ---------- */
const Cena1: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const p = Math.max(0, pop(t, 0.05, fps));
  const flutua = Math.sin(t / 22) * 8;
  return (
    <AbsoluteFill>
      <Etiqueta />
      <Hero>
        <div
          style={{
            scale: String(p),
            translate: `0px ${flutua}px`,
            width: 760,
            padding: "56px 40px 64px",
            borderRadius: 64,
            background: `linear-gradient(160deg, ${BLUE}, #1e3a8a)`,
            textAlign: "center",
            boxShadow: "0 40px 80px -20px rgba(37,99,235,0.7)",
          }}
        >
          <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 58, letterSpacing: "0.12em", color: "rgba(255,255,255,0.85)" }}>
            ALUNOS DE
          </div>
          <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 262, lineHeight: 1, letterSpacing: "-0.04em", color: "white", marginTop: 6 }}>
            2027
          </div>
          <div style={{ width: 300, height: 14, borderRadius: 7, background: AMBER, margin: "18px auto 0" }} />
        </div>
      </Hero>
      <Legenda
        trechos={[
          { de: 0, ate: 1.17, texto: "Transportador escolar," },
          { de: 1.37, ate: 4.25, texto: "você já organizou os seus **alunos de 2027**?" },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- cena 2: a dor vira "pronto" ---------- */
const Tarefa: React.FC<{ texto: string; icone: React.ReactNode; entra: number; pronto: number }> = ({ texto, icone, entra, pronto }) => {
  const e = Math.max(0, Math.min(1, entra));
  const ok = Math.max(0, Math.min(1, pronto));
  return (
    <div
      style={{
        width: 880,
        height: 170,
        borderRadius: 44,
        display: "flex",
        alignItems: "center",
        gap: 32,
        padding: "0 44px",
        background: ok > 0.5 ? BLUE : "rgba(255,255,255,0.12)",
        border: `3px solid ${ok > 0.5 ? "#60a5fa" : "rgba(255,255,255,0.18)"}`,
        boxShadow: ok > 0.5 ? "0 24px 50px -16px rgba(37,99,235,0.8)" : "none",
        opacity: e,
        translate: `0px ${(1 - e) * 40}px`,
        scale: String(1 + 0.04 * Math.sin(ok * Math.PI)),
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          background: ok > 0.5 ? "white" : "rgba(255,255,255,0.16)",
          color: ok > 0.5 ? BLUE : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {ok > 0.5 ? <Check style={{ width: 60, height: 60 }} strokeWidth={4} /> : icone}
      </div>
      <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 52, lineHeight: 1.1, letterSpacing: "-0.02em", color: "white" }}>{texto}</div>
    </div>
  );
};

const Cena2: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const itens = [
    { texto: "Cadastrar aluno por aluno", icone: <Users style={{ width: 54, height: 54 }} strokeWidth={2.6} />, ent: 0.1, ok: 4.95 },
    { texto: "Correr atrás de contrato", icone: <FileText style={{ width: 54, height: 54 }} strokeWidth={2.6} />, ent: 1.8, ok: 5.5 },
    { texto: "Lembrar pai de pagar", icone: <Wallet style={{ width: 54, height: 54 }} strokeWidth={2.6} />, ent: 3.2, ok: 6.05 },
  ];
  return (
    <AbsoluteFill>
      <Hero>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {itens.map((it) => (
            <Tarefa key={it.texto} texto={it.texto} icone={it.icone} entra={pop(t, it.ent, fps)} pronto={pop(t, it.ok, fps)} />
          ))}
        </div>
      </Hero>
      <Legenda
        trechos={[
          { de: 0, ate: 4.48, texto: "Cadastrar aluno por aluno, correr atrás de **contrato**, lembrar pai de pagar." },
          { de: 4.94, ate: 7.4, texto: "Dá para deixar **tudo isso pronto** desde já." },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- celulares (telas reais) ---------- */
const SCALE = 1.86; // celular ocupa quase toda a altura (do topo seguro até o rodapé); a legenda fica por cima
const CelularCentro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", top: 215 }}>{children}</AbsoluteFill>
);

/** Mostra a fase só no intervalo [de, ate) (segundos locais), com fade curto. */
const Fase: React.FC<{ de: number; ate: number; children: (frameLocal: number) => React.ReactNode }> = ({ de, ate, children }) => {
  const t = useT();
  if (t < f(de) || t >= f(ate) + 4) return null;
  const a = interpolate(t, [f(de), f(de) + 5], [0, 1], clamp);
  const b = interpolate(t, [f(ate), f(ate) + 4], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(a, b) }}>{children(t - f(de))}</AbsoluteFill>;
};

const TelaWhatsApp: React.FC<{ n: number }> = ({ n }) => {
  const mensagem = buildPrePassageiroShareMessage(`${LINK_DOMINIO}/cadastro-passageiro/${MOTORISTA.id}`);
  return (
    <CelularCentro>
      <PhoneScreen route="/alunos" scale={SCALE} showChrome={false} contentClassName="">
        <WhatsAppChat contato="Pais da van" mensagem={mensagem} enviaEm={Math.max(10 - n * 0, 10)} />
      </PhoneScreen>
    </CelularCentro>
  );
};

const TelaFormPai: React.FC<{ n: number }> = ({ n }) => {
  const digita = (texto: string, inicio: number, porLetra = 1) =>
    n < inicio ? "" : texto.slice(0, Math.min(texto.length, Math.floor((n - inicio) / porLetra) + 1));
  const values = {
    ano_letivo: "2027",
    nome: digita(NOVO_ALUNO.nome, 3),
    data_nascimento: digita(NOVO_ALUNO.dataNascimento, 24),
    escola_id: n >= 34 ? NOVO_ALUNO.escola.id : "",
    periodo: n >= 38 ? NOVO_ALUNO.periodo : "",
    turma: digita(NOVO_ALUNO.turma, 42),
  };
  const scroll = interpolate(n, [6, 44], [0, 330], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  return (
    <CelularCentro>
      <VideoStateProvider value={{ externalForm: values }}>
        <PhoneScreen route="/cadastro-passageiro/mock" scale={SCALE} showChrome={false} contentClassName="" scrollY={scroll}>
          <PassageiroExternalForm />
        </PhoneScreen>
      </VideoStateProvider>
    </CelularCentro>
  );
};

const TelaSolicitacoes: React.FC<{ n: number }> = ({ n }) => {
  const B = f(7.0) + FADE; // o Finger conta frames desde o início da cena
  return (
  <CelularCentro>
    <PhoneScreen
      route="/alunos"
      pageTitle="Alunos"
      scale={SCALE}
      overlay={<Finger showFrom={B + 2} hideAt={B + 31} steps={[{ at: B + 2, x: 280, y: 520 }, { at: B + 14, x: 200, y: 236 }, { at: B + 19, x: 200, y: 236, tap: true }]} />}
    >
      <Tabs value="solicitacoes" className="w-full space-y-4">
        <AppTabNav
          activeTab="solicitacoes"
          items={[
            { value: "alunos", label: "Alunos" },
            { value: "solicitacoes", label: "Solicitações", badge: 1 },
          ]}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-end px-0.5">
            <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">1 solicitação</span>
          </div>
          <div style={{ opacity: interpolate(n, [0, 8], [0, 1], clamp) }}>
            <PrePassageiros profile={MOCK_PROFILE} prePassageiros={[PRE_PASSAGEIRO]} isLoading={false} />
          </div>
        </div>
      </Tabs>
    </PhoneScreen>
  </CelularCentro>
  );
};

/** Mensagem automática grande (modelo real do WhatsApp Manager), sem celular. */
const MensagemGrande: React.FC<{ rotulo: string; cor: { bg: string; fg: string }; children: React.ReactNode; botao?: React.ReactNode; hora: string; comPix?: boolean; quando: number }> = ({
  rotulo,
  cor,
  children,
  botao,
  hora,
  comPix,
  quando,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const p = Math.max(0, pop(t, quando, fps));
  return (
    <Hero>
      <div style={{ opacity: Math.min(1, p), translate: `0px ${(1 - Math.min(1, p)) * 30}px`, marginBottom: 36 }}>
        <div style={{ padding: "14px 36px", borderRadius: 999, background: cor.bg, color: cor.fg, fontFamily: "Inter", fontWeight: 800, fontSize: 40 }}>{rotulo}</div>
      </div>
      <div style={{ width: 891, height: 700, position: "relative" }}>
        <div style={{ width: 330, scale: String(2.7 * p), transformOrigin: "50% 0%", position: "absolute", left: (891 - 330) / 2, top: 0 }}>
          <WabaMessage motorista="Thiago" hora={hora} botao={botao} comPix={comPix}>
            {children}
          </WabaMessage>
        </div>
      </div>
    </Hero>
  );
};

/* ---------- cena 3: um link para todos, o pai cadastra, você aprova, o contrato vai ---------- */
const Cena3: React.FC = () => (
  <AbsoluteFill>
    <Fase de={0} ate={4.95}>{(n) => <TelaWhatsApp n={n} />}</Fase>
    <Fase de={4.95} ate={7.0}>{(n) => <TelaFormPai n={n} />}</Fase>
    <Fase de={7.0} ate={8.05}>{(n) => <TelaSolicitacoes n={n} />}</Fase>
    <Fase de={8.05} ate={11}>
      {() => (
        <MensagemGrande rotulo="O contrato vai pro WhatsApp do pai" cor={{ bg: "#ecfdf5", fg: "#047857" }} hora="10:02" botao={<BotaoLink texto="Assinar Contrato" />} quando={0.1}>
          {WABA_MODELOS.contrato({ responsavel: "Carla", aluno: "Pedro" })}
        </MensagemGrande>
      )}
    </Fase>
    <Legenda
      degrade
      trechos={[
        { de: 0, ate: 4.8, texto: "No Van360, você manda **um único link**, o mesmo para todos os pais." },
        { de: 5.17, ate: 6.9, texto: "Cada pai faz o **próprio cadastro**," },
        { de: 7.08, ate: 7.95, texto: "você **aprova**," },
        { de: 8.13, ate: 10.3, texto: "e o **contrato** já vai para o WhatsApp dele." },
      ]}
    />
  </AbsoluteFill>
);

/* ---------- cena 4: o pai assina, carteirinha pronta ---------- */
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

const TelaAssina: React.FC<{ n: number }> = ({ n }) => {
  const assinado = n >= 66;
  const dialogo = n < 66;
  const progresso = interpolate(n, [6, 50], [0, 1], clamp);
  return (
    <CelularCentro>
      <VideoStateProvider value={{ assinar: { assinado }, assinatura: { editando: true, progresso } }}>
        <PhoneScreen
          key={`${assinado}`}
          route={`/assinar/tk-${PEDRO_ID}`}
          scale={SCALE}
          showChrome={false}
          contentClassName="tela-cheia"
          overlay={
            <>
              <RolaMain y={640} />
              {dialogo && <SignatureDialog isOpen onClose={noop} onAssinar={noop} isSigning={false} sigCanvas={{ current: null }} />}
              <Finger showFrom={58} hideAt={78} steps={[{ at: 58, x: 340, y: 760 }, { at: 66, x: 293, y: 692 }, { at: 68, x: 293, y: 692, tap: true }]} />
            </>
          }
        >
          <Routes>
            <Route path="/assinar/:token" element={<AssinarContrato />} />
          </Routes>
        </PhoneScreen>
      </VideoStateProvider>
    </CelularCentro>
  );
};

const TelaCarteirinha: React.FC = () => (
  <CelularCentro>
    <PhoneScreen route={`/alunos/${PEDRO_ID}?tab=parcelas&ano=2027`} pageTitle="Carteirinha" scale={SCALE}>
      <Routes>
        <Route path="/alunos/:passageiro_id" element={<PassageiroCarteirinha />} />
      </Routes>
    </PhoneScreen>
  </CelularCentro>
);

const Cena4: React.FC = () => (
  <AbsoluteFill>
    <Fase de={0} ate={2.4}>{(n) => <TelaAssina n={n} />}</Fase>
    <Fase de={2.4} ate={6}>{() => <TelaCarteirinha />}</Fase>
    <Legenda degrade trechos={[{ de: 0, ate: 4.5, texto: "O pai **assina o contrato** pelo celular, e a **carteirinha digital** do aluno já fica pronta." }]} />
  </AbsoluteFill>
);

/* ---------- cena 5: cobrança automática ---------- */
const Cena5: React.FC = () => (
  <AbsoluteFill>
    <MensagemGrande rotulo="No dia do vencimento" cor={{ bg: "#fffbeb", fg: "#b45309" }} hora="07:00" quando={0.1}>
      {WABA_MODELOS.venceHoje({ responsavel: "Carla", aluno: "Pedro", valor: "R$ 308,00" })}
    </MensagemGrande>
    <Legenda
      trechos={[
        { de: 0, ate: 3.3, texto: "E quando a parcela vencer, o app **avisa o pai** no WhatsApp." },
        { de: 3.48, ate: 5.2, texto: "Sem você **precisar cobrar**." },
      ]}
    />
  </AbsoluteFill>
);

/* ---------- cena 6: slogan e chamada ---------- */
const Cena6: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: t + 6, fps, config: { damping: 16, stiffness: 120 } });
  const l1 = Math.min(1, Math.max(0, pop(t, 0.0, fps)));
  const l2 = Math.min(1, Math.max(0, pop(t, 1.15, fps)));
  const botao = Math.max(0, pop(t, 2.55, fps));
  const seta = interpolate(t, [f(4.5), f(4.7)], [0, 1], clamp);
  const quica = Math.sin(t / 5) * 14;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: NAVY }} />
      <div style={{ position: "absolute", top: 280, left: 80, right: 100, textAlign: "center", opacity: entra }}>
        <div style={{ display: "inline-block", background: "white", borderRadius: 36, padding: "22px 38px", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}>
          <img src={staticFile("logo-van360-horizontal.png")} style={{ height: 96, display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 60, right: 100, textAlign: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 96, lineHeight: 1.1, letterSpacing: "-0.035em", whiteSpace: "nowrap" }}>
        <div style={{ color: "white", opacity: l1, translate: `0px ${(1 - l1) * 30}px` }}>Você dirige.</div>
        <div style={{ color: AMBER, opacity: l2, translate: `0px ${(1 - l2) * 30}px` }}>A gente organiza.</div>
      </div>
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            scale: String(botao),
            padding: "36px 64px",
            borderRadius: 999,
            background: AMBER,
            color: NAVY,
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 62,
            boxShadow: "0 24px 50px -12px rgba(0,0,0,0.6)",
          }}
        >
          Teste grátis por 15 dias
        </div>
      </div>
      <div style={{ position: "absolute", top: 1190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: seta, translate: `0px ${quica}px` }}>
        <ArrowDown style={{ width: 96, height: 96, color: AMBER }} strokeWidth={3.6} />
      </div>
      <Legenda trechos={[{ de: 4.5, ate: 6.2, texto: "**Clique agora** e saiba mais." }]} />
    </AbsoluteFill>
  );
};

const temAudio = (n: string) => getStaticFiles().some((s) => s.name === `anuncio-2027/${n}.mp3`);

export const Anuncio2027: React.FC = () => (
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
          <Audio src={staticFile(`anuncio-2027/g${i + 1}.mp3`)} />
        </Sequence>
      ) : null,
    )}
  </AbsoluteFill>
);
