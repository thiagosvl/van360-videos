import React from "react";
import { Img, staticFile } from "remotion";
import {
  AlertCircle, Banknote, Check, ClipboardList, Clock, CreditCard, Handshake, Unlock, FileText, Fuel, Image as ImageIcon,
  MessageCircle, PiggyBank, Receipt, ShieldCheck, Smartphone, Sparkles, UserRound, Wallet, Wrench, X,
} from "lucide-react";
import { AMBER, Ampliado, BLUE, Celular, Destaque, GREEN, NAVY, RED, Rotulo, WHATS, useU } from "../loja/base";
import { BolhaLembrete, TelaAprovacao, TelaFormPai, TelaParcelas, TelaRelatorios } from "../loja/telas";
import { BRANCO_SUAVE, Chamada, Destacado, Etiqueta, Item, Lista, Post, Texto } from "./base";

/**
 * Posts do feed (1080x1350). Cada post é uma lista de slides; estático = 1 slide.
 * Lote 1: dores do dia a dia (sem renovação/contrato do ano que vem, que entra depois).
 * Regras de texto: CLAUDE.md (sem travessão, sem "caderninho", benefício e não botão).
 */

type Slide = React.FC;
export type PostDef = { id: string; slides: Slide[] };

const CTA_SUB = "Lembrete automático no WhatsApp, parcelas, recibos e muito mais, num app só.";
const SEM_CARTAO = "Sem cartão, sem compromisso, sem fidelidade.";

/** Último slide padrão dos carrosséis. */
export const fechamento = (n: number): Slide => () => {
  const u = useU();
  return (
    <Post pagina={[n, n]} brilhoY={1000}>
      <Texto top={330} centro tamanho={128} titulo={"Você dirige.\n**A gente organiza.**"} sub={CTA_SUB} />
      <Chamada top={1000} texto="Teste grátis por 15 dias" />
      <div
        style={{
          position: "absolute",
          top: 1170 * u,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 40 * u,
          color: BRANCO_SUAVE,
        }}
      >
        {SEM_CARTAO}
        <br />
        Link na bio
      </div>
    </Post>
  );
};

/* ============ 1. Carrossel: cobrar pai por pai ============ */

const cobranca: Slide[] = [
  () => (
    <Post arrasta brilhoY={1300}>
      <Texto
        top={430}
        tamanho={140}
        titulo={"Dia 10 chegou.\nE lá vai você cobrar **pai por pai.**"}
        sub="Se você tem van escolar, conhece essa rotina."
      />
    </Post>
  ),
  () => (
    <Post pagina={[2, 5]}>
      <Texto top={250} tamanho={112} titulo={"Todo mês é a\nmesma **novela**"} />
      <Lista top={680} gap={30}>
        <Item icone={MessageCircle} cor={WHATS} titulo="Uma mensagem pra cada pai" texto="E repetir tudo no mês seguinte" />
        <Item icone={ImageIcon} cor={BLUE} titulo="Print de Pix pra conferir" texto="E torcer pra bater com o extrato" />
        <Item icone={Clock} cor={RED} titulo="O pai que “esqueceu”" texto="E você sem graça de cobrar de novo" />
      </Lista>
    </Post>
  ),
  () => (
    <Post pagina={[3, 5]} brilhoY={800}>
      <Texto
        top={430}
        centro
        tamanho={118}
        titulo={"O pior nem é o trabalho.\nÉ o **clima chato** com o pai."}
        sub="Ninguém gosta de ficar cobrando. Mas sem cobrar, a conta do mês não fecha."
      />
    </Post>
  ),
  () => (
    <Post pagina={[4, 5]} brilhoY={1100}>
      <Texto
        top={220}
        tamanho={100}
        titulo={"E se o lembrete chegasse **sozinho?**"}
        sub="O Van360 avisa o pai no WhatsApp no dia do vencimento. Você não digita nada."
      />
      <Rotulo x={645} y={700} texto="Celular do pai" cor="verde" />
      <Ampliado x={254} y={790} largura={340} escala={2.3}>
        <BolhaLembrete />
      </Ampliado>
    </Post>
  ),
  fechamento(5),
];

/* ============ 2. Estático: quem pagou ============ */

