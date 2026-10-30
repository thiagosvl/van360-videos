import React from "react";
import { Img, staticFile } from "remotion";
import { CalendarX, FileSignature, MessageCircle, Phone, Receipt, Wallet } from "lucide-react";
import { ActiveRouteUpcomingCard } from "@/components/features/active-route/ActiveRouteUpcomingCard";
import { RouteSentido, RouteStopStatus } from "@/types/route";
import { BLUE, Celular, Destaque, GREEN, RED, WHATS, useU } from "../loja/base";
import { TelaCarteirinha } from "../loja/telas";
import { PhoneScreen } from "../components/PhoneScreen";
import { PASSAGEIROS } from "../mocks/data";
import { Chamada, Item, Lista, Post, Texto } from "./base";
import type { PostDef } from "./Posts";

/**
 * Lote 2 (posts 12 a 15): falta do aluno, WhatsApp virou escritório,
 * recibo anual e Carteirinha Digital.
 */

const noop = () => {};

/* ---------------- Tela: rota do dia com um aluno ausente (aviso do pai) ---------------- */

const RUAS = ["Rua das Palmeiras, 120", "Rua Ipê Amarelo, 45", "Av. dos Pinheiros, 880", "Rua Jacarandá, 32", "Rua das Acácias, 210"];

const PARADAS = PASSAGEIROS.slice(0, 5).map((p: any, i) => ({
  id: `pr${i}`,
  ordem: i + 1,
  tipo_no: "passageiro",
  sentido: RouteSentido.INDO,
  status: i === 1 ? RouteStopStatus.AUSENTE : RouteStopStatus.EMBARCADO,
  passageiro: {
    ...p,
    responsavel_principal: { ...p.responsavel_principal, logradouro: RUAS[i], bairro: "Jardim Aurora" },
  },
}));

const TelaRotaComFalta: React.FC = () => (
  <PhoneScreen route="/rotas" pageTitle="Rota da Manhã" scale={1}>
    <div className="space-y-5 pl-9 pt-1">
      {PARADAS.map((p, i) => (
        <ActiveRouteUpcomingCard
          key={p.id}
          parada={p}
          index={i}
          showTopLine={i > 0}
          showBottomLine={i < PARADAS.length - 1}
          selectedPreviewTabs={{}}
          todasParadas={PARADAS}
          proximasParadas={PARADAS}
          execucaoTipo="ida"
          isAnyActionBusy={false}
          reorderingTarget={null}
          validarMovimentoPermitido={() => false}
          paradasConcluidas={[]}
          isLoading={false}
          onOpenAddressDialog={noop}
          onMoveParada={noop}
          onConfirmFalta={noop}
          getAlunosEscolaPorPosicao={() => ({ desces: [], subes: [] })}
        />
      ))}
    </div>
  </PhoneScreen>
);

/* ============ 12. Estático: aluno faltou ============ */

const falta: PostDef["slides"] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Foi buscar o aluno\ne **ele não ia?**"}
        sub="O pai avisa a falta pelo app e ela já aparece na sua rota."
      />
      <Celular top={640} escala={1.55}>
        <TelaRotaComFalta />
      </Celular>
      <Destaque x={610} y={1060} rot={3} cor={RED} icone={CalendarX} titulo="O pai avisou a falta" texto="Você nem para na porta" />
    </Post>
  ),
];

/* ============ 13. Carrossel: seu WhatsApp virou escritório ============ */

/** Balão recebido do WhatsApp (mensagens de pais, não são mensagens automáticas). */
const Balao: React.FC<{ texto: string; nome: string; hora: string; rot?: number }> = ({ texto, nome, hora, rot = 0 }) => {
  const u = useU();
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "88%",
        rotate: `${rot}deg`,
        background: "white",
        borderRadius: `${8 * u}px ${34 * u}px ${34 * u}px ${34 * u}px`,
        padding: `${22 * u}px ${32 * u}px ${18 * u}px`,
        boxShadow: "0 20px 40px -18px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: 6 * u,
      }}
    >
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32 * u, color: "#1f9d55" }}>{nome}</span>
      <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 46 * u, lineHeight: 1.3, color: "#111b21" }}>{texto}</span>
      <span style={{ alignSelf: "flex-end", fontFamily: "Inter", fontSize: 28 * u, color: "#667781" }}>{hora}</span>
    </div>
  );
};

