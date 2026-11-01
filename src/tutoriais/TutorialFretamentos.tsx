import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import MenuPage from "@/pages/MenuPage";
import Fretamentos from "@/pages/Fretamentos";
import PasseioDetalhes from "@/pages/PasseioDetalhes";
import PasseioInscricaoPublica from "@/pages/PasseioInscricaoPublica";
import { NovoFretamentoOuPasseioDialog } from "@/components/dialogs/NovoFretamentoOuPasseioDialog";
import { PasseioFormDialog } from "@/components/dialogs/PasseioFormDialog";
import { FretamentoFormDialog } from "@/components/dialogs/FretamentoFormDialog";
import { RegistrarPagamentoParticipanteDialog } from "@/components/dialogs/RegistrarPagamentoParticipanteDialog";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { PhoneScreen } from "../components/PhoneScreen";
import { AcoesNaTela } from "../components/AcoesNaTela";
import { Circulo } from "../components/Circulo";
import { WhatsAppChat } from "../components/WhatsAppChat";
import { BRAND, BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { VideoStateProvider } from "../mocks/videoState";
import { listaFretamentos, PEDRO } from "../mocks/fretamentos";
import { usarLarguraDeCelular } from "../viewport";

/**
 * Tutorial com um toque de venda: Fretamentos e Passeios.
 * Passeio (criar, mandar o link, o pai confirma, pagamentos) e depois o frete fechado.
 */
export const BEATS: Beat[] = [
  { text: "Faz **passeio e frete** além da escola? O Van360 também te ajuda com isso.", from: 0, duration: 183 },
  { text: "No passeio, você cria a viagem: destino, horário, **valor por pessoa** e quantas vagas tem.", from: 183, duration: 206 },
  { text: "Depois, é só mandar o link no **grupo de WhatsApp** dos pais, com tudo explicado.", from: 389, duration: 161 },
  { text: "O pai abre, preenche os dados do filho e **confirma a presença**. E a sua chave Pix já aparece ali.", from: 550, duration: 202 },
  { text: "As confirmações caem na sua lista, e as **vagas** vão diminuindo sozinhas.", from: 752, duration: 154 },
  { text: "Pagou? Você registra o pagamento ou o sinal, e vê na hora **quanto falta receber**.", from: 906, duration: 176 },
  { text: "E o **frete fechado** é ainda mais simples: o valor total e o sinal que você recebeu.", from: 1082, duration: 170 },
  { text: "Mais um jeito de **ganhar com a sua van**, tudo organizado no app.", from: 1252, duration: 150 },
];
export const TUTORIAL_FRETAMENTOS_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const noop = () => {};
const SCALE = 1.45;
const PHONE_TOP = 540;
const SLIDE = 18;
const LISTA = "/fretamentos-e-passeios";
const DETALHE = "/fretamentos-e-passeios/zoo";

/* toques (px do celular 390x844), conferidos em stills */
const P = {
  menuFret: { x: 82, y: 453 },
  novaViagem: { x: 285, y: 331 },
  passeio: { x: 195, y: 520 },
  frete: { x: 195, y: 400 },
  salvar: { x: 282, y: 750 },
  verParticipantes: { x: 270, y: 660 },
  enviarWhats: { x: 195, y: 660 },
  voltar: { x: 60, y: 129 },
  registrar: { x: 292, y: 615 },
  quitar: { x: 282, y: 704 },
  confirmarPresenca: { x: 195, y: 707 },
};

const T = {
  // 1
  tocaMenu: B[1] + 74,
  lista: B[1] + 80,
  // 2
  tocaNova: B[2] + 8,
  abreNovo: B[2] + 14,
  tocaPasseio: B[2] + 34,
  abreForm: B[2] + 40,
  destino: B[2] + 76,
  horario: B[2] + 102,
  valor: B[2] + 132,
  vagas: B[2] + 168,
  tocaSalvar: B[2] + 184,
  criado: B[2] + 190,
  // 3
  tocaCard: B[3] + 30,
  detalhe: B[3] + 36,
  tocaWhats: B[3] + 78,
  whats: B[3] + 88,
  // 5 e 6 (seu celular de novo)
  rolaLista: B[5] + 70,
  tocaRegistrar: B[6] + 22,
  abrePag: B[6] + 28,
  tocaQuitar: B[6] + 100,
  pago: B[6] + 106,
  // 7
  tocaVoltar: B[7] + 14,
  lista2: B[7] + 20,
  tocaNova2: B[7] + 40,
  abreNovo2: B[7] + 46,
  tocaFrete: B[7] + 64,
  abreFrete: B[7] + 70,
  freteValor: B[7] + 88,
  freteSinal: B[7] + 114,
  tocaCadastrar: B[7] + 150,
  cadastrado: B[7] + 156,
};

/** O pai (relativo ao começo do segmento do pai, B[4]) */
const PAI = { rola: [26, 46], nome: 56, resp: 70, tel: 84, tocaConfirmar: 104, confirmado: 108, rolaPix: [118, 136] };

type Segment = { id: string; from: number; to: number; label: string };
const SEGMENTS: Segment[] = [
  { id: "app", from: 0, to: T.whats, label: "Seu celular" },
  { id: "whatsapp", from: T.whats, to: B[4], label: "Seu WhatsApp" },
  { id: "pai", from: B[4], to: B[5], label: "Celular do pai" },
  { id: "app2", from: B[5], to: TUTORIAL_FRETAMENTOS_DURATION, label: "Seu celular" },
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

/** Aviso do app depois de salvar (mesmo texto do toast real). */
const ToastSucesso: React.FC<{ desde: number; ate: number; texto: string }> = ({ desde, ate, texto }) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= ate) return null;
  const s = interpolate(frame, [desde, desde + 8, ate - 6, ate], [0, 1, 1, 0], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 46, left: 16, right: 16, zIndex: 80, opacity: s, translate: `0px ${(1 - s) * -24}px` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          borderRadius: 12,
          background: "#fff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 24px rgba(11,26,46,0.16)",
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: 600,
          color: "#0b1a2e",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="10" fill="#16a34a" />
          <path d="M5.5 10.3l3 3 6-6.3" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {texto}
      </div>
    </div>
  );
};

