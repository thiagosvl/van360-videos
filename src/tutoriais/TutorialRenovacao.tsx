import React, { useEffect, useRef } from "react";
import { AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Routes, Route } from "react-router-dom";
import Renovacoes from "@/pages/Renovacoes";
import PublicRenovacaoPage from "@/pages/PublicRenovacaoPage";
import AssinarContrato from "@/pages/AssinarContrato";
import PassageiroCarteirinha from "@/pages/PassageiroCarteirinha";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { ConfigurarPeriodoAnoDialog } from "@/components/dialogs/ConfigurarPeriodoAnoDialog";
import { ReajusteLoteDialog } from "@/components/dialogs/ReajusteLoteDialog";
import { ConfirmarDisparoWabaDialog } from "@/components/dialogs/ConfirmarDisparoWabaDialog";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { Banner } from "@/components/ui/Banner";
import { RenovacaoStickyBar } from "@/components/features/renovacao/RenovacaoStickyBar";
import { usarHoje } from "../clock";
import { PhoneScreen } from "../components/PhoneScreen";
import { AcoesNaTela, Acao } from "../components/AcoesNaTela";
import { RolaElemento } from "../components/Rola";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { VideoStateProvider } from "../mocks/videoState";
import { ANO_DESTINO, EstadoRenovacao, dadosRenovacao } from "../mocks/renovacao";
import { MOTORISTA, PEDRO_ID } from "../mocks/data";
import { BotaoLink, WabaMessage, WABA_MODELOS } from "../components/WabaMessage";

/**
 * Apresentação: Renovação de 2026 para 2027 (o vídeo se passa em 10/12/2026).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Ano novo, aluno renovado, **sem correria**.", from: 0, duration: 118 },
  { text: "Você define uma vez **quando começam e terminam** as parcelas de 2027.", from: 118, duration: 168 },
  { text: "E deixa o **contrato digital** ligado para o novo ano.", from: 286, duration: 110 },
  { text: "Vai ter aumento? Marca todos, escolhe o percentual e aplica **10% de uma vez**.", from: 396, duration: 192 },
  { text: "Já sabe quem fica? Abre o aluno e **você mesmo** confirma a vaga.", from: 588, duration: 140 },
  { text: "Para os outros, marca os pendentes e a renovação vai **pelo WhatsApp**, de uma vez.", from: 728, duration: 165 },
  { text: "O pai recebe o link **no celular** e toca para confirmar.", from: 893, duration: 112 },
  { text: "Confere o novo valor, já com o reajuste, e **confirma a vaga**.", from: 1005, duration: 132 },
  { text: "E já **assina o contrato** de 2027 com o dedo, ali mesmo na tela.", from: 1137, duration: 145 },
  { text: "Confirmou? A **carteirinha de 2027** já fica pronta.", from: 1282, duration: 135 },
  { text: "Você vê quem **confirmou**, quem falta e quem **sai**.", from: 1417, duration: 120 },
  { text: "Renovação feita, **vaga garantida**.", from: 1537, duration: 110 },
]
export const TUTORIAL_RENOVACAO_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;

const TODOS = dadosRenovacao({}).passageiros.map((p) => p.passageiro_id);
const LAURA = "p7"; // o pai já tinha avisado que não renova
const ANA = "p1";

/* ------------------------------------------------------------------ */
/* trechos: cada um é "um celular" em cena                             */
/* ------------------------------------------------------------------ */
type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "app", from: 0, to: B[7], label: "Seu celular" },
  { id: "whatsapp", from: B[7], to: B[8], label: "Celular do pai" },
  { id: "pai", from: B[8], to: B[10], label: "Celular do pai" },
  { id: "carteirinha", from: B[10], to: B[11], label: "Seu celular" },
  { id: "fim", from: B[11], to: TUTORIAL_RENOVACAO_DURATION, label: "Seu celular" },
];

