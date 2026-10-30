import React from "react";
import {
  Bell, BusFront, CalendarX, FileSignature, Gift, History, MapPin, MessageCircle, PartyPopper, Receipt, TrendingUp,
  UserCheck, Fuel,
} from "lucide-react";
import { AMBER, BLUE, Celular, Destaque, GREEN, NAVY, RED, WHATS, useU } from "../loja/base";
import { TelaPasseios, TelaRelatorios } from "../loja/telas";
import { PhoneScreen } from "../components/PhoneScreen";
import { TelaAlunos } from "../components/TelaAlunos";
import { PASSAGEIROS } from "../mocks/data";
import { ESTADOS, PONTOS } from "../depoimentos/brasil-mapa";
import { BRANCO_SUAVE, Chamada, Destacado, Etiqueta, Item, Lista, Post, Texto } from "./base";
import type { PostDef } from "./Posts";

/**
 * Lote 4 (posts 20 a 25): aluno desativado, o pai também ganha, fretes,
 * seu mês numa tela, de norte a sul e Indique e Ganhe.
 */

type Slide = PostDef["slides"][number];

/* ============ 20. Estático: aluno saiu da van ============ */

const ALUNOS_COM_DESATIVADO = PASSAGEIROS.slice(0, 5).map((p: any, i) => (i === 1 ? { ...p, ativo: false } : p));

const desativar: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Aluno saiu da van?\n**Desative sem perder nada.**"}
        sub="Parcelas, recibos e contrato ficam guardados. Se ele voltar, é só ativar de novo."
      />
      <Celular top={660} escala={1.6}>
        <PhoneScreen route="/alunos" pageTitle="Alunos" scale={1} scrollY={250}>
          <TelaAlunos passageiros={ALUNOS_COM_DESATIVADO} />
        </PhoneScreen>
      </Celular>
      <Destaque x={640} y={1150} rot={3} cor={NAVY} icone={History} titulo="Não apaga nada" texto="Histórico guardado" />
    </Post>
  ),
];

/* ============ 21. Duas imagens: o pai também ganha ============ */

const paiGanha: Slide[] = [
  () => (
    <Post pagina={[1, 2]} brilhoY={600}>
      <Texto top={230} tamanho={118} titulo={"O pai também\n**ganha com isso**"} sub="O que muda pra família quando a sua van usa o Van360:" />
      <Lista top={780} gap={30}>
        <Item icone={Bell} cor={BLUE} titulo="Aviso de embarque e entrega" texto="Sabe na hora que o filho entrou e chegou" />
        <Item icone={BusFront} cor={AMBER} titulo="Aviso de van a caminho" texto="Quando a casa dele é a próxima parada" />
        <Item icone={CalendarX} cor={RED} titulo="Avisa a falta pelo app" texto="Sem precisar te ligar cedinho" />
      </Lista>
    </Post>
  ),
  () => (
    <Post pagina={[2, 2]} brilhoY={900}>
      <Texto top={130} tamanho={110} titulo={"E ainda\n**paga sem confusão**"} />
      <Lista top={460} gap={22}>
        <Item icone={MessageCircle} cor={WHATS} titulo="Lembrete com a chave Pix" texto="No WhatsApp, no dia do vencimento" />
        <Item icone={Receipt} cor={GREEN} titulo="Recibo de cada pagamento" texto="Com a sua logo" />
        <Item icone={FileSignature} cor={NAVY} titulo="Contrato assinado no celular" texto="Sem papel, sem ir até a casa dele" />
      </Lista>
      <Texto top={1110} centro tamanho={64} titulo={"Pai tranquilo é **menos pergunta pra você.**"} />
      <Chamada top={1310} texto="Teste grátis por 15 dias" />
    </Post>
  ),
];

/* ============ 22. Estático: frete e passeio sem planilha ============ */

const fretes: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Frete e passeio\n**sem planilha**"}
        sub="Vagas, inscrições pelo link e quem já pagou, viagem por viagem."
      />
      <Celular top={640} escala={1.95}>
        <TelaPasseios />
      </Celular>
      <Destaque x={20} y={1050} rot={-3} cor={GREEN} icone={UserCheck} titulo="Inscrição pelo link" texto="O passageiro mesmo preenche" />
      <Destaque x={620} y={1330} rot={3} cor={BLUE} icone={PartyPopper} titulo="Passeio lotado" texto="20 de 20 vagas pagas" />
    </Post>
  ),
];

/* ============ 23. Estático: seu mês numa tela ============ */

const mes: Slide[] = [
  () => (
    <Post brilhoY={1200}>
      <Texto
        top={110}
        centro
        tamanho={104}
        titulo={"Quanto sobrou\n**esse mês?**"}
        sub="Mensalidades, gastos e lucro da van numa tela só."
      />
      <Celular top={640} escala={1.95}>
        <TelaRelatorios />
      </Celular>
      <Destaque x={20} y={1000} rot={-3} cor={RED} icone={Fuel} titulo="Gastos anotados" texto="Combustível, manutenção..." />
      <Destaque x={600} y={1320} rot={3} cor={GREEN} icone={TrendingUp} titulo="Lucro do mês" texto="Sem fazer conta" />
    </Post>
  ),
];