const quemPagou: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto top={110} centro tamanho={108} titulo={"Quem já pagou?\nQuem tá **devendo?**"} sub="Todas as mensalidades do mês numa tela só." />
      <Celular top={560} escala={1.95}>
        <TelaParcelas />
      </Celular>
      <Destaque x={40} y={860} rot={-3} cor={GREEN} icone={Check} titulo="19 já pagaram" texto="R$ 5.320 recebido" />
      <Destaque x={640} y={1180} rot={3} cor={RED} icone={AlertCircle} titulo="2 em atraso" texto="Você vê antes de cobrar" />
    </Post>
  ),
];

/* ============ 3. Carrossel educativo: pai atrasado ============ */

export const dica = (
  n: number,
  total: number,
  titulo: string,
  sub: string,
  icone: React.ElementType,
  cor: string,
  rotulo = "DICA",
): Slide => () => {
  const u = useU();
  const I = icone;
  return (
    <Post claro pagina={[n, total]} brilhoY={300}>
      <div
        style={{
          position: "absolute",
          top: 300 * u,
          left: 90 * u,
          width: 150 * u,
          height: 150 * u,
          borderRadius: 44 * u,
          background: cor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          boxShadow: "0 20px 40px -16px rgba(15,23,42,0.4)",
        }}
      >
        <I style={{ width: 78 * u, height: 78 * u }} strokeWidth={2.3} />
      </div>
      <Texto
        claro
        top={560}
        tamanho={124}
        etiqueta={<Etiqueta texto={`${rotulo} ${n - 1}`} />}
        titulo={titulo}
        sub={sub}
      />
    </Post>
  );
};

const atrasado: Slide[] = [
  () => (
    <Post claro arrasta brilhoY={1200}>
      <Texto
        claro
        top={440}
        tamanho={136}
        titulo={"Como cobrar o pai **atrasado** sem estragar a relação"}
        sub="5 dicas pra quem vive isso todo mês."
      />
    </Post>
  ),
  dica(2, 7, "Avise **antes** de vencer", "Muito pai só esquece. Um aviso no dia do vencimento resolve boa parte dos atrasos.", Clock, BLUE),
  dica(3, 7, "Mesmo dia de vencimento **pra todos**", "Combine a data no começo do ano e deixe por escrito. Regra clara não vira discussão depois.", ClipboardList, NAVY),
  dica(4, 7, "Cobre no **particular**, nunca no grupo", "Expor o pai no grupo da van gera briga e não traz o dinheiro. Mensagem direta, curta e educada.", MessageCircle, WHATS),
  dica(5, 7, "Facilite o **pagamento**", "Mande a chave Pix junto com a mensagem. Quanto menos o pai precisar procurar, mais rápido ele paga.", Banknote, GREEN),
  dica(6, 7, "Dê baixa e mande o **recibo** na hora", "Assim você nunca cobra quem já pagou, que é a situação mais chata de todas.", Receipt, AMBER),
  () => (
    <Post pagina={[7, 7]} brilhoY={1000}>
      <Texto top={170} tamanho={104} titulo={"O Van360 faz as dicas 1, 4 e 5 **por você**"} />
      <Lista top={620}>
        <Item icone={MessageCircle} cor={WHATS} titulo="Lembrete automático" texto="No WhatsApp do pai, no dia do vencimento" />
        <Item icone={Banknote} cor={GREEN} titulo="Sua chave Pix na mensagem" texto="O pai já recebe como pagar" />
        <Item icone={Receipt} cor={BLUE} titulo="Recibo pronto" texto="Com a sua logo, é só mandar" />
      </Lista>
      <Chamada top={1280} texto="Teste grátis por 15 dias" />
    </Post>
  ),
];

/* ============ 4. Carrossel educativo: quanto a van custa ============ */

