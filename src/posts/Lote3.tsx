import React from "react";
import {
  AlertCircle, Baby, MessageCircle, Banknote, Bus, CalendarClock, ClipboardList, FileSignature, HeartPulse, Link2, MapPin,
  PartyPopper, Percent, School, ShieldCheck, Ticket, Users, Wallet,
} from "lucide-react";
import { AMBER, BLUE, Celular, Destaque, GREEN, NAVY, RED, WHATS, useU } from "../loja/base";
import { TelaPasseios } from "../loja/telas";
import { Chamada, Item, Lista, Post, Texto } from "./base";
import { dica, fechamento, type PostDef } from "./Posts";

/**
 * Lote 3 (posts 16 a 19): educativos.
 * Ficha do aluno, valor da mensalidade, frete e passeio, erros que dão prejuízo.
 */

type Slide = PostDef["slides"][number];

/** Capa clara de carrossel educativo. */
const capaClara = (titulo: string, sub: string, tamanho = 136): Slide => () => (
  <Post claro arrasta brilhoY={1200}>
    <Texto claro top={440} tamanho={tamanho} titulo={titulo} sub={sub} />
  </Post>
);

/** Slide claro com título e lista de itens. */
const listaClara = (
  n: number,
  total: number,
  titulo: string,
  itens: Array<[React.ElementType, string, string, string]>,
): Slide => () => (
  <Post claro pagina={[n, total]} brilhoY={300}>
    <Texto claro top={200} tamanho={108} titulo={titulo} />
    <Lista top={itens.length > 3 ? 560 : 620} gap={itens.length > 3 ? 24 : 30}>
      {itens.map(([icone, cor, t, txt]) => (
        <Item key={t} claro icone={icone} cor={cor} titulo={t} texto={txt} />
      ))}
    </Lista>
  </Post>
);

/** Fecho escuro: "O Van360 ..." com itens e chamada. */
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

/* ============ 16. Carrossel: o que anotar de cada aluno ============ */

const ficha: Slide[] = [
  capaClara("O que todo tio precisa ter **anotado** de cada aluno", "Salva esse post e confere se não falta nada."),
  listaClara(2, 6, "Do **aluno**", [
    [Baby, BLUE, "Nome completo e nascimento", "Parece óbvio, mas muita ficha não tem"],
    [School, NAVY, "Escola, turma e período", "Pra montar a rota sem erro"],
    [MapPin, GREEN, "Endereço de embarque", "E de entrega, se for diferente"],
  ]),
  listaClara(3, 6, "Dos **responsáveis**", [
    [Users, BLUE, "Todos os responsáveis", "Não só o principal"],
    [MessageCircle, WHATS, "Telefone de cada um", "Com WhatsApp"],
    [ShieldCheck, NAVY, "Quem pode buscar o aluno", "E quem não pode"],
  ]),
  listaClara(4, 6, "Os **cuidados**", [
    [HeartPulse, RED, "Alergias e remédios", "Que você precisa saber"],
    [AlertCircle, AMBER, "Contato de emergência", "Se ninguém atender"],
    [ClipboardList, NAVY, "Observações importantes", "Tudo que foi combinado com a família"],
  ]),
  listaClara(5, 6, "O **combinado**", [
    [Wallet, GREEN, "Valor da mensalidade", "Por aluno, sem confusão"],
    [CalendarClock, BLUE, "Dia de vencimento", "Igual pra todos, de preferência"],
    [FileSignature, NAVY, "Contrato assinado", "Guardado, não perdido na gaveta"],
  ]),
  fechoVan(6, "Tudo isso na **Carteirinha Digital**", [
    [Link2, BLUE, "O pai preenche pelo link", "Você só confere e aprova"],
    [Users, GREEN, "Responsáveis e observações", "Sempre à mão no celular"],
    [FileSignature, NAVY, "Parcelas e contrato juntos", "Na ficha de cada aluno"],
  ]),
];

/* ============ 17. Carrossel: como definir o valor da mensalidade ============ */

const valor: Slide[] = [
  capaClara("Como definir o **valor da mensalidade**", "5 pontos pra cobrar o justo, sem ficar no prejuízo."),
  dica(2, 7, "Comece pelo **custo por aluno**", "Some os gastos do mês e divida pelo número de alunos. Abaixo disso, você paga pra trabalhar.", Wallet, GREEN, "PONTO"),
  dica(3, 7, "Considere a **distância**", "Quem mora mais longe ocupa mais tempo de rota e mais combustível.", MapPin, BLUE, "PONTO"),
  dica(4, 7, "Veja o **trajeto**", "Ida e volta, só um trecho, meio período ou integral. Cada caso pesa diferente na rota.", Bus, NAVY, "PONTO"),
  dica(5, 7, "Desconto pra **irmãos**, com conta", "É um bom argumento de venda, mas faça a conta antes pra não sair no prejuízo.", Percent, AMBER, "PONTO"),
  dica(6, 7, "Deixe tudo **por escrito**", "Valor, vencimento, multa por atraso. Contrato evita discussão lá na frente.", FileSignature, RED, "PONTO"),
  fechoVan(7, "O Van360 te ajuda **nessa conta**", [
    [Wallet, GREEN, "Valor e vencimento por aluno", "Cada um com o seu combinado"],
    [Banknote, BLUE, "Gastos e lucro do mês", "Você sabe se está cobrando certo"],
    [FileSignature, NAVY, "Contrato assinado pelo celular", "Com multa e juros configurados"],
  ]),
];

