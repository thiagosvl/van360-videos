import React from "react";
import {
  AlertCircle, BadgeCheck, CalendarClock, CalendarRange, Calculator, FileSignature, Megaphone, MessageCircle,
  Percent, ShieldCheck, Users, Wallet,
} from "lucide-react";
import { Ampliado, BLUE, Destaque, GREEN, NAVY, RED, Rotulo, WHATS } from "../loja/base";
import { BotaoLink, WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { MOTORISTA } from "../mocks/data";
import { Chamada, Item, Lista, Post, Texto } from "./base";
import { dica, type PostDef } from "./Posts";

/**
 * Lote 5 (posts 26 a 28): renovação para 2027.
 * Publicar a partir de meados de novembro.
 */

type Slide = PostDef["slides"][number];

const capaClara = (titulo: string, sub: string): Slide => () => (
  <Post claro arrasta brilhoY={1200}>
    <Texto claro top={440} tamanho={136} titulo={titulo} sub={sub} />
  </Post>
);

const fechoVan = (n: number, titulo: string, itens: Array<[React.ElementType, string, string, string]>): Slide => () => (
  <Post pagina={[n, n]} brilhoY={1000}>
    <Texto top={170} tamanho={104} titulo={titulo} />
    <Lista top={560} gap={24}>
      {itens.map(([icone, cor, t, txt]) => (
        <Item key={t} icone={icone} cor={cor} titulo={t} texto={txt} />
      ))}
    </Lista>
    <Chamada top={1260} texto="Teste grátis por 15 dias" />
  </Post>
);

/* ============ 26. Carrossel: checklist do contrato de 2027 ============ */

const contrato: Slide[] = [
  capaClara("O que não pode faltar no **contrato de 2027**", "Salva esse checklist antes de mandar pros pais."),
  dica(2, 7, "**Valor** e dia de **vencimento**", "Por escrito e igual pra todo mundo. É a base de qualquer cobrança.", Wallet, GREEN, "ITEM"),
  dica(3, 7, "Quando começam e **terminam as parcelas**", "Deixe claro quantas são e se férias e recesso entram na conta.", CalendarRange, BLUE, "ITEM"),
  dica(4, 7, "**Multa e juros** por atraso", "Sem isso no contrato, cobrar a mais depois vira discussão.", AlertCircle, RED, "ITEM"),
  dica(5, 7, "Regras de **saída** do aluno", "Com quanto tempo de aviso o pai pode cancelar e o que acontece com o mês em curso.", CalendarClock, NAVY, "ITEM"),
  dica(6, 7, "**Responsáveis** e quem pode buscar", "Nome e contato de todos. Segurança pro aluno e pra você.", ShieldCheck, BLUE, "ITEM"),
  fechoVan(7, "Contrato pronto **no Van360**", [
    [FileSignature, NAVY, "Modelo pronto e ajustável", "Você configura uma vez"],
    [AlertCircle, RED, "Multa e juros configurados", "Já entram no contrato"],
    [BadgeCheck, GREEN, "O pai assina no celular", "Junto com a renovação"],
  ]),
];

/* ============ 27. Carrossel: reajustar sem perder aluno ============ */

const reajuste: Slide[] = [
  capaClara("Como **reajustar** a mensalidade sem perder aluno", "5 cuidados pra conversar com os pais."),
  dica(2, 7, "Refaça a **conta do custo**", "Combustível, manutenção, seguro. O reajuste tem que ter motivo, e você precisa saber qual é.", Calculator, GREEN, "CUIDADO"),
  dica(3, 7, "Avise **com antecedência**", "Ninguém gosta de surpresa. Avisar cedo dá tempo pro pai se organizar.", Megaphone, BLUE, "CUIDADO"),
  dica(4, 7, "Explique **o porquê**", "Sem pedir desculpa. Mostre o que subiu e o que você manteve de qualidade.", MessageCircle, WHATS, "CUIDADO"),
  dica(5, 7, "Mesmo reajuste **pra todos**", "Regra igual pra todo mundo evita comparação e conversa de corredor.", Percent, NAVY, "CUIDADO"),
  dica(6, 7, "Lembre o pai do **que ele recebe**", "Pontualidade, segurança, avisos no celular, recibo de cada mês. Isso tem valor.", Users, BLUE, "CUIDADO"),
  fechoVan(7, "Reajuste e renovação **no Van360**", [
    [Percent, NAVY, "Reajuste pra todos de uma vez", "Sem refazer aluno por aluno"],
    [MessageCircle, WHATS, "Renovação pelo WhatsApp", "O pai vê o novo valor e confirma"],
    [FileSignature, GREEN, "Contrato de 2027 assinado", "Ali mesmo, no celular do pai"],
  ]),
];

/* ============ 28. Estático: renovação sem correr atrás de pai ============ */

const BolhaRenovacao: React.FC = () => (
  <WabaMessage motorista={MOTORISTA.apelido} hora="09:15" botao={<BotaoLink texto="Confirmar Transporte" />}>
    {WABA_MODELOS.renovacao({ responsavel: "Rodrigo", aluno: "Davi", ano: 2027 })}
  </WabaMessage>
);

const renovacao: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Renovação sem\n**correr atrás de pai**"}
        sub="O pai recebe o link no WhatsApp, confirma a vaga e assina o contrato do ano que vem."
      />
      <Rotulo x={360} y={620} texto="Celular do pai" cor="verde" />
      <Ampliado x={170} y={710} largura={340} escala={2.5} rot={-2}>
        <BolhaRenovacao />
      </Ampliado>
      <Destaque x={600} y={590} rot={3} cor={GREEN} icone={BadgeCheck} titulo="Vaga confirmada" texto="Você vê quem já renovou" />
    </Post>
  ),
];

export const POSTS_LOTE5: PostDef[] = [
  { id: "26-contrato-2027", slides: contrato },
  { id: "27-reajuste", slides: reajuste },
  { id: "28-renovacao", slides: renovacao },
];