const SegmentShell: React.FC<{ seg: Segment; first: boolean; last: boolean; children: React.ReactNode }> = ({ seg, first, last, children }) => {
  const frame = useCurrentFrame();
  const len = seg.to - seg.from;
  const rise = usePhoneRise(4);
  const enter = first ? 0 : interpolate(frame, [0, SLIDE], [1150, 0], { ...clamp, easing: ease });
  const exit = last ? 0 : interpolate(frame, [len, len + SLIDE], [0, -1150], { ...clamp, easing: ease });
  const labelIn = interpolate(frame, [first ? 20 : 6, (first ? 20 : 6) + 10], [0, 1], clamp);
  const pai = seg.label === "Celular do pai";
  return (
    <AbsoluteFill style={{ translate: `${enter + exit}px 0px` }}>
      <div style={{ position: "absolute", top: PHONE_TOP - 74, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: labelIn }}>
        <div
          style={{
            padding: "10px 26px",
            borderRadius: 999,
            background: pai ? "#ecfdf5" : "#eef3ff",
            color: pai ? "#047857" : BRAND.blue,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.02em",
          }}
        >
          {seg.label}
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: PHONE_TOP }}>
        <div style={{ translate: first ? `0px ${rise}px` : undefined }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* pontos de toque (px do celular 390x844), conferidos em stills       */
/* ------------------------------------------------------------------ */
const P = {
  configurarPeriodo: { x: 195, y: 286 },
  salvarPeriodo: { x: 281, y: 646 },
  marcarTodos: { x: 85, y: 567 },
  reajustar: { x: 108, y: 671 },
  aplicar: { x: 280, y: 760 },
  anaCard: { x: 160, y: 625 },
  confirmarAna: { x: 301, y: 632 },
  confirmarVaga: { x: 282, y: 508 },
  marcarPendentes: { x: 216, y: 567 },
  disparar: { x: 282, y: 671 },
  enviar: { x: 265, y: 712 },
  confirmarPai: { x: 195, y: 770 },
  confirmarEAssinar: { x: 281, y: 550 },
  assinar: { x: 195, y: 790 },
  confirmarAssinatura: { x: 283, y: 692 },
};

/* ------------------------------------------------------------------ */
/* Seu celular: período, contrato, reajuste, confirmação e WhatsApp    */
/* ------------------------------------------------------------------ */
const T = {
  tocaConfigurar: B[1] + 105,
  abreConfig: B[1] + 112,
  passosConfig: [B[2] + 15, B[2] + 30, B[2] + 45, B[2] + 60],
  tocaSalvar: B[2] + 150,
  periodo: B[2] + 158,
  // no ritmo da fala: "marca todos", "escolhe o percentual", "e aplica"
  tocaMarcarTodos: B[4] + 50,
  tocaReajustar: B[4] + 70,
  abreReajuste: B[4] + 76,
  passosReajuste: [B[4] + 92, B[4] + 108, B[4] + 124],
  tocaAplicar: B[4] + 160,
  reajustado: B[4] + 167,
  // "abre o aluno" e "confirma a vaga"
  tocaAna: B[5] + 44,
  tocaConfirmarAna: B[5] + 74,
  abreConfirmar: B[5] + 80,
  tocaConfirmarVaga: B[5] + 112,
  anaConfirmada: B[5] + 118,
  // "marca os pendentes" e "vai pelo WhatsApp"
  tocaMarcarPendentes: B[6] + 44,
  tocaDisparar: B[6] + 74,
  abreDisparo: B[6] + 80,
  tocaEnviar: B[6] + 130,
  enviado: B[6] + 136,
};

const PASSOS_CONFIG: Acao[] = [
  { escolher: 0, valor: "2" },
  { escolher: 1, valor: String(ANO_DESTINO) },
  { escolher: 2, valor: "12" },
  { escolher: 3, valor: String(ANO_DESTINO) },
];
const PASSOS_REAJUSTE: Acao[] = [
  { tocar: "Valor da Parcela" },
  { tocarSeletor: '[role="radio"]', indice: 1 },
  { digitar: "Ex: 10%", valor: "10" },
];

const passoAte = (frame: number, tempos: number[]) => tempos.filter((t) => frame >= t).length;

/**
 * Mantém o card de um aluno aberto em TODOS os quadros. O card guarda o "aberto" em estado interno e
 * a lista às vezes o recria (fechado): por isso confere a cada quadro e só toca se estiver fechado.
 * (Antes um único toque deixava o card abrir e fechar num piscar de olhos.)
 */
const MantemCardAberto: React.FC<{ nome: string }> = ({ nome }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = delayRender("Abrindo o card");
    let raf = 0;
    const confere = (tentativa: number): void => {
      const tela = ref.current?.closest<HTMLElement>(".phone-screen");
      const alvo = Array.from(tela?.querySelectorAll<HTMLElement>("h3, span, p, div") ?? []).find(
        (el) => el.textContent?.trim() === nome && el.children.length === 0 && !el.closest('[role="dialog"]'),
      );
      const card = alvo?.closest<HTMLElement>('[class*="rounded-[20px]"]'); // o card do aluno
      const aberto = !!card && card.children.length > 1;
      // um toque só por vez: o React precisa de um quadro para mostrar o card aberto
      if (alvo && !aberto && tentativa === 0) {
        alvo.click();
        raf = requestAnimationFrame(() => requestAnimationFrame(() => confere(1)));
        return;
      }
      if (!alvo && tentativa < 10) raf = requestAnimationFrame(() => confere(tentativa + 1));
      else continueRender(handle);
    };
    raf = requestAnimationFrame(() => confere(0));
    return () => {
      cancelAnimationFrame(raf);
      continueRender(handle);
    };
  });
  return <div ref={ref} />;
};