/* ============ 18. Carrossel: frete e passeio ============ */

const frete: Slide[] = [
  () => (
    <Post arrasta brilhoY={1300}>
      <Texto
        top={420}
        tamanho={140}
        titulo={"Sua van parada?\n**Dá pra faturar mais.**"}
        sub="Frete e passeio é renda extra que muita van deixa passar."
      />
    </Post>
  ),
  () => (
    <Post pagina={[2, 5]} brilhoY={500}>
      <Texto top={200} tamanho={108} titulo={"Onde tem\n**oportunidade**"} />
      <Lista top={600} gap={24}>
        <Item icone={School} cor={BLUE} titulo="Excursão escolar" texto="As escolas que você já atende" />
        <Item icone={PartyPopper} cor={AMBER} titulo="Formaturas e festas" texto="Levar e buscar convidados" />
        <Item icone={Ticket} cor={GREEN} titulo="Passeio de fim de semana" texto="Praia, parque, zoológico" />
        <Item icone={Users} cor={NAVY} titulo="Grupos" texto="Igreja, time, empresa, família" />
      </Lista>
    </Post>
  ),
  () => (
    <Post pagina={[3, 5]} brilhoY={500}>
      <Texto top={200} tamanho={108} titulo={"Pra não ter\n**dor de cabeça**"} />
      <Lista top={600} gap={24}>
        <Item icone={Ticket} cor={BLUE} titulo="Valor por pessoa e vagas" texto="Defina antes de divulgar" />
        <Item icone={Banknote} cor={GREEN} titulo="Peça um sinal" texto="Quem paga, garante a vaga" />
        <Item icone={ClipboardList} cor={NAVY} titulo="Lista de quem vai" texto="Com quem já pagou e quem falta" />
      </Lista>
    </Post>
  ),
  () => (
    <Post pagina={[4, 5]} brilhoY={1200}>
      <Texto top={110} centro tamanho={100} titulo={"Tudo organizado\n**no Van360**"} sub="Vagas, inscrições pelo link e pagamentos de cada viagem." />
      <Celular top={600} escala={1.95}>
        <TelaPasseios />
      </Celular>
      <Destaque x={600} y={1250} rot={3} cor={BLUE} icone={PartyPopper} titulo="Passeio lotado" texto="20 de 20 vagas pagas" />
    </Post>
  ),
  fechamento(5),
];

/* ============ 19. Carrossel: 5 erros que dão prejuízo ============ */

const erros: Slide[] = [
  capaClara("5 erros que fazem a van dar **prejuízo**", "E o pior: muita gente nem percebe."),
  dica(2, 7, "Não saber o **custo por aluno**", "Sem essa conta, a mensalidade é no chute. E o chute costuma ser pra baixo.", Wallet, RED, "ERRO"),
  dica(3, 7, "Deixar o **atraso acumular**", "Um mês vira dois, dois viram três. Quanto mais tempo passa, mais difícil é receber.", AlertCircle, RED, "ERRO"),
  dica(4, 7, "Trabalhar **sem contrato**", "Sem nada por escrito, multa, juros e combinado viram só a sua palavra contra a do pai.", FileSignature, RED, "ERRO"),
  dica(5, 7, "Misturar o dinheiro da van **com o de casa**", "Aí nunca dá pra saber se a van está dando lucro ou só pagando as contas.", Banknote, RED, "ERRO"),
  dica(6, 7, "Esquecer os gastos **do ano**", "IPVA, seguro, licença e revisão não vêm todo mês, mas vêm. Guarde um pouco por mês.", CalendarClock, RED, "ERRO"),
  fechoVan(7, "O Van360 te ajuda **a evitar**", [
    [MessageCircle, WHATS, "Lembrete automático", "O pai é avisado sem você lembrar"],
    [FileSignature, NAVY, "Contrato pelo celular", "Assinado pelo pai, com multa e juros"],
    [Banknote, GREEN, "Gastos e lucro separados", "Você vê o que a van rende"],
  ]),
];

export const POSTS_LOTE3: PostDef[] = [
  { id: "16-ficha-do-aluno", slides: ficha },
  { id: "17-valor-mensalidade", slides: valor },
  { id: "18-frete-passeio", slides: frete },
  { id: "19-erros-prejuizo", slides: erros },
];