const custos: Slide[] = [
  () => (
    <Post claro arrasta brilhoY={1200}>
      <Texto
        claro
        top={440}
        tamanho={150}
        titulo={"Quanto sua van **custa** por mês?"}
        sub="Muita gente só conta o combustível. Aí o lucro some e ninguém sabe pra onde foi."
      />
    </Post>
  ),
  () => (
    <Post claro pagina={[2, 6]} brilhoY={300}>
      <Texto claro top={250} tamanho={112} titulo={"As contas do\n**dia a dia**"} />
      <Lista top={680} gap={30}>
        <Item claro icone={Fuel} cor={RED} titulo="Combustível" texto="O maior gasto, todo mês" />
        <Item claro icone={Wrench} cor={NAVY} titulo="Manutenção" texto="Óleo, pneu, freio, revisão" />
        <Item claro icone={UserRound} cor={BLUE} titulo="Monitora" texto="Se você trabalha com ajudante" />
      </Lista>
    </Post>
  ),
  () => (
    <Post claro pagina={[3, 6]} brilhoY={300}>
      <Texto claro top={180} tamanho={108} titulo={"As contas que\n**ficam de fora**"} />
      <Lista top={560} gap={24}>
        <Item claro icone={ShieldCheck} cor={GREEN} titulo="Seguro" texto="Do veículo e dos passageiros" />
        <Item claro icone={FileText} cor={NAVY} titulo="IPVA, licença e vistoria" texto="Divida o valor do ano por 12" />
        <Item claro icone={PiggyBank} cor={AMBER} titulo="Reserva pra trocar a van" texto="Um dia ela vai precisar" />
        <Item claro icone={Smartphone} cor={BLUE} titulo="Celular, internet, lavagem" texto="Os pequenos que somam" />
      </Lista>
    </Post>
  ),
  () => {
    const u = useU();
    const linha = (rot: string, valor: string, forte = false) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 44 * u, color: "#475569" }}>{rot}</span>
        <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: (forte ? 66 : 54) * u, color: forte ? BLUE : NAVY }}>{valor}</span>
      </div>
    );
    return (
      <Post claro pagina={[4, 6]} brilhoY={300}>
        <Texto claro top={180} tamanho={108} titulo={"Agora faz a conta\n**por aluno**"} />
        <div
          style={{
            position: "absolute",
            top: 560 * u,
            left: 90 * u,
            right: 90 * u,
            padding: `${50 * u}px ${56 * u}px`,
            borderRadius: 44 * u,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 50px -24px rgba(15,23,42,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 26 * u,
          }}
        >
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34 * u, color: "#94a3b8", letterSpacing: "0.06em" }}>EXEMPLO</span>
          {linha("Gasto total do mês", "R$ 2.400")}
          {linha("Número de alunos", "÷ 24")}
          <div style={{ height: 2, background: "#e2e8f0" }} />
          {linha("Custo por aluno", "R$ 100", true)}
        </div>
        <Texto
          claro
          top={1170}
          tamanho={60}
          titulo="Com mensalidade de R$ 280, sobram **R$ 180 por aluno.**"
          sub="Esse é o seu lucro de verdade."
        />
      </Post>
    );
  },
  () => (
    <Post pagina={[5, 6]} brilhoY={1200}>
      <Texto top={110} centro tamanho={100} titulo={"O Van360 faz essa\n**conta pra você**"} sub="Anote os gastos e veja o lucro do mês." />
      <Celular top={560} escala={1.95}>
        <TelaRelatorios />
      </Celular>
      <Destaque x={40} y={660} rot={-3} cor={RED} icone={Fuel} titulo="Gastos anotados" texto="Combustível, manutenção..." />
    </Post>
  ),
  fechamento(6),
];

/* ============ 5. Carrossel: antes x depois ============ */

const Comparacao: React.FC<{ linhas: Array<[string, string, string]>; top: number }> = ({ linhas, top }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 70 * u, right: 70 * u, display: "flex", flexDirection: "column", gap: 34 * u }}>
      {linhas.map(([tema, antes, depois]) => (
        <div key={tema} style={{ display: "flex", flexDirection: "column", gap: 16 * u }}>
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 44 * u, color: "white", paddingLeft: 10 * u }}>{tema}</span>
          <div style={{ display: "flex", gap: 18 * u }}>
            {[
              [antes, false],
              [depois, true],
            ].map(([txt, bom]) => (
              <div
                key={String(bom)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 20 * u,
                  padding: `${26 * u}px ${28 * u}px`,
                  borderRadius: 30 * u,
                  background: bom ? "white" : "rgba(255,255,255,0.06)",
                  border: bom ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    width: 58 * u,
                    height: 58 * u,
                    borderRadius: 999,
                    flexShrink: 0,
                    background: bom ? GREEN : "rgba(239,68,68,0.2)",
                    color: bom ? "white" : "#fca5a5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {bom ? <Check style={{ width: 34 * u, height: 34 * u }} strokeWidth={3} /> : <X style={{ width: 34 * u, height: 34 * u }} strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: bom ? 700 : 500,
                    fontSize: 36 * u,
                    lineHeight: 1.25,
                    color: bom ? NAVY : BRANCO_SUAVE,
                  }}
                >
                  {txt}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Cabecalho: React.FC<{ top: number }> = ({ top }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 70 * u, right: 70 * u, display: "flex", gap: 18 * u }}>
      <div style={{ flex: 1, textAlign: "center" }}>
        <Etiqueta texto="ANTES" fundo="rgba(255,255,255,0.12)" cor="white" />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <Etiqueta texto="COM O VAN360" />
      </div>
    </div>
  );
};