const TelaApp: React.FC = () => {
  const frame = useCurrentFrame();

  const estado: EstadoRenovacao = {
    periodo: frame >= T.periodo,
    reajuste: frame >= T.reajustado ? 10 : 0,
    status: { [LAURA]: "recusado", ...(frame >= T.anaConfirmada ? { [ANA]: "confirmado" } : {}) },
    notificados: frame >= T.enviado ? TODOS.filter((id) => id !== LAURA && id !== ANA) : [],
    selecionados:
      frame >= T.tocaMarcarTodos + 4 && frame < T.reajustado
        ? TODOS
        : frame >= T.tocaMarcarPendentes + 4 && frame < T.enviado
          ? TODOS.filter((id) => id !== LAURA && id !== ANA)
          : [],
  };

  const configAberta = frame >= T.abreConfig && frame < T.periodo;
  const passoConfig = passoAte(frame, T.passosConfig);
  const reajusteAberto = frame >= T.abreReajuste && frame < T.reajustado;
  const passoReajuste = passoAte(frame, T.passosReajuste);
  const confirmarAberto = frame >= T.abreConfirmar && frame < T.anaConfirmada;
  const disparoAberto = frame >= T.abreDisparo && frame < T.enviado;

  // rolagem: contrato digital (beat 3) e a lista (depois)
  let scroll = 0;
  if (frame >= B[3] && frame < B[4]) scroll = interpolate(frame, [B[3] + 10, B[3] + 40], [0, 200], { ...clamp, easing: ease });
  else if (frame >= B[4]) {
    scroll = interpolate(frame, [B[4], B[4] + 15], [200, 330], { ...clamp, easing: ease });
    // card da Ana aberto: desce até os botões de status e volta para a lista
    scroll += interpolate(frame, [T.tocaAna + 8, T.tocaAna + 26, T.anaConfirmada + 10, B[6] + 8], [0, 170, 170, 0], { ...clamp, easing: ease });
  }

  const disparoLista = dadosRenovacao(estado).passageiros.filter((p) => estado.selecionados?.includes(p.passageiro_id));

  return (
    <VideoStateProvider value={{ renovacao: estado }}>
      <PhoneScreen
        route={`/renovacoes?ano=${ANO_DESTINO}`}
        pageTitle="Renovação"
        scale={SCALE}
        scrollY={scroll}
        overlay={
          <>
            {configAberta && (
              <React.Fragment key={`config-${passoConfig}`}>
                <ConfigurarPeriodoAnoDialog isOpen onClose={noop} anoDestino={ANO_DESTINO} />
                <AcoesNaTela passos={PASSOS_CONFIG.slice(0, passoConfig)} />
              </React.Fragment>
            )}
            {reajusteAberto && (
              <React.Fragment key={`reajuste-${passoReajuste}`}>
                <ReajusteLoteDialog isOpen onClose={noop} anoDestino={ANO_DESTINO} passageiroIds={TODOS} />
                <AcoesNaTela passos={PASSOS_REAJUSTE.slice(0, passoReajuste)} />
              </React.Fragment>
            )}
            {confirmarAberto && (
              <ConfirmationDialog
                open
                onOpenChange={noop}
                title="Confirmar vaga de Ana?"
                description={
                  <div className="space-y-3">
                    <p>
                      A vaga de <strong>Ana Beatriz Souza</strong> será confirmada para o ano letivo de <strong>{ANO_DESTINO}</strong> e a
                      matrícula será gerada imediatamente.
                    </p>
                  </div>
                }
                onConfirm={noop}
                confirmText="Confirmar Vaga"
                cancelText="Voltar"
                variant="success"
              />
            )}
            {/* o card da Ana abre (estado interno do card): toca nele uma vez, em qualquer aba do render */}
            {frame >= T.tocaAna + 4 && frame < T.anaConfirmada && <MantemCardAberto nome="Ana Beatriz Souza" />}
            {/* barra de ações dos alunos marcados (a da página fica presa ao fim da página no vídeo) */}
            {(estado.selecionados?.length ?? 0) > 0 && !reajusteAberto && !disparoAberto && (
              <RenovacaoStickyBar
                selectedCount={estado.selecionados!.length}
                onClearSelection={noop}
                onDispararWhatsApp={noop}
                onConfirmarLote={noop}
                onSaidaLote={noop}
                onPendenteLote={noop}
                onOpenReajuste={noop}
              />
            )}
            {disparoAberto && <ConfirmarDisparoWabaDialog isOpen onClose={noop} passageiros={disparoLista as any} anoDestino={ANO_DESTINO} />}
            <Finger
              showFrom={T.tocaConfigurar - 24}
              hideAt={T.tocaSalvar + 8}
              steps={[
                { at: T.tocaConfigurar - 24, ...P.configurarPeriodo },
                { at: T.tocaConfigurar, ...P.configurarPeriodo, tap: true },
                { at: T.passosConfig[0] - 2, x: 144, y: 486, tap: true },
                { at: T.passosConfig[1] - 2, x: 305, y: 486, tap: true },
                { at: T.passosConfig[2] - 2, x: 144, y: 568, tap: true },
                { at: T.passosConfig[3] - 2, x: 305, y: 568, tap: true },
                { at: T.tocaSalvar, ...P.salvarPeriodo, tap: true },
              ]}
            />
            <Finger
              showFrom={T.tocaMarcarTodos - 18}
              hideAt={T.tocaAplicar + 8}
              steps={[
                { at: T.tocaMarcarTodos - 18, ...P.marcarTodos },
                { at: T.tocaMarcarTodos, ...P.marcarTodos, tap: true },
                { at: T.tocaReajustar, ...P.reajustar, tap: true },
                { at: T.passosReajuste[0] - 2, x: 79, y: 358, tap: true },
                { at: T.passosReajuste[1] - 2, x: 152, y: 533, tap: true },
                { at: T.passosReajuste[2] - 2, x: 195, y: 672, tap: true },
                { at: T.tocaAplicar, ...P.aplicar, tap: true },
              ]}
            />
            <Finger
              showFrom={T.tocaAna - 18}
              hideAt={T.tocaConfirmarVaga + 8}
              steps={[
                { at: T.tocaAna - 18, ...P.anaCard },
                { at: T.tocaAna, ...P.anaCard, tap: true },
                { at: T.tocaConfirmarAna, ...P.confirmarAna, tap: true },
                { at: T.tocaConfirmarVaga, ...P.confirmarVaga, tap: true },
              ]}
            />
            <Finger
              showFrom={T.tocaMarcarPendentes - 18}
              hideAt={T.tocaEnviar + 8}
              steps={[
                { at: T.tocaMarcarPendentes - 18, ...P.marcarPendentes },
                { at: T.tocaMarcarPendentes, ...P.marcarPendentes, tap: true },
                { at: T.tocaDisparar, ...P.disparar, tap: true },
                { at: T.tocaEnviar, ...P.enviar, tap: true },
              ]}
            />
          </>
        }
      >
        <Routes>
          <Route path="/renovacoes" element={<Renovacoes />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: a mensagem automática (modelo real do WhatsApp)    */
/* ------------------------------------------------------------------ */
const TOQUE_LINK = 88;
const TelaWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.7 } });
  return (
    <div style={{ width: 891, height: 1000, position: "relative" }}>
      <div style={{ width: 330, scale: String(2.7 * pop), transformOrigin: "50% 0%", position: "absolute", left: (891 - 330) / 2, top: 80 }}>
        <WabaMessage motorista={MOTORISTA.apelido} hora="10:20" botao={<BotaoLink texto="Confirmar Transporte" />}>
          {WABA_MODELOS.renovacao({ responsavel: "Carla", aluno: "Pedro", ano: ANO_DESTINO })}
        </WabaMessage>
      </div>
      <Finger showFrom={46} hideAt={TOQUE_LINK + 10} steps={[{ at: 46, x: 445, y: 668 }, { at: TOQUE_LINK, x: 445, y: 668, tap: true }]} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Celular do pai: confere, confirma e assina                          */
/* ------------------------------------------------------------------ */
const A = {
  tocaConfirmar: 70,
  abreConfirmar: 76,
  tocaConfirmarEAssinar: 120,
  noContrato: 128,
  tocaAssinar: B[9] - B[8] + 22,
  abreAssinatura: B[9] - B[8] + 28,
  tocaQuadro: B[9] - B[8] + 44,
  desenhaDe: B[9] - B[8] + 50,
  desenhaAte: B[9] - B[8] + 100,
  tocaConfirmarAssinatura: B[9] - B[8] + 116,
  assinado: B[9] - B[8] + 124,
};

const TelaPai: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a B[8]
  const noContrato = frame >= A.noContrato;
  const assinado = frame >= A.assinado;
  const dialogoAssinatura = frame >= A.abreAssinatura && frame < A.assinado;
  const editando = frame >= A.tocaQuadro + 4;
  const progresso = interpolate(frame, [A.desenhaDe, A.desenhaAte], [0, 1], clamp);
  const rolaPagina = interpolate(frame, [12, 50], [0, 260], { ...clamp, easing: ease });

  const route = noContrato ? `/assinar/tk-2027` : `/renovacao/ren-${PEDRO_ID}`;
  return (
    <VideoStateProvider
      value={{
        renovacao: { periodo: true, reajuste: 10, status: noContrato ? { [PEDRO_ID]: "confirmado" } : {} },
        assinar: { assinado, arquivo: "pedro-2027", anoLetivo: ANO_DESTINO },
        assinatura: { editando, progresso },
      }}
    >
      <PhoneScreen
        key={`${route}-${assinado}-${dialogoAssinatura}-${editando}`}
        route={route}
        scale={SCALE}
        showChrome={false}
        contentClassName={noContrato ? "tela-cheia" : "tela-cheia tela-cheia-fixa"}
        overlay={
          <>
            {!noContrato && <RolaElemento seletor="main" y={rolaPagina} />}
            {frame >= A.abreConfirmar && !noContrato && (
              <ConfirmationDialog
                open
                onOpenChange={noop}
                title="Confirmar vaga de Pedro?"
                description={
                  <div className="space-y-3">
                    <p>
                      Você confirma a renovação da vaga de <strong>Pedro Henrique</strong> para o transporte escolar em <strong>{ANO_DESTINO}</strong>?
                    </p>
                    <Banner
                      variant="info"
                      title="Contrato Digital"
                      description="Ao confirmar, você será direcionado para assinar o contrato digital do novo ano letivo."
                      className="rounded-[18px]"
                    />
                  </div>
                }
                onConfirm={noop}
                confirmText="Confirmar e Assinar"
                cancelText="Voltar"
                variant="success"
              />
            )}
            {dialogoAssinatura && <SignatureDialog isOpen onClose={noop} onAssinar={noop} isSigning={false} sigCanvas={{ current: null }} />}
            <Finger
              showFrom={A.tocaConfirmar - 20}
              hideAt={A.tocaConfirmarEAssinar + 8}
              steps={[
                { at: A.tocaConfirmar - 20, ...P.confirmarPai },
                { at: A.tocaConfirmar, ...P.confirmarPai, tap: true },
                { at: A.tocaConfirmarEAssinar, ...P.confirmarEAssinar, tap: true },
              ]}
            />
            <Finger
              showFrom={A.tocaAssinar - 18}
              hideAt={A.tocaQuadro + 8}
              steps={[
                { at: A.tocaAssinar - 18, ...P.assinar },
                { at: A.tocaAssinar, ...P.assinar, tap: true },
                { at: A.tocaQuadro, x: 195, y: 419, tap: true },
              ]}
            />
            <Finger
              showFrom={A.desenhaAte + 2}
              hideAt={A.tocaConfirmarAssinatura + 8}
              steps={[{ at: A.desenhaAte + 2, ...P.confirmarAssinatura }, { at: A.tocaConfirmarAssinatura, ...P.confirmarAssinatura, tap: true }]}
            />
          </>
        }
      >
        <Routes>
          <Route path="/renovacao/:token" element={<PublicRenovacaoPage />} />
          <Route path="/assinar/:token" element={<AssinarContrato />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Seu celular: carteirinha de 2027 e a lista final                    */
/* ------------------------------------------------------------------ */
const ESTADO_FINAL: EstadoRenovacao = {
  periodo: true,
  reajuste: 10,
  status: { [LAURA]: "recusado", [ANA]: "confirmado", [PEDRO_ID]: "confirmado" },
  notificados: TODOS.filter((id) => id !== LAURA && id !== ANA),
};

const TelaCarteirinha: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [60, 100], [0, 220], { ...clamp, easing: ease });
  return (
    <VideoStateProvider value={{ renovacao: ESTADO_FINAL }}>
      <PhoneScreen route={`/alunos/${PEDRO_ID}?tab=parcelas&ano=${ANO_DESTINO}`} pageTitle="Carteirinha" scale={SCALE} scrollY={scroll}>
        <Routes>
          <Route path="/alunos/:passageiro_id" element={<PassageiroCarteirinha />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

const TelaFim: React.FC = () => {
  const frame = useCurrentFrame();
  // desce pela lista: Ana e Pedro confirmados, Laura saindo, o resto pendente
  const scroll = interpolate(frame, [30, 90], [330, 780], { ...clamp, easing: ease });
  return (
  <VideoStateProvider value={{ renovacao: ESTADO_FINAL }}>
    <PhoneScreen route={`/renovacoes?ano=${ANO_DESTINO}`} pageTitle="Renovação" scale={SCALE} scrollY={scroll}>
      <Routes>
        <Route path="/renovacoes" element={<Renovacoes />} />
      </Routes>
    </PhoneScreen>
  </VideoStateProvider>
  );
};

const TELAS: Record<string, React.FC> = {
  app: TelaApp,
  whatsapp: TelaWhatsApp,
  pai: TelaPai,
  carteirinha: TelaCarteirinha,
  fim: TelaFim,
};

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const P8 = B[8]; // início do celular do pai (A é relativo a ele)
const SFX: SfxEvent[] = [
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  // período das parcelas
  { at: T.tocaConfigurar, sfx: "tap" },
  { at: T.abreConfig, sfx: "open", volume: 0.5 },
  ...T.passosConfig.map((t): SfxEvent => ({ at: t - 2, sfx: "tap" })),
  ...T.passosConfig.map((t): SfxEvent => ({ at: t + 2, sfx: "select", volume: 0.5 })),
  { at: T.tocaSalvar, sfx: "tap" },
  { at: T.periodo, sfx: "success", volume: 0.65 },
  // reajuste de 10%
  { at: T.tocaMarcarTodos, sfx: "tap" },
  { at: T.tocaReajustar, sfx: "tap" },
  { at: T.abreReajuste, sfx: "open", volume: 0.5 },
  ...T.passosReajuste.map((t): SfxEvent => ({ at: t - 2, sfx: "tap" })),
  { at: T.passosReajuste[2] + 2, sfx: "select", volume: 0.4 },
  { at: T.passosReajuste[2] + 6, sfx: "select", volume: 0.4 },
  { at: T.tocaAplicar, sfx: "tap" },
  { at: T.reajustado, sfx: "success", volume: 0.7 },
  // você confirma a Ana
  { at: T.tocaAna, sfx: "tap" },
  { at: T.tocaAna + 4, sfx: "open", volume: 0.45 },
  { at: T.tocaConfirmarAna, sfx: "tap" },
  { at: T.abreConfirmar, sfx: "open", volume: 0.5 },
  { at: T.tocaConfirmarVaga, sfx: "tap" },
  { at: T.anaConfirmada, sfx: "success", volume: 0.7 },
  // WhatsApp para os pendentes
  { at: T.tocaMarcarPendentes, sfx: "tap" },
  { at: T.tocaDisparar, sfx: "tap" },
  { at: T.abreDisparo, sfx: "open", volume: 0.5 },
  { at: T.tocaEnviar, sfx: "tap" },
  { at: T.enviado, sfx: "success", volume: 0.7 },
  // trocas de celular
  ...SEGMENTS.slice(0, -1).map((s): SfxEvent => ({ at: s.to, sfx: "whoosh", volume: 0.55 })),
  // celular do pai
  { at: B[7] + 10, sfx: "vibra", volume: 0.45 },
  { at: B[7] + 12, sfx: "notif", volume: 0.8 },
  { at: B[7] + TOQUE_LINK, sfx: "tap" },
  { at: P8 + A.tocaConfirmar, sfx: "tap" },
  { at: P8 + A.abreConfirmar, sfx: "open", volume: 0.5 },
  { at: P8 + A.tocaConfirmarEAssinar, sfx: "tap" },
  { at: P8 + A.tocaAssinar, sfx: "tap" },
  { at: P8 + A.abreAssinatura, sfx: "open", volume: 0.5 },
  { at: P8 + A.tocaQuadro, sfx: "tap" },
  { at: P8 + A.tocaConfirmarAssinatura, sfx: "tap" },
  { at: P8 + A.assinado, sfx: "success", volume: 0.75 },
  // logo
  { at: B[12] + 20, sfx: "chime", volume: 0.6 },
];

export const TutorialRenovacao: React.FC = () => {
  usarHoje("2026-12-10T13:00:00Z");
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[12] + 20, B[12] + 40], [0, 1], clamp);
  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <Narracao pasta="renovacao" beats={BEATS} />
      <Sfx events={SFX} />
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

