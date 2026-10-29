import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import PassageiroCarteirinha from "@/pages/PassageiroCarteirinha";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { AnnualReceiptDialog } from "@/components/dialogs/AnnualReceiptDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { ParcelaActions } from "../components/ParcelaActions";
import { TelaAlunos } from "../components/TelaAlunos";
import { BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration, useImagensProntas } from "../components/tutorial";
import { ANA_ID, ANA_PARCELAS_2026, PASSAGEIROS } from "../mocks/data";

/**
 * Tutorial: "Tudo sobre cada aluno, em um só lugar" (Carteirinha Digital, visão do motorista).
 * Falas = roteiro. Para encaixar narração, ajuste `from`/`duration`.
 */
export const BEATS: Beat[] = [
  { text: "Cada aluno tem a sua **carteirinha digital**, com tudo em um só lugar.", from: 0, duration: 150 },
  { text: "Na aba Parcelas, o ano inteiro: o que já foi **pago** e o que falta.", from: 150, duration: 180 },
  { text: "Cada pagamento gera o **recibo** na hora, pronto para enviar ao pai.", from: 330, duration: 180 },
  { text: "E com o ano todo pago, o **recibo anual** sai automaticamente.", from: 510, duration: 180 },
  { text: "Escola, transporte e valor da parcela, sempre **à mão**.", from: 690, duration: 150 },
  { text: "Os **responsáveis** e o WhatsApp deles, a um toque.", from: 840, duration: 150 },
  { text: "E o **contrato** do aluno: você vê na hora se já foi assinado.", from: 990, duration: 150 },
  { text: "Organização de verdade, **aluno por aluno**.", from: 1140, duration: 120 },
];
export const TUTORIAL_CARTEIRINHA_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};

// momentos-chave (frames absolutos)
const T = {
  tocaAluno: 54,
  abreCarteirinha: 62,
  tocaMarco: B[3] + 24,
  tocaVerRecibo: B[3] + 64,
  tocaAnoAnterior: B[4] + 24,
  tocaReciboAnual: B[4] + 74,
  tocaDados: B[5] + 18,
  tocaResponsaveis: B[6] + 18,
  tocaContrato: B[7] + 24,
};

// pontos de toque (px do celular 390x844) — conferidos em stills
const P = {
  aluno: { x: 182, y: 483 },
  marco: { x: 190, y: 446 },
  verRecibo: { x: 170, y: 637 },
  anoAnterior: { x: 38, y: 128 },
  reciboAnual: { x: 301, y: 524 },
  abaDados: { x: 193, y: 451 },
  abaResponsaveis: { x: 316, y: 451 },
  abaContrato: { x: 271, y: 451 },
};

const ANA_MARCO = ANA_PARCELAS_2026.find((c) => c.mes === 3)!;
const ANA_MARCO_COM_RECIBO = { ...ANA_MARCO, recibo_url: staticFile("recibos/recibo-ana-marco.png") };