const antesDepois: Slide[] = [
  () => (
    <Post arrasta brilhoY={1300}>
      <Texto top={480} tamanho={150} titulo={"Fechar o mês:\n**antes e depois**"} sub="O que muda quando a sua van tem um sistema." />
    </Post>
  ),
  () => (
    <Post pagina={[2, 4]} brilhoY={400}>
      <Cabecalho top={150} />
      <Comparacao
        top={300}
        linhas={[
          ["Cobrar", "Mensagem pai por pai", "Lembrete sai sozinho no WhatsApp"],
          ["Saber quem pagou", "Conferir extrato e prints", "Pagos e atrasados numa tela"],
          ["Recibo", "Feito à mão, ou nem manda", "Pronto, com a sua logo"],
        ]}
      />
    </Post>
  ),
  () => (
    <Post pagina={[3, 4]} brilhoY={400}>
      <Cabecalho top={150} />
      <Comparacao
        top={300}
        linhas={[
          ["Aluno novo", "Copiar dados do WhatsApp", "O pai cadastra pelo link"],
          ["Contrato", "Imprimir e levar na casa do pai", "Assinado pelo celular"],
          ["Lucro do mês", "No chute", "Gastos e lucro somados"],
        ]}
      />
    </Post>
  ),
  fechamento(4),
];

/* ============ 6. Estático: recibo ============ */

/** Recibo real gerado pelo app (public/recibos), como papel inclinado. */
const PapelRecibo: React.FC = () => {
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        top: 560 * u,
        left: "50%",
        width: 900 * u,
        height: 1240 * u,
        translate: "-50% 0",
        rotate: "3deg",
        borderRadius: 28 * u,
        overflow: "hidden",
        background: "white",
        boxShadow: "0 50px 90px -20px rgba(0,0,0,0.6)",
      }}
    >
      <Img src={staticFile("recibos/recibo-davi-marco.png")} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

const recibo: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={108}
        titulo={"Recibo com\n**a sua marca**"}
        sub="O pai pagou, o recibo já sai pronto pra mandar."
      />
      <PapelRecibo />
      <Destaque x={560} y={545} rot={-3} cor={AMBER} icone={Sparkles} titulo="Sua logo aqui" texto="Recibo com cara de empresa" />
    </Post>
  ),
];

/* ============ 7. Estático: cadastro pelo pai ============ */

const cadastro: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Chega de copiar dados\ndo **WhatsApp**"}
        sub="Mande um link. O pai cadastra o aluno e você só aprova."
      />
      <Rotulo x={350} y={600} texto="Celular do pai" cor="verde" />
      <Rotulo x={940} y={640} texto="Seu celular" />
      <Celular top={700} x={-290} escala={1.6} rot={-4}>
        <TelaFormPai />
      </Celular>
      <Celular top={740} x={290} escala={1.6} rot={4}>
        <TelaAprovacao />
      </Celular>
    </Post>
  ),
];

/* ============ 8. Estático: teste grátis (sem falar de preço) ============ */

const oferta: Slide[] = [
  () => (
    <Post brilhoY={900}>
      <Texto
        top={110}
        centro
        tamanho={150}
        titulo={"Comece\n**grátis**"}
        sub="São 15 dias pra testar o Van360 na sua rotina de transporte escolar."
      />
      <Lista top={660} gap={24}>
        <Item icone={CreditCard} cor={BLUE} titulo="Sem cartão de crédito" texto="Não pede nenhum dado de pagamento" />
        <Item icone={Handshake} cor={GREEN} titulo="Sem compromisso" texto="Gostou, continua. Não gostou, tudo bem." />
        <Item icone={Unlock} cor={NAVY} titulo="Sem fidelidade" texto="Nada de contrato longo" />
      </Lista>
      <Chamada top={1330} texto="Teste grátis por 15 dias" />
    </Post>
  ),
];

