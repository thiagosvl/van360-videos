import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import Cobrancas from "@/pages/Cobrancas";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { ActionSheet } from "@/components/common/ActionSheet";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { PhoneScreen } from "../components/PhoneScreen";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration, useImagensProntas } from "../components/tutorial";
import { VideoStateProvider } from "../mocks/videoState";
import {
  ALUNO_PAGAMENTO,
  FEV_A_RECEBER,
  FEV_RECEBIDAS,
  MARCO_A_RECEBER,
  MARCO_RECEBIDAS,
  MOTORISTA,
  totaisParcelas,
} from "../mocks/data";

/**
 * Tutorial: "Seu financeiro na palma da mão" (tela de Parcelas).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Chega de anotar quem pagou e quem está **devendo**.", from: 0, duration: 150 },
  { text: "Aqui você vê o mês inteiro: quanto vai **receber**, quanto já entrou e o que está atrasado.", from: 150, duration: 180 },
  { text: "Cada parcela tem sua **cor**: pago, a vencer e atrasado.", from: 330, duration: 150 },
  { text: "Recebeu? Busque o aluno e marque como **pago**.", from: 480, duration: 240 },
  { text: "Pronto: ela vai pra **Recebidas** e o painel atualiza.", from: 720, duration: 120 },
  { text: "Toque no aluno e o **recibo** já está pronto para enviar.", from: 840, duration: 180 },
  { text: "E os meses anteriores ficam **guardados**, é só voltar.", from: 1020, duration: 150 },
  { text: "E o melhor: o pai recebe lembretes e cobranças no **WhatsApp**, automaticamente.", from: 1170, duration: 240 },
  { text: "Você cuida da van. O Van360 cuida das **parcelas**.", from: 1410, duration: 120 },
];
export const TUTORIAL_PARCELAS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const BUSCA = "Davi";

// momentos-chave (frames absolutos)
const T = {
  digita: B[4] + 34,
  tocaCard: B[4] + 70,
  tocaRegistrar: B[4] + 110,
  escolhePix: B[4] + 150,
  confirma: B[4] + 200,
  pago: B[4] + 206, // o pagamento "acontece"
  tocaRecebidas: B[5] + 50,
  tocaCardRecebido: B[6] + 24,
  tocaVerRecibo: B[6] + 64,
  fechaRecibo: B[7] - 4,
  tocaMesAnterior: B[7] + 40,
  segundaMensagem: B[8] + 110, // relativo ao início do vídeo
};

// pontos de toque (px do celular 390x844) — conferidos em stills
const P = {
  busca: { x: 190, y: 243 },
  card: { x: 190, y: 341 },
  registrar: { x: 170, y: 572 },
  pix: { x: 195, y: 510 },
  confirmar: { x: 283, y: 752 },
  abaRecebidas: { x: 270, y: 186 },
  mesAnterior: { x: 150, y: 137 },
  cardRecebido: { x: 190, y: 341 },
  verRecibo: { x: 170, y: 633 },
};

/* ------------------------------------------------------------------ */

const ParcelaActions: React.FC<{ cobranca: any; open: boolean }> = ({ cobranca, open }) => {
  const actions = useCobrancaActions({
    cobranca,
    onRegistrarPagamento: noop,
    onVerCarteirinha: noop,
    onEditarCobranca: noop,
    onVerRecibo: cobranca.recibo_url ? noop : undefined,
    onEnviarCobranca: noop,
  } as any);
  return (
    <ActionSheet
      open={open}
      onOpenChange={noop}
      actions={actions
        .filter((a: any) => !a.hidden)
        .map((a: any) => ({ label: a.label, title: a.title, description: a.description, icon: a.icon, onClick: noop, isDestructive: a.isDestructive, hasSeparatorAfter: a.hasSeparatorAfter, swipeColor: a.swipeColor }))}
    >
      <CobrancaSummary cobranca={cobranca} />
    </ActionSheet>
  );
};