const whatsapp: PostDef["slides"] = [
  () => (
    <Post arrasta brilhoY={1300}>
      <Texto
        top={440}
        tamanho={150}
        titulo={"Seu WhatsApp\n**virou escritório?**"}
        sub="Se você tem van escolar, essa conversa você conhece."
      />
    </Post>
  ),
  () => {
    const u = useU();
    return (
      <Post pagina={[2, 4]} brilhoY={700}>
        <Texto top={120} tamanho={84} titulo={"O dia inteiro\nchega **isso aqui:**"} />
        <div style={{ position: "absolute", top: 440 * u, left: 90 * u, right: 90 * u, display: "flex", flexDirection: "column", gap: 30 * u }}>
          <Balao nome="Mãe da Ana" texto="Qual é a chave Pix mesmo?" hora="06:12" rot={-1} />
          <Balao nome="Pai do Davi" texto="Já paguei, confere aí 🙏" hora="12:47" rot={1} />
          <Balao nome="Mãe do Miguel" texto="Me manda o recibo de março?" hora="21:30" rot={-1} />
          <Balao nome="Pai do Enzo" texto="Quanto ficou a mensalidade?" hora="23:05" rot={1} />
        </div>
      </Post>
    );
  },
  () => (
    <Post pagina={[3, 4]} brilhoY={800}>
      <Texto
        top={430}
        centro
        tamanho={116}
        titulo={"Cada resposta é rápida.\nSomando, é o seu\n**descanso indo embora.**"}
        sub="E ainda tem pergunta chegando às 11 da noite."
      />
    </Post>
  ),
  () => (
    <Post pagina={[4, 4]} brilhoY={1000}>
      <Texto top={150} tamanho={100} titulo={"Menos pergunta,\n**mais sossego**"} />
      <Lista top={530} gap={24}>
        <Item icone={MessageCircle} cor={WHATS} titulo="Lembrete com a sua chave Pix" texto="O pai já recebe como pagar" />
        <Item icone={Receipt} cor={BLUE} titulo="Recibo pronto pra mandar" texto="Com a sua logo" />
        <Item icone={Wallet} cor={GREEN} titulo="Quem pagou, numa tela" texto="Sem conferir print" />
      </Lista>
      <Chamada top={1220} texto="Teste grátis por 15 dias" />
    </Post>
  ),
];

/* ============ 14. Estático: recibo do ano inteiro ============ */

const reciboAnual: PostDef["slides"] = [
  () => {
    const u = useU();
    return (
      <Post brilhoY={1200}>
        <Texto
          top={110}
          centro
          tamanho={104}
          titulo={"O pai pediu o\n**recibo do ano todo?**"}
          sub="Com o ano quitado, o recibo anual sai pronto. Serve de comprovante sempre que o pai precisar."
        />
        <div
          style={{
            position: "absolute",
            top: 640 * u,
            left: "50%",
            width: 860 * u,
            translate: "-50% 0",
            rotate: "-3deg",
            borderRadius: 28 * u,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 50px 90px -20px rgba(0,0,0,0.6)",
          }}
        >
          <Img src={staticFile("recibos/recibo-anual-ana-2025.png")} style={{ width: "100%", display: "block" }} />
        </div>
        <Destaque x={600} y={1230} rot={3} cor={GREEN} icone={Receipt} titulo="12 meses pagos" texto="Num recibo só" />
      </Post>
    );
  },
];

/* ============ 15. Estático: Carteirinha Digital ============ */

const carteirinha: PostDef["slides"] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={110}
        titulo={"Tudo do aluno\n**no seu bolso**"}
        sub="Responsáveis, escola, parcelas e contrato na Carteirinha Digital. Sem ficha de papel pra perder."
      />
      <Celular top={680} escala={1.95}>
        <TelaCarteirinha />
      </Celular>
      <Destaque x={30} y={760} rot={-3} cor={BLUE} icone={Phone} titulo="Contato dos pais" texto="Num toque" />
      <Destaque x={640} y={1330} rot={3} cor={GREEN} icone={FileSignature} titulo="Contrato assinado" texto="Guardado no app" />
    </Post>
  ),
];

export const POSTS_LOTE2: PostDef[] = [
  { id: "12-aluno-faltou", slides: falta },
  { id: "13-whatsapp-escritorio", slides: whatsapp },
  { id: "14-recibo-anual", slides: reciboAnual },
  { id: "15-carteirinha", slides: carteirinha },
];