/* ============ 9 a 11. Estáticos: depoimentos reais (falas dos áudios, sem editar palavras) ============ */

const Depoimento: React.FC<{
  fala: string;
  apoio: string;
  nome: string;
  local: string;
  avatar?: string;
  inicial: string;
  tamanho?: number;
}> = ({ fala, apoio, nome, local, avatar, inicial, tamanho = 92 }) => {
  const u = useU();
  return (
    <Post brilhoY={1250}>
      <div style={{ position: "absolute", top: 120 * u, left: 90 * u }}>
        <Etiqueta texto="DEPOIMENTO REAL" fundo="rgba(255,255,255,0.12)" cor="white" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 200 * u,
          left: 70 * u,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 340 * u,
          lineHeight: 1,
          color: AMBER,
        }}
      >
        “
      </div>
      <div
        style={{
          position: "absolute",
          top: 470 * u,
          left: 90 * u,
          right: 90 * u,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: tamanho * u,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          color: "white",
          textWrap: "balance",
        }}
      >
        <Destacado texto={fala} />
        <div
          style={{
            marginTop: 44 * u,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 44 * u,
            lineHeight: 1.4,
            letterSpacing: 0,
            color: BRANCO_SUAVE,
            textWrap: "pretty",
          }}
        >
          {apoio}
        </div>
      </div>
      <div style={{ position: "absolute", left: 90 * u, right: 90 * u, top: 1200 * u, display: "flex", alignItems: "center", gap: 32 * u }}>
        <div
          style={{
            width: 150 * u,
            height: 150 * u,
            borderRadius: 999,
            background: "white",
            border: `${6 * u}px solid ${AMBER}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {avatar ? (
            <Img src={staticFile(avatar)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 70 * u, color: NAVY }}>{inicial}</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 * u }}>
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 56 * u, color: "white" }}>{nome}</span>
          <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 38 * u, color: BRANCO_SUAVE }}>Transporte escolar · {local}</span>
        </div>
      </div>
    </Post>
  );
};

const depVerinha: Slide[] = [
  () => (
    <Depoimento
      fala="Trabalho há mais de 30 anos com **transporte escolar** e sempre foi na base do caderninho, da planilha de Excel e da agenda."
      apoio="Hoje, eu uso o Van360 no meu dia a dia do transporte escolar."
      tamanho={80}
      nome="Tia Verinha"
      local="Gravataí, RS"
      avatar="depoimentos/verinha-avatar.png"
      inicial="V"
    />
  ),
];

const depRicardo: Slide[] = [
  () => (
    <Depoimento
      fala="Para mim, o **fim da papelada** com contrato é o melhor."
      apoio="Já migrei todos os meus contratos para o aplicativo, com assinatura digital dos pais, inclusive os que eu não tinha feito contrato ainda."
      nome="Tio Ricardo"
      local="Santa Maria, DF"
      inicial="R"
    />
  ),
];

const depFlavio: Slide[] = [
  () => (
    <Depoimento
      fala="Hoje, eu mesmo **não fico mais sem** a plataforma Van360."
      apoio="É bom para os dois lados também, tanto para o pai como para nós, condutores."
      nome="Tio Flávio"
      local="Americana, SP"
      inicial="F"
    />
  ),
];

export const POSTS: PostDef[] = [
  { id: "01-cobranca", slides: cobranca },
  { id: "02-quem-pagou", slides: quemPagou },
  { id: "03-pai-atrasado", slides: atrasado },
  { id: "04-custos-da-van", slides: custos },
  { id: "05-antes-depois", slides: antesDepois },
  { id: "06-recibo", slides: recibo },
  { id: "07-cadastro-pelo-pai", slides: cadastro },
  { id: "08-teste-gratis", slides: oferta },
  { id: "09-depoimento-verinha", slides: depVerinha },
  { id: "10-depoimento-ricardo", slides: depRicardo },
  { id: "11-depoimento-flavio", slides: depFlavio },
];
