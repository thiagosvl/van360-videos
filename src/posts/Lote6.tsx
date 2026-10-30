import React from "react";
import { Img, staticFile } from "remotion";
import {
  CalendarCheck, ClipboardCheck, ClipboardList, FileSignature, Fuel, IdCard, MessageCircle, PartyPopper,
  Receipt, SearchCheck, Smartphone, UserPlus, Wallet,
} from "lucide-react";
import { AMBER, BLUE, Celular, Destaque, GREEN, NAVY, RED, WHATS, useU } from "../loja/base";
import { TelaChamada } from "../loja/telas";
import { BRANCO_SUAVE, Chamada, Destacado, Etiqueta, Item, Lista, Post } from "./base";
import { dica, fechamento, type PostDef } from "./Posts";

/**
 * Lote 6 (posts 29 a 35). Capas no padrão da grade do perfil:
 * etiqueta do tema + título centralizado, longe das bordas (a grade corta as laterais).
 */

type Slide = PostDef["slides"][number];

/** Título centralizado com etiqueta, margens largas. */
const TituloCentral: React.FC<{
  etiqueta: string;
  titulo: string;
  sub?: string;
  top?: number;
  tamanho?: number;
  claro?: boolean;
}> = ({ etiqueta, titulo, sub, top = 150, tamanho = 112, claro = false }) => {
  const u = useU();
  return (
    <div style={{ position: "absolute", top: top * u, left: 130 * u, right: 130 * u, textAlign: "center" }}>
      <Etiqueta texto={etiqueta} />
      <div
        style={{
          marginTop: 40 * u,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: tamanho * u,
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          color: claro ? NAVY : "white",
          whiteSpace: "pre-line",
          textWrap: "balance",
        }}
      >
        <Destacado texto={titulo} cor={claro ? BLUE : AMBER} />
      </div>
      {sub && (
        <div
          style={{
            marginTop: 34 * u,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 46 * u,
            lineHeight: 1.35,
            color: claro ? "#475569" : BRANCO_SUAVE,
            textWrap: "balance",
          }}
        >
          <Destacado texto={sub} cor={claro ? NAVY : "white"} />
        </div>
      )}
    </div>
  );
};

/** Capa de carrossel no padrão da grade. */
const capa = (etiqueta: string, titulo: string, sub: string, claro = false): Slide => () => (
  <Post claro={claro} arrasta brilhoY={1200}>
    <TituloCentral etiqueta={etiqueta} titulo={titulo} sub={sub} top={380} tamanho={136} claro={claro} />
  </Post>
);

const fechoVan = (n: number, titulo: string, itens: Array<[React.ElementType, string, string, string]>): Slide => () => {
  const u = useU();
  return (
    <Post pagina={[n, n]} brilhoY={1000}>
      <div
        style={{
          position: "absolute",
          top: 170 * u,
          left: 90 * u,
          right: 90 * u,
          fontFamily: "Manrope",
          fontWeight: 800,
          fontSize: 104 * u,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          color: "white",
          whiteSpace: "pre-line",
        }}
      >
        <Destacado texto={titulo} />
      </div>
      <Lista top={560} gap={24}>
        {itens.map(([icone, cor, t, txt]) => (
          <Item key={t} icone={icone} cor={cor} titulo={t} texto={txt} />
        ))}
      </Lista>
      <Chamada top={1260} texto="Teste grátis por 15 dias" />
    </Post>
  );
};

/** Balão recebido (mensagem de pai, não é mensagem automática do app). */
const Recebido: React.FC<{ nome: string; texto: string; hora: string; x?: number; rot?: number }> = ({ nome, texto, hora, x = 0, rot = 0 }) => {
  const u = useU();
  return (
    <div
      style={{
        alignSelf: "center",
        translate: `${x * u}px 0`,
        rotate: `${rot}deg`,
        width: 720 * u,
        background: "white",
        borderRadius: `${8 * u}px ${34 * u}px ${34 * u}px ${34 * u}px`,
        padding: `${20 * u}px ${30 * u}px ${14 * u}px`,
        boxShadow: "0 24px 44px -18px rgba(0,0,0,0.65)",
        display: "flex",
        flexDirection: "column",
        gap: 4 * u,
      }}
    >
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30 * u, color: "#1f9d55" }}>{nome}</span>
      <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 40 * u, lineHeight: 1.3, color: "#111b21" }}>{texto}</span>
      <span style={{ alignSelf: "flex-end", fontFamily: "Inter", fontSize: 26 * u, color: "#667781" }}>{hora}</span>
    </div>
  );
};