/* formulários preenchidos aos poucos, no ritmo da fala */
const passeioForm = (f: number) => ({
  titulo: "Excursão Zooparque",
  destino: f >= T.destino ? "Zooparque Itatiba" : "",
  origem: f >= T.destino + 8 ? "Portão do Colégio Aurora" : "",
  data_inicio: f >= T.horario ? "2026-03-28T07:00" : "",
  data_fim: f >= T.horario + 8 ? "2026-03-28T17:30" : "",
  valor_por_pessoa: f >= T.valor ? "60,00" : "",
  vagas_totais: f >= T.vagas ? 18 : null,
});
const freteForm = (f: number) => ({
  titulo: "Casamento em Campinas",
  data_inicio: f >= T.abreFrete + 8 ? "2026-03-29" : "",
  valor_total: f >= T.freteValor ? "1.200,00" : "",
  tem_sinal: f >= T.freteSinal,
  valor_sinal: f >= T.freteSinal + 8 ? "400,00" : "",
});

const etapaApp = (f: number) => (f >= T.cadastrado ? 5 : f >= T.pago ? 4 : f >= B[5] ? 3 : f >= T.criado ? 1 : 0);

/* ------------------------------------------------------------------ */
/* Seu celular (a mesma tela do começo ao fim, sem o pai e o WhatsApp)  */
/* ------------------------------------------------------------------ */
const TelaApp: React.FC<{ desde: number }> = ({ desde }) => {
  const local = useCurrentFrame();
  const f = local + desde; // quadro do vídeo
  const etapa = etapaApp(f);
  const route = f < T.lista ? "/menu" : f >= T.detalhe && f < T.lista2 ? DETALHE : LISTA;
  const path = route === DETALHE ? "/fretamentos-e-passeios/:id" : route;
  const pedro = listaFretamentos(3).find((i) => i.id === "zoo")!.participantes[0];

  // rolagem nos detalhes: desce até os participantes e volta ao topo depois do pagamento
  const scroll =
    route === DETALHE && f >= B[5]
      ? interpolate(f, [T.rolaLista, T.rolaLista + 20, T.pago + 6, T.pago + 24], [0, 400, 400, 0], { ...clamp, easing: ease })
      : 0;

  const dialogo =
    f >= T.abreNovo && f < T.abreForm ? (
      <NovoFretamentoOuPasseioDialog isOpen onClose={noop} onSelectFretamento={noop} onSelectPasseio={noop} />
    ) : f >= T.abreForm && f < T.criado ? (
      <PasseioFormDialog isOpen onClose={noop} />
    ) : f >= T.abrePag && f < T.pago ? (
      <RegistrarPagamentoParticipanteDialog isOpen onClose={noop} fretamentoId="zoo" passeioTitulo="Excursão Zooparque" participante={pedro as any} />
    ) : f >= T.abreNovo2 && f < T.abreFrete ? (
      <NovoFretamentoOuPasseioDialog isOpen onClose={noop} onSelectFretamento={noop} onSelectPasseio={noop} />
    ) : f >= T.abreFrete && f < T.cadastrado ? (
      <FretamentoFormDialog isOpen onClose={noop} />
    ) : null;

  const passos = [
    { at: T.tocaMenu, ...P.menuFret },
    { at: T.tocaNova, ...P.novaViagem },
    { at: T.tocaPasseio, ...P.passeio },
    { at: T.tocaSalvar, ...P.salvar },
    { at: T.tocaCard, ...P.verParticipantes },
    { at: T.tocaWhats, ...P.enviarWhats },
    { at: T.tocaRegistrar, ...P.registrar },
    { at: T.tocaQuitar, ...P.quitar },
    { at: T.tocaVoltar, ...P.voltar },
    { at: T.tocaNova2, ...P.novaViagem },
    { at: T.tocaFrete, ...P.frete },
    { at: T.tocaCadastrar, ...P.salvar },
  ]
    .filter((p) => p.at >= desde - 30)
    .map((p) => ({ ...p, at: p.at - desde, tap: true }));

  return (
    <VideoStateProvider value={{ fretamentos: { etapa }, passeioForm: passeioForm(f), freteForm: freteForm(f) }}>
      <PhoneScreen
        key={`${route}-${etapa >= 3 ? "b" : "a"}`}
        route={route}
        pageTitle={route === "/menu" ? "Menu" : "Fretamentos e Passeios"}
        scale={SCALE}
        scrollY={scroll}
        overlay={
          <>
            {dialogo}
            {/* destaques: vagas (12/18) e o "a receber" atualizado */}
            {route === DETALHE && <Circulo x={195} y={352} w={150} h={70} desde={B[5] - desde + 14} ate={T.rolaLista - desde} />}
            {route === DETALHE && <Circulo x={195} y={522} w={190} h={62} desde={T.pago + 26 - desde} ate={T.tocaVoltar - desde - 2} />}
            <ToastSucesso desde={T.criado - desde} ate={T.tocaCard - desde} texto="Passeio criado com sucesso! Link gerado." />
            <ToastSucesso desde={T.pago - desde} ate={T.pago + 40 - desde} texto={`Pagamento integral de ${PEDRO.nome} registrado!`} />
            <ToastSucesso desde={T.cadastrado - desde} ate={T.cadastrado + 60 - desde} texto="Fretamento cadastrado com sucesso!" />
            {passos.length > 0 && <Finger showFrom={passos[0].at - 20} hideAt={passos[passos.length - 1].at + 10} steps={passos} />}
          </>
        }
      >
        <Routes>
          <Route path={path} element={route === "/menu" ? <MenuPage /> : route === DETALHE ? <PasseioDetalhes /> : <Fretamentos />} />
        </Routes>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Seu WhatsApp: a mensagem que o app monta (texto real do PasseioDetalhes) */
/* ------------------------------------------------------------------ */
const MENSAGEM =
  `Olá pais e responsáveis! No dia ${formatDateTime("2026-03-28T07:00:00")} realizaremos nosso passeio: *Excursão Zooparque*.\n\n` +
  `Local: Zooparque Itatiba\n` +
  `Valor por participante: ${formatCurrency(60)}\n` +
  `Vagas limitadas: restam apenas 18 vagas!\n\n` +
  `Para confirmar a presença do seu filho, acesse o link abaixo:\nhttps://app.van360.com.br/passeio/zooparque-aurora`;

const TelaWhatsApp: React.FC = () => (
  <PhoneScreen route="/menu" scale={SCALE} showChrome={false} contentClassName="">
    <WhatsAppChat contato="Pais 3º ano · Colégio Aurora" mensagem={MENSAGEM} enviaEm={10} />
  </PhoneScreen>
);

/* ------------------------------------------------------------------ */
/* Celular do pai: a página pública do passeio                          */
/* ------------------------------------------------------------------ */
const TelaPai: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [PAI.rola[0], PAI.rola[1], PAI.rolaPix[0], PAI.rolaPix[1]], [0, 520, 520, 240], { ...clamp, easing: ease });
  const passos = [
    { digitar: "Ex: Lucas Gabriel da Silva", valor: PEDRO.nome, at: PAI.nome },
    { digitar: "Ex: Mariana Silva (Mãe)", valor: `${PEDRO.resp} (Mãe)`, at: PAI.resp },
    { digitar: "(11) 98765-4321", valor: "(11) 99631-4580", at: PAI.tel },
    { tocar: "Confirmar Presença", at: PAI.confirmado },
  ].filter((p) => frame >= p.at);
  return (
    <VideoStateProvider value={{ fretamentos: { etapa: 2 } }}>
      <PhoneScreen route="/passeio/zooparque-aurora" scale={SCALE} showChrome={false} contentClassName="" scrollY={scroll}
        overlay={
          <>
            {/* a chave Pix do motorista, depois de confirmar */}
            <Circulo x={195} y={252} w={350} h={92} desde={PAI.rolaPix[1]} ate={300} />
            <Finger
              showFrom={PAI.tocaConfirmar - 20}
              hideAt={PAI.tocaConfirmar + 10}
              steps={[
                { at: PAI.tocaConfirmar - 20, ...P.confirmarPresenca },
                { at: PAI.tocaConfirmar, ...P.confirmarPresenca, tap: true },
              ]}
            />
          </>
        }
      >
        <React.Fragment key={passos.length}>
          <Routes>
            <Route path="/passeio/:slug" element={<PasseioInscricaoPublica />} />
          </Routes>
          <AcoesNaTela dentro="tela" passos={passos.map(({ at, ...a }) => a as any)} />
        </React.Fragment>
      </PhoneScreen>
    </VideoStateProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  ...[T.tocaMenu, T.tocaNova, T.tocaPasseio, T.tocaSalvar, T.tocaCard, T.tocaWhats, T.tocaRegistrar, T.tocaQuitar, T.tocaVoltar, T.tocaNova2, T.tocaFrete, T.tocaCadastrar].map(
    (at): SfxEvent => ({ at, sfx: "tap" }),
  ),
  ...[T.abreNovo, T.abreForm, T.abrePag, T.abreNovo2, T.abreFrete].map((at): SfxEvent => ({ at, sfx: "open", volume: 0.5 })),
  ...[T.destino, T.horario, T.valor, T.freteValor, T.freteSinal].map((at): SfxEvent => ({ at, sfx: "select", volume: 0.4 })),
  { at: T.criado, sfx: "success", volume: 0.7 },
  { at: T.pago, sfx: "success", volume: 0.7 },
  { at: T.cadastrado, sfx: "success", volume: 0.7 },
  ...SEGMENTS.slice(0, -1).map((s): SfxEvent => ({ at: s.to, sfx: "whoosh", volume: 0.55 })),
  { at: T.whats + 10, sfx: "pop", volume: 0.6 },
  // pai
  ...[PAI.nome, PAI.resp, PAI.tel].map((at): SfxEvent => ({ at: B[4] + at, sfx: "select", volume: 0.35 })),
  { at: B[4] + PAI.tocaConfirmar, sfx: "tap" },
  { at: B[4] + PAI.confirmado, sfx: "success", volume: 0.7 },
  { at: B[4] + PAI.rolaPix[1], sfx: "pop", volume: 0.5 },
  { at: B[8] + 40, sfx: "chime", volume: 0.6 },
];

const TELAS: Record<string, React.FC<{ desde: number }>> = {
  app: TelaApp,
  whatsapp: TelaWhatsApp as any,
  pai: TelaPai as any,
  app2: TelaApp,
};

export const TutorialFretamentos: React.FC = () => {
  usarLarguraDeCelular();
  const frame = useCurrentFrame();
  const logoIn = interpolate(frame, [B[8] + 40, B[8] + 60], [0, 1], clamp);
  return (
    <BrandBackground>
      <Caption beats={BEATS} />
      {SEGMENTS.map((seg, i) => {
        const Tela = TELAS[seg.id];
        const last = i === SEGMENTS.length - 1;
        return (
          <Sequence key={seg.id} from={seg.from} durationInFrames={seg.to - seg.from + (last ? 0 : SLIDE)} name={seg.id}>
            <SegmentShell seg={seg} first={i === 0} last={last}>
              <Tela desde={seg.from} />
            </SegmentShell>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
      <Narracao pasta="fretamentos" beats={BEATS} />
      <Sfx events={SFX} />
    </BrandBackground>
  );
};