/* ============ 24. Estático: de norte a sul ============ */

const FALAS: Array<[string, string, string]> = [
  ["“O aplicativo tornou minha rotina muito mais prática e organizada.”", "Tia Verinha", "Gravataí, RS"],
  ["“O fim da papelada com contrato é o melhor.”", "Tio Ricardo", "Santa Maria, DF"],
  ["“Eu mesmo não fico mais sem.”", "Tio Flávio", "Americana, SP"],
];

const norteSul: Slide[] = [
  () => {
    const u = useU();
    return (
      <Post brilhoY={900}>
        <Texto top={100} centro tamanho={104} titulo={"Tios e tias\n**de norte a sul**"} sub="Transporte escolar de todo o Brasil já usa o Van360." />
        <div style={{ position: "absolute", top: 560 * u, left: 40 * u, width: 640 * u, height: 667 * u }}>
          <svg viewBox="0 0 613 639" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {Object.entries(ESTADOS).map(([uf, d]) => (
              <path key={uf} d={d} fill="#24467f" stroke="#0b1a2e" strokeWidth={1.4} />
            ))}
            {PONTOS.map(([, x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={9} fill={AMBER} opacity={0.22} />
                <circle cx={x} cy={y} r={4.2} fill={AMBER} />
              </g>
            ))}
          </svg>
        </div>
        <div style={{ position: "absolute", top: 640 * u, left: 700 * u, right: 60 * u, display: "flex", flexDirection: "column", gap: 34 * u }}>
          {FALAS.map(([fala, nome, local]) => (
            <div
              key={nome}
              style={{
                background: "white",
                borderRadius: 30 * u,
                padding: `${26 * u}px ${30 * u}px`,
                boxShadow: "0 24px 50px -20px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 36 * u, lineHeight: 1.2, color: NAVY }}>{fala}</div>
              <div style={{ marginTop: 12 * u, display: "flex", alignItems: "center", gap: 8 * u, fontFamily: "Inter", fontWeight: 600, fontSize: 28 * u, color: "#64748b", whiteSpace: "nowrap" }}>
                <MapPin style={{ width: 28 * u, height: 28 * u, color: BLUE, flexShrink: 0 }} />
                {nome} · {local}
              </div>
            </div>
          ))}
        </div>
      </Post>
    );
  },
];

/* ============ 25. Estático: Indique e Ganhe ============ */

const indique: Slide[] = [
  () => {
    const u = useU();
    const Bloco: React.FC<{ etiqueta: string; titulo: string; texto: string; cor: string }> = ({ etiqueta, titulo, texto, cor }) => (
      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: 40 * u,
          padding: `${40 * u}px ${36 * u}px`,
          boxShadow: "0 30px 60px -24px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 18 * u,
        }}
      >
        <Etiqueta texto={etiqueta} fundo={cor} cor="white" style={{ alignSelf: "flex-start", fontSize: 28 * u }} />
        <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 78 * u, lineHeight: 1.05, letterSpacing: "-0.03em", color: NAVY, whiteSpace: "pre-line" }}>
          <Destacado texto={titulo} cor={BLUE} />
        </div>
        <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 36 * u, lineHeight: 1.35, color: "#475569" }}>{texto}</div>
      </div>
    );
    return (
      <Post brilhoY={1000}>
        <div
          style={{
            position: "absolute",
            top: 120 * u,
            left: "50%",
            translate: "-50% 0",
            width: 150 * u,
            height: 150 * u,
            borderRadius: 44 * u,
            background: AMBER,
            color: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Gift style={{ width: 84 * u, height: 84 * u }} strokeWidth={2.2} />
        </div>
        <Texto top={320} centro tamanho={120} titulo={"Indicou um colega?\n**Os dois ganham.**"} />
        <div style={{ position: "absolute", top: 680 * u, left: 80 * u, right: 80 * u, display: "flex", gap: 30 * u }}>
          <Bloco etiqueta="VOCÊ GANHA" titulo={"**+30 dias**\ngrátis"} texto="Quando o colega que você indicou assinar." cor={GREEN} />
          <Bloco etiqueta="SEU COLEGA GANHA" titulo={"**50% off**\nno 1º mês"} texto="Pra começar a organizar a van dele." cor={BLUE} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 1180 * u,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 40 * u,
            color: BRANCO_SUAVE,
          }}
        >
          Seu link de indicação fica no app, em Indique e Ganhe.
        </div>
      </Post>
    );
  },
];

export const POSTS_LOTE4: PostDef[] = [
  { id: "20-aluno-desativado", slides: desativar },
  { id: "21-pai-tambem-ganha", slides: paiGanha },
  { id: "22-fretes-sem-planilha", slides: fretes },
  { id: "23-seu-mes-numa-tela", slides: mes },
  { id: "24-norte-a-sul", slides: norteSul },
  { id: "25-indique-e-ganhe", slides: indique },
];