/* ============ 29. Estático: "Tio, ela já embarcou?" ============ */

const embarque: Slide[] = [
  () => {
    const u = useU();
    return (
      <Post brilhoY={1200}>
        <TituloCentral etiqueta="SEGURANÇA" titulo={"Tio, ela\n**já embarcou?**"} top={120} tamanho={118} />
        <div style={{ position: "absolute", top: 560 * u, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 18 * u }}>
          <Recebido nome="Mãe da Ana" texto="Tio, a Ana já entrou na van? 🙏" hora="06:58" x={-40} rot={-1.5} />
          <Recebido nome="Pai do Davi" texto="Já chegou na escola?" hora="07:31" x={40} rot={1.5} />
          <Recebido nome="Mãe do Miguel" texto="Ele já tá voltando?" hora="17:12" x={-20} rot={-1} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 1250 * u,
            left: 130 * u,
            right: 130 * u,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 46 * u,
            lineHeight: 1.35,
            color: BRANCO_SUAVE,
            textWrap: "balance",
          }}
        >
          <Destacado texto="Com o Van360, o pai recebe o **aviso de embarque e de entrega** na hora." cor="white" />
        </div>
      </Post>
    );
  },
];

/* ============ 30. Estático: chamada em um toque ============ */

const chamada: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <TituloCentral etiqueta="ROTA" titulo={"Chamada em\n**um toque**"} sub="Quem embarcou e quem faltou, sem lista de papel." top={100} tamanho={108} />
      <Celular top={640} escala={1.85}>
        <TelaChamada />
      </Celular>
    </Post>
  ),
];

/* ============ 31. Estático: contrato no celular ============ */

const contrato: Slide[] = [
  () => {
    const u = useU();
    return (
      <Post
        brilhoY={1200}
        sobre={<Destaque x={560} y={1290} rot={3} cor={GREEN} icone={FileSignature} titulo="Assinado pelo pai" texto="Pelo celular, na hora" />}
      >
        <TituloCentral
          etiqueta="CONTRATO"
          titulo={"Ainda imprime contrato\ne **leva na casa do pai?**"}
          sub="Com o Van360, o pai assina com o dedo, no celular dele."
          top={100}
          tamanho={96}
        />
        <div
          style={{
            position: "absolute",
            top: 700 * u,
            left: "50%",
            width: 900 * u,
            height: 760 * u,
            translate: "-50% 0",
            rotate: "-2deg",
            borderRadius: 28 * u,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 50px 90px -20px rgba(0,0,0,0.6)",
          }}
        >
          <Img
            src={staticFile("contratos/pedro-assinado-3.png")}
            style={{ width: "100%", display: "block", marginTop: -560 * u }}
          />
        </div>
      </Post>
    );
  },
];

/* ============ 32. Carrossel: 3 medos de usar app na van ============ */

const medos: Slide[] = [
  capa("SEM MEDO", "3 medos de usar\n**app na van**", "E o que acontece de verdade.", true),
  dica(2, 5, "“Não sou bom com **tecnologia**”", "O app foi feito pra quem vive no volante. Tem vídeo explicando cada tela, e você começa pelo primeiro aluno, no seu ritmo.", Smartphone, BLUE, "MEDO"),
  dica(3, 5, "“Os pais não vão **querer usar**”", "O pai recebe tudo no WhatsApp: lembrete, recibo e contrato pra assinar. Não precisa baixar nada.", MessageCircle, WHATS, "MEDO"),
  dica(4, 5, "“Vai dar trabalho **cadastrar todo mundo**”", "Mande o link no grupo dos pais. Cada um preenche o cadastro do filho e você só confere e aprova.", UserPlus, GREEN, "MEDO"),
  fechamento(5),
];

/* ============ 33. Carrossel: rotina do dinheiro em 4 momentos ============ */