/** Celular com a tela real de Parcelas, controlada quadro a quadro. */
const TelaParcelas: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(4);

  const davi = MARCO_A_RECEBER.find((c) => c.passageiro_id === ALUNO_PAGAMENTO)!;
  const daviPago = {
    ...davi,
    status: "pago",
    tipo_pagamento: "PIX",
    data_pagamento: "2026-03-12T10:00:00",
    recibo_url: staticFile("recibos/recibo-davi-marco.png"),
  };

  const fevereiro = frame >= T.tocaMesAnterior + 4;
  const pago = frame >= T.pago;

  let aReceber = fevereiro ? FEV_A_RECEBER : pago ? MARCO_A_RECEBER.filter((c) => c !== davi) : MARCO_A_RECEBER;
  const recebidas = fevereiro ? FEV_RECEBIDAS : pago ? [daviPago, ...MARCO_RECEBIDAS] : MARCO_RECEBIDAS;

  // busca digitada e limpa depois do pagamento
  const chars = Math.floor((frame - T.digita) / 5) + 1;
  const busca = frame >= T.digita && frame < T.pago ? BUSCA.slice(0, Math.min(BUSCA.length, chars)) : "";
  if (busca) aReceber = aReceber.filter((c) => c.passageiro.nome.toLowerCase().includes(busca.toLowerCase()));

  // painel: números enchendo no começo, e "Recebido" subindo depois do pagamento
  const t = interpolate(frame, [26, 80], [0, 1], { ...clamp, easing: ease });
  const totaisAntes = totaisParcelas(MARCO_A_RECEBER, MARCO_RECEBIDAS);
  const totaisDepois = totaisParcelas(MARCO_A_RECEBER.filter((c) => c !== davi), [daviPago, ...MARCO_RECEBIDAS]);
  const totaisFev = totaisParcelas(FEV_A_RECEBER, FEV_RECEBIDAS);
  const k = interpolate(frame, [T.pago + 14, T.pago + 40], [0, 1], { ...clamp, easing: ease });
  const base = fevereiro
    ? totaisFev
    : {
        totalPrevisto: totaisAntes.totalPrevisto,
        totalRecebido: totaisAntes.totalRecebido + (totaisDepois.totalRecebido - totaisAntes.totalRecebido) * k,
        totalAReceber: totaisAntes.totalAReceber + (totaisDepois.totalAReceber - totaisAntes.totalAReceber) * k,
        totalAtrasado: totaisAntes.totalAtrasado,
      };
  const totais = {
    totalPrevisto: base.totalPrevisto,
    totalRecebido: Math.round(base.totalRecebido * t),
    totalAReceber: Math.round(base.totalPrevisto - base.totalRecebido * t),
    totalAtrasado: Math.round(base.totalAtrasado * t),
  };

  const activeTab = frame >= T.tocaRecebidas + 4 ? "recebidas" : "areceber";

  // câmera e rolagem
  const zoom =
    frame < B[2] + 150
      ? interpolate(frame, [B[2] + 10, B[2] + 40], [1, 1.25], { ...clamp, easing: ease })
      : interpolate(frame, [B[2] + 150, B[2] + 178], [1.25, 1], { ...clamp, easing: ease });
  const scroll =
    frame < B[7]
      ? interpolate(frame, [B[3] + 6, B[3] + 30], [0, 200], { ...clamp, easing: ease })
      : interpolate(frame, [B[7], B[7] + 24], [200, 0], { ...clamp, easing: ease });

  const sheetOpen = frame >= T.tocaCard + 6 && frame < T.tocaRegistrar + 6;
  const dialogOpen = frame >= T.tocaRegistrar + 6 && frame < T.confirma + 6;
  const sheetRecebidoOpen = frame >= T.tocaCardRecebido + 6 && frame < T.tocaVerRecibo + 6;
  const reciboOpen = frame >= T.tocaVerRecibo + 6 && frame < T.fechaRecibo;
  useImagensProntas(reciboOpen);
  // barra de meses: só anda quando o vídeo troca de mês
  const mesScroll = interpolate(frame, [T.tocaMesAnterior + 2, T.tocaMesAnterior + 16], [3, 2], { ...clamp, easing: ease });

  return (
    <VideoStateProvider
      value={{
        parcelas: {
          mesFilter: fevereiro ? 2 : 3,
          activeTab,
          buscaAReceber: busca,
          cobrancasAReceber: aReceber,
          paginatedCobrancasAReceber: aReceber,
          cobrancasRecebidas: recebidas,
          paginatedCobrancasRecebidas: recebidas,
          countAReceber: aReceber.length,
          countRecebidos: recebidas.length,
          isPastMonth: fevereiro,
          isCurrentMonth: !fevereiro,
          ...totais,
        },
        pagamento: frame >= T.escolhePix ? { tipo_pagamento: "PIX" } : {},
        mesScroll,
      }}
    >
      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <div style={{ translate: `0px ${rise}px`, scale: String(zoom), transformOrigin: "50% 0%" }}>
          <PhoneScreen
            route="/parcelas"
            pageTitle="Parcelas"
            scale={1.5}
            scrollY={scroll}
            overlay={
              <>
                <ParcelaActions cobranca={davi} open={sheetOpen} />
                <ParcelaActions cobranca={daviPago} open={sheetRecebidoOpen} />
                {reciboOpen && (
                  <ReceiptDialog
                    isOpen
                    onClose={noop}
                    receiptUrl={daviPago.recibo_url}
                    cobrancaId={daviPago.id}
                    mes={3}
                    ano={2026}
                    passageiroId={daviPago.passageiro_id}
                    nomePassageiro={daviPago.passageiro.nome}
                    nomeResponsavel={daviPago.passageiro.responsavel_principal.nome}
                  />
                )}
                {dialogOpen && (
                  <ManualPaymentDialog
                    isOpen
                    onClose={noop}
                    cobrancaId={davi.id}
                    passageiroNome={davi.passageiro.nome}
                    responsavelNome={davi.passageiro.responsavel_principal.nome}
                    valorOriginal={davi.valor}
                    status={davi.status}
                    dataVencimento={davi.data_vencimento}
                    onPaymentRecorded={noop}
                  />
                )}
                <Finger
                  showFrom={B[4] + 10}
                  hideAt={T.confirma + 10}
                  steps={[
                    { at: B[4] + 10, ...P.busca },
                    { at: B[4] + 26, ...P.busca, tap: true },
                    { at: T.tocaCard, ...P.card, tap: true },
                    { at: T.tocaRegistrar, ...P.registrar, tap: true },
                    { at: T.escolhePix, ...P.pix, tap: true },
                    { at: T.confirma, ...P.confirmar, tap: true },
                  ]}
                />
                <Finger
                  showFrom={B[5] + 40}
                  hideAt={T.tocaRecebidas + 14}
                  steps={[
                    { at: B[5] + 40, ...P.abaRecebidas },
                    { at: T.tocaRecebidas, ...P.abaRecebidas, tap: true },
                  ]}
                />
                <Finger
                  showFrom={B[6] + 6}
                  hideAt={T.tocaVerRecibo + 12}
                  steps={[
                    { at: B[6] + 6, ...P.cardRecebido },
                    { at: T.tocaCardRecebido, ...P.cardRecebido, tap: true },
                    { at: T.tocaVerRecibo, ...P.verRecibo, tap: true },
                  ]}
                />
                <Finger
                  showFrom={B[7] + 22}
                  hideAt={T.tocaMesAnterior + 14}
                  steps={[
                    { at: B[7] + 22, ...P.mesAnterior },
                    { at: T.tocaMesAnterior, ...P.mesAnterior, tap: true },
                  ]}
                />
              </>
            }
          >
            <Cobrancas />
          </PhoneScreen>
        </div>
      </AbsoluteFill>
    </VideoStateProvider>
  );
};

