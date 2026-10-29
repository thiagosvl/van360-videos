import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  AlertCircle, Check, ClipboardCheck, FileSignature, Fuel, MessageCircle, PartyPopper, Sparkles, TrendingUp, Wallet,
} from "lucide-react";
import {
  AMBER, Ampliado, BLUE, Celular, Destaque, Fundo, GREEN, RED, Rotulo, SeloTeste, Titulo, WHATS, useU,
} from "./base";
import {
  BolhaLembrete, TelaAprovacao, TelaCarteirinha, TelaChamada, TelaContratos, TelaFormPai, TelaParcelas,
  TelaPasseios, TelaRelatorios, TelaWhatsAppPai,
} from "./telas";

/**
 * Imagens das lojas. App Store: os 10. Play Store: os 8 primeiros (o 8º leva o selo de teste).
 * Regra de layout: nada importante abaixo de ~2200u (o Android corta ali).
 */
type P = { android?: boolean };

/** 1. A maior dor: cobrar. */
const S1: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Pare de cobrar **pai por pai**"} sub="O lembrete chega sozinho no WhatsApp de cada responsável." />
    <Rotulo x={645} y={760} texto="Celular do pai" cor="verde" />
    <Celular top={860}>
      <TelaWhatsAppPai />
    </Celular>
    <Ampliado x={150} y={1330} largura={340} escala={2.9} rot={-2}>
      <BolhaLembrete />
    </Ampliado>
    <Destaque x={560} y={2080} rot={3} cor={WHATS} icone={MessageCircle} titulo="Enviado sozinho" texto="Você não digita nada" />
  </AbsoluteFill>
);

/** 2. Controle do dinheiro. */
const S2: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Saiba **quem pagou** e quem está devendo"} sub="O mês inteiro numa tela só, sem anotar nada." />
    <Celular>
      <TelaParcelas />
    </Celular>
    <Destaque x={40} y={1330} rot={-3} cor={GREEN} icone={Check} titulo="19 já pagaram" texto="R$ 5.320 recebido" />
    <Destaque x={600} y={1820} rot={3} cor={RED} icone={AlertCircle} titulo="2 em atraso" texto="Você vê antes de cobrar" />
  </AbsoluteFill>
);

/** 3. Cadastro feito pelo pai. */
const S3: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"O pai cadastra.\n**Você só aprova.**"} sub="Mande o link: o pai preenche e o aluno entra pronto." />
    <Rotulo x={330} y={800} texto="Celular do pai" cor="verde" />
    <Rotulo x={960} y={860} texto="Seu celular" />
    <Celular top={900} x={-290} escala={1.72} rot={-4}>
      <TelaFormPai />
    </Celular>
    <Celular top={960} x={290} escala={1.72} rot={4}>
      <TelaAprovacao />
    </Celular>
  </AbsoluteFill>
);

/** 4. Chamada. */
const S4: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Chamada em **um toque**"} sub="Marque quem embarcou e quem faltou, sem lista de papel." />
    <Celular>
      <TelaChamada />
    </Celular>
    <Destaque x={40} y={2000} rot={-3} cor={GREEN} icone={ClipboardCheck} titulo="6 embarcaram" texto="2 faltaram hoje" />
  </AbsoluteFill>
);

/** 5. Contrato. */
const S5: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Contrato assinado **pelo celular**"} sub="O pai assina com o dedo. Sem imprimir, sem ir até a casa dele." />
    <Celular>
      <TelaContratos />
    </Celular>
    <Destaque x={50} y={1500} rot={-3} cor={GREEN} icone={FileSignature} titulo="Assinado pelo pai" texto="Pelo link, na hora" />
  </AbsoluteFill>
);

/** 6. Recibo. */
const S6: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Recibo com **a sua marca** em um toque"} sub="Pagou, o recibo já está pronto para mandar pro pai." />
    <Celular>
      <TelaParcelas recibo />
    </Celular>
    <Destaque x={40} y={1180} rot={-3} cor={AMBER} icone={Sparkles} titulo="Sua logo aqui" texto="Recibo com cara de empresa" />
  </AbsoluteFill>
);

/** 7. Lucro (relatórios + gastos). */
const S7: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Descubra quanto sua van **lucra de verdade**"} sub="Mensalidades e gastos juntos, mês a mês." />
    <Celular>
      <TelaRelatorios />
    </Celular>
    <Destaque x={40} y={1290} rot={-3} cor={RED} icone={Fuel} titulo="Gastos anotados" texto="Combustível, manutenção..." />
    <Destaque x={560} y={2000} rot={3} cor={GREEN} icone={TrendingUp} titulo="+R$ 2.910 de lucro" texto="Sem fazer conta" />
  </AbsoluteFill>
);

/** 8. Fretes e passeios. */
const S8: React.FC<P> = ({ android }) => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Ganhe mais com **fretes e passeios**"} sub="Vagas, inscrições e pagamentos de cada viagem num lugar só." />
    <Celular>
      <TelaPasseios />
    </Celular>
    <Destaque x={560} y={1960} rot={3} cor={BLUE} icone={PartyPopper} titulo="Passeio lotado" texto="20 de 20 vagas pagas" />
    {android && <SeloTeste y={2150} />}
  </AbsoluteFill>
);

/** 9. Carteirinha. */
const S9: React.FC<P> = () => (
  <AbsoluteFill>
    <Fundo />
    <Titulo titulo={"Tudo do aluno **num toque**"} sub="Parcelas, contrato e responsáveis na carteirinha digital." />
    <Celular>
      <TelaCarteirinha />
    </Celular>
    <Destaque x={560} y={2000} rot={3} cor={GREEN} icone={Wallet} titulo="Março pago" texto="Histórico do ano inteiro" />
  </AbsoluteFill>
);

/** 10. Fechamento: marca + teste grátis. */
const S10: React.FC<P> = () => {
  const u = useU();
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: "absolute", top: 150 * u, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 40 * u, padding: 18 * u, boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile("logo-van360-3.png")} style={{ height: 130 * u, display: "block" }} />
        </div>
      </div>
      <Titulo top={390} titulo={"Você dirige.\n**A gente organiza.**"} />
      <SeloTeste y={730} />
      <Celular top={980} x={-250} rot={-7} escala={1.95}>
        <TelaCarteirinha />
      </Celular>
      <Celular top={940} x={250} rot={7} escala={1.95}>
        <TelaParcelas />
      </Celular>
    </AbsoluteFill>
  );
};

export const SLIDES_LOJA: Array<{ id: string; component: React.FC<P>; android: boolean }> = [
  { id: "01-cobranca", component: S1, android: true },
  { id: "02-parcelas", component: S2, android: true },
  { id: "03-cadastro", component: S3, android: true },
  { id: "04-chamada", component: S4, android: true },
  { id: "05-contrato", component: S5, android: true },
  { id: "06-recibo", component: S6, android: true },
  { id: "07-lucro", component: S7, android: true },
  { id: "08-passeios", component: S8, android: true },
  { id: "09-carteirinha", component: S9, android: false },
  { id: "10-marca", component: S10, android: false },
];