const rotina: Slide[] = [
  capa("ORGANIZAÇÃO", "Sua rotina do dinheiro\nem **4 momentos**", "Faz isso todo mês e a conta da van fecha.", true),
  dica(2, 6, "Começo do mês: **confira a lista**", "Quem entrou, quem saiu, quem mudou de valor. Lista certa, cobrança certa.", ClipboardList, NAVY, "MOMENTO"),
  dica(3, 6, "No vencimento: **avise os pais**", "Um lembrete educado no dia evita boa parte dos atrasos.", CalendarCheck, BLUE, "MOMENTO"),
  dica(4, 6, "Dia seguinte: **veja quem atrasou**", "Cobre só quem realmente está devendo, e sempre no particular.", SearchCheck, RED, "MOMENTO"),
  dica(5, 6, "Fim do mês: **feche as contas**", "Anote os gastos da van e veja quanto sobrou de verdade.", Wallet, GREEN, "MOMENTO"),
  fechoVan(6, "O Van360 faz essa\nrotina **com você**", [
    [MessageCircle, WHATS, "Lembrete no vencimento", "Vai sozinho no WhatsApp do pai"],
    [ClipboardCheck, BLUE, "Pagos e atrasados numa tela", "Sem conferir extrato"],
    [Fuel, RED, "Gastos e lucro do mês", "A conta fechada sem planilha"],
  ]),
];

/* ============ 34. Estático: qual dessas você mais escuta? ============ */

const FRASES = ["“Esqueci, tio!”", "“Posso pagar semana que vem?”", "“Já mandei o Pix, confere aí”", "“Me passa a chave de novo?”"];

const enquete: Slide[] = [
  () => {
    const u = useU();
    return (
      <Post brilhoY={1000}>
        <TituloCentral etiqueta="COMENTA AÍ" titulo={"Qual dessas você\n**mais escuta?**"} top={120} tamanho={112} />
        <div style={{ position: "absolute", top: 560 * u, left: 130 * u, right: 130 * u, display: "flex", flexDirection: "column", gap: 26 * u }}>
          {FRASES.map((f, i) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30 * u,
                padding: `${28 * u}px ${34 * u}px`,
                borderRadius: 34 * u,
                background: "white",
                boxShadow: "0 24px 44px -20px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  width: 88 * u,
                  height: 88 * u,
                  borderRadius: 999,
                  background: AMBER,
                  color: NAVY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Manrope",
                  fontWeight: 800,
                  fontSize: 50 * u,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 48 * u, color: NAVY, letterSpacing: "-0.02em" }}>{f}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 1300 * u,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44 * u,
            color: BRANCO_SUAVE,
          }}
        >
          Responde nos comentários com o número 👇
        </div>
      </Post>
    );
  },
];

/* ============ 35. Estático: tudo num app só ============ */

const RECURSOS: Array<[React.ElementType, string, string]> = [
  [MessageCircle, WHATS, "Lembrete no WhatsApp"],
  [Wallet, GREEN, "Parcelas"],
  [Receipt, BLUE, "Recibos"],
  [FileSignature, NAVY, "Contratos"],
  [ClipboardCheck, GREEN, "Chamada"],
  [IdCard, BLUE, "Carteirinha"],
  [Fuel, RED, "Gastos e lucro"],
  [PartyPopper, AMBER, "Fretes e passeios"],
];

const tudo: Slide[] = [
  () => {
    const u = useU();
    return (
      <Post brilhoY={1100}>
        <TituloCentral etiqueta="O APP" titulo={"Tudo da sua van\n**num app só**"} top={110} tamanho={112} />
        <div
          style={{
            position: "absolute",
            top: 560 * u,
            left: 130 * u,
            right: 130 * u,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24 * u,
          }}
        >
          {RECURSOS.map(([I, cor, nome]) => (
            <div
              key={nome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22 * u,
                padding: `${26 * u}px ${24 * u}px`,
                borderRadius: 30 * u,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  width: 80 * u,
                  height: 80 * u,
                  borderRadius: 24 * u,
                  background: cor,
                  color: cor === AMBER ? NAVY : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <I style={{ width: 44 * u, height: 44 * u }} strokeWidth={2.3} />
              </div>
              <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 38 * u, lineHeight: 1.15, color: "white" }}>{nome}</span>
            </div>
          ))}
        </div>
        <Chamada top={1290} texto="Teste grátis por 15 dias" />
      </Post>
    );
  },
];

export const POSTS_LOTE6: PostDef[] = [
  { id: "29-ja-embarcou", slides: embarque },
  { id: "30-chamada", slides: chamada },
  { id: "31-contrato-celular", slides: contrato },
  { id: "32-tres-medos", slides: medos },
  { id: "33-rotina-do-mes", slides: rotina },
  { id: "34-qual-voce-escuta", slides: enquete },
  { id: "35-tudo-num-app", slides: tudo },
];