/** Mensagens automáticas no WhatsApp do pai (modelos reais do WhatsApp Manager). */
const MENSAGENS = [
  {
    quando: "No dia do vencimento",
    cor: { bg: "#fffbeb", fg: "#b45309" },
    corpo: WABA_MODELOS.venceHoje({ responsavel: "Renata", aluno: "Miguel", valor: "R$ 280,00" }),
    hora: "07:00",
  },
  {
    quando: "Se a parcela atrasar",
    cor: { bg: "#fef2f2", fg: "#e7000b" },
    corpo: WABA_MODELOS.atrasado({ responsavel: "Marcos", aluno: "Lucas", mes: "Fevereiro", valor: "R$ 280,00" }),
    hora: "07:00",
  },
];

const Mensagem: React.FC<{ m: (typeof MENSAGENS)[number]; entra: number; sai?: number }> = ({ m, entra, sai }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - entra, fps, config: { damping: 14, mass: 0.7 } });
  const x = sai !== undefined ? interpolate(frame, [sai, sai + 16], [0, -1150], { ...clamp, easing: ease }) : 0;
  const xIn = interpolate(frame, [entra - 4, entra + 12], [entra === 16 ? 0 : 1150, 0], { ...clamp, easing: ease });
  if (frame < entra - 4) return null;
  return (
    <AbsoluteFill style={{ translate: `${x + xIn}px 0px` }}>
      <div style={{ position: "absolute", top: 610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "12px 30px", borderRadius: 999, background: m.cor.bg, color: m.cor.fg, fontFamily: "Inter", fontWeight: 700, fontSize: 36 }}>
          {m.quando}
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: 700 }}>
        <div style={{ width: 330, scale: String(2.7 * (entra === 16 ? pop : 1)), transformOrigin: "50% 0%" }}>
          <WabaMessage motorista={MOTORISTA.apelido} hora={m.hora}>
            {m.corpo}
          </WabaMessage>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TelaWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 18], [1150, 0], { ...clamp, easing: ease });
  const troca = T.segundaMensagem - B[8];
  return (
    <AbsoluteFill style={{ translate: `${enter}px 0px` }}>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "8px 22px", borderRadius: 999, background: "#ecfdf5", color: "#047857", fontFamily: "Inter", fontWeight: 700, fontSize: 26 }}>
          Celular do pai
        </div>
      </div>
      <Mensagem m={MENSAGENS[0]} entra={16} sai={troca} />
      <Mensagem m={MENSAGENS[1]} entra={troca + 4} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const TutorialParcelas: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[9] + 20, B[9] + 40], [0, 1], clamp);
  const sai = interpolate(frame, [B[8], B[8] + 18], [0, -1150], { ...clamp, easing: ease });

  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <Sequence durationInFrames={B[8] + 20} name="Parcelas">
        <AbsoluteFill style={{ translate: `${sai}px 0px` }}>
          <TelaParcelas />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={B[8]} name="WhatsApp do pai">
        <TelaWhatsApp />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};