export const TutorialCarteirinha: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(4);

  /* ---------- qual tela está aberta ---------- */
  const naLista = frame < T.abreCarteirinha;
  const tab =
    frame >= T.tocaContrato + 4
      ? "contrato"
      : frame >= T.tocaResponsaveis + 4
        ? "responsaveis"
        : frame >= T.tocaDados + 4
          ? "dados-pessoais"
          : "parcelas";
  const ano = frame >= T.tocaAnoAnterior + 4 && frame < T.tocaDados + 4 ? "2025" : "2026";
  const route = naLista ? "/alunos" : `/alunos/${ANA_ID}?tab=${tab}&ano=${ano}`;

  /* ---------- rolagem ---------- */
  let scroll = 0;
  if (frame < B[3] + 10) {
    scroll = interpolate(frame, [B[2] + 20, B[2] + 100, B[2] + 130, B[2] + 170], [0, 380, 380, 280], { ...clamp, easing: ease });
  } else if (frame < B[4]) {
    scroll = 280;
  } else if (frame < B[5]) {
    scroll = 0;
  } else if (frame < B[6]) {
    scroll = interpolate(frame, [B[5] + 30, B[5] + 60, B[5] + 90, B[5] + 135], [0, 260, 260, 620], { ...clamp, easing: ease });
  } else if (frame < B[7]) {
    scroll = interpolate(frame, [B[6] + 50, B[6] + 100, B[7] - 14, B[7]], [0, 200, 200, 0], { ...clamp, easing: ease });
  }

  /* ---------- diálogos ---------- */
  const sheetOpen = frame >= T.tocaMarco + 6 && frame < T.tocaVerRecibo + 6;
  const reciboOpen = frame >= T.tocaVerRecibo + 6 && frame < B[4] - 4;
  const anualOpen = frame >= T.tocaReciboAnual + 6 && frame < B[5] - 4;
  useImagensProntas(reciboOpen || anualOpen);

  const logoIn = interpolate(frame, [B[8] + 20, B[8] + 40], [0, 1], clamp);

  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <div style={{ translate: `0px ${rise}px` }}>
          <PhoneScreen
            key={route}
            route={route}
            pageTitle={naLista ? "Alunos" : "Carteirinha"}
            scale={1.5}
            scrollY={scroll}
            overlay={
              <>
                <ParcelaActions cobranca={ANA_MARCO_COM_RECIBO} open={sheetOpen} />
                {reciboOpen && (
                  <ReceiptDialog
                    isOpen
                    onClose={noop}
                    receiptUrl={ANA_MARCO_COM_RECIBO.recibo_url}
                    cobrancaId={ANA_MARCO.id}
                    mes={3}
                    ano={2026}
                    passageiroId={ANA_ID}
                    nomePassageiro="Ana Beatriz Souza"
                    nomeResponsavel="Juliana Souza"
                  />
                )}
                {anualOpen && (
                  <AnnualReceiptDialog
                    isOpen
                    onClose={noop}
                    receiptUrl={staticFile("recibos/recibo-anual-ana-2025.png")}
                    ano={2025}
                    alunoNome="Ana Beatriz Souza"
                    passageiroId={ANA_ID}
                  />
                )}
                <Finger
                  showFrom={24}
                  hideAt={T.tocaAluno + 8}
                  steps={[
                    { at: 24, ...P.aluno },
                    { at: T.tocaAluno, ...P.aluno, tap: true },
                  ]}
                />
                <Finger
                  showFrom={B[3] + 6}
                  hideAt={T.tocaVerRecibo + 12}
                  steps={[
                    { at: B[3] + 6, ...P.marco },
                    { at: T.tocaMarco, ...P.marco, tap: true },
                    { at: T.tocaVerRecibo, ...P.verRecibo, tap: true },
                  ]}
                />
                <Finger
                  showFrom={B[4] + 6}
                  hideAt={T.tocaReciboAnual + 12}
                  steps={[
                    { at: B[4] + 6, ...P.anoAnterior },
                    { at: T.tocaAnoAnterior, ...P.anoAnterior, tap: true },
                    { at: T.tocaReciboAnual, ...P.reciboAnual, tap: true },
                  ]}
                />
                <Finger showFrom={B[5]} hideAt={T.tocaDados + 12} steps={[{ at: B[5], ...P.abaDados }, { at: T.tocaDados, ...P.abaDados, tap: true }]} />
                <Finger
                  showFrom={B[6]}
                  hideAt={T.tocaResponsaveis + 12}
                  steps={[{ at: B[6], ...P.abaResponsaveis }, { at: T.tocaResponsaveis, ...P.abaResponsaveis, tap: true }]}
                />
                <Finger
                  showFrom={B[7] + 4}
                  hideAt={T.tocaContrato + 12}
                  steps={[{ at: B[7] + 4, ...P.abaContrato }, { at: T.tocaContrato, ...P.abaContrato, tap: true }]}
                />
              </>
            }
          >
            {naLista ? (
              <TelaAlunos passageiros={PASSAGEIROS.slice(0, 4)} />
            ) : (
              <Routes>
                <Route path="/alunos/:passageiro_id" element={<PassageiroCarteirinha />} />
              </Routes>
            )}
          </PhoneScreen>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};
