import "@/index.css"; // o CSS global do Van360 (tokens, fontes, base)
import "./video.css";
import React from "react";
import { Composition, Folder, Still } from "remotion";
import { SLIDES_LOJA } from "./loja/Loja";
import { Teaser, TEASER_DURATION } from "./Teaser";
import { HookScene } from "./scenes/HookScene";
import { AlunosScene } from "./scenes/AlunosScene";
import { PainelScene } from "./scenes/PainelScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { OutroScene } from "./scenes/OutroScene";
import { DebugCarteirinha } from "./debug/DebugCarteirinha";
import { TutorialAlunosLista, TUTORIAL_ALUNOS_LISTA_DURATION } from "./tutoriais/TutorialAlunosLista";
import { TutorialAlunosSolicitacoes, TUTORIAL_ALUNOS_SOLICITACOES_DURATION } from "./tutoriais/TutorialAlunosSolicitacoes";
import { TutorialParcelas, TUTORIAL_PARCELAS_DURATION } from "./tutoriais/TutorialParcelas";
import { TutorialCarteirinha, TUTORIAL_CARTEIRINHA_DURATION } from "./tutoriais/TutorialCarteirinha";
import { DebugFinanceiro, ESTADOS_FINANCEIRO } from "./debug/DebugFinanceiro";
import { TutorialGastos, TUTORIAL_GASTOS_DURATION } from "./tutoriais/TutorialGastos";
import { TutorialRelatorios, TUTORIAL_RELATORIOS_DURATION } from "./tutoriais/TutorialRelatorios";
import { TutorialRenovacao, TUTORIAL_RENOVACAO_DURATION } from "./tutoriais/TutorialRenovacao";
import { TutorialIndicacao, TUTORIAL_INDICACAO_DURATION } from "./tutoriais/TutorialIndicacao";
import { ApresentacaoApp, APRESENTACAO_DURATION } from "./apresentacao/ApresentacaoApp";
import { TutorialRotas, TUTORIAL_ROTAS_DURATION } from "./tutoriais/TutorialRotas";
import { Capa } from "./apresentacao/Capa";
import { CapaVideo, CapaProps } from "./components/CapaVideo";
import { TutorialContratos, TUTORIAL_CONTRATOS_DURATION } from "./tutoriais/TutorialContratos";

const V = { width: 1080, height: 1920, fps: 30 };

/** Capa: composição do tamanho do vídeo (as cenas dependem disso); a imagem sai do quadro 0 congelado em `quadro`. */
const capa = (id: string, duracao: number, props: CapaProps) => {
  const C: React.FC = () => <CapaVideo {...props} />;
  return <Composition key={id} id={id} component={C} durationInFrames={duracao} {...V} />;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CapaApresentacao" component={Capa} durationInFrames={TUTORIAL_PARCELAS_DURATION} {...V} />
    <Folder name="Capas">
      {/* uma linha por vídeo: tela (quadro), título, botão, ícone e subtítulo */}
      {[
        capa("CapaRotas", TUTORIAL_ROTAS_DURATION, {
          Video: TutorialRotas,
          quadro: 640,
          titulo: "Sua rota organizada, **parada por parada**",
          botao: "Veja como funciona",
          icone: "▶",
          subtitulo: "Em 46 segundos",
        }),
      ]}
    </Folder>
    <Composition id="Teaser" component={Teaser} durationInFrames={TEASER_DURATION} {...V} />
    <Folder name="Tutoriais">
      <Composition
        id="TutorialAlunosLista"
        component={TutorialAlunosLista}
        durationInFrames={TUTORIAL_ALUNOS_LISTA_DURATION}
        {...V}
      />
      <Composition
        id="TutorialAlunosSolicitacoes"
        component={TutorialAlunosSolicitacoes}
        durationInFrames={TUTORIAL_ALUNOS_SOLICITACOES_DURATION}
        {...V}
      />
      <Composition
        id="TutorialParcelas"
        component={TutorialParcelas}
        durationInFrames={TUTORIAL_PARCELAS_DURATION}
        {...V}
      />
      <Composition
        id="TutorialCarteirinha"
        component={TutorialCarteirinha}
        durationInFrames={TUTORIAL_CARTEIRINHA_DURATION}
        {...V}
      />
      <Composition
        id="TutorialContratos"
        component={TutorialContratos}
        durationInFrames={TUTORIAL_CONTRATOS_DURATION}
        {...V}
      />
      <Composition
        id="TutorialGastos"
        component={TutorialGastos}
        durationInFrames={TUTORIAL_GASTOS_DURATION}
        {...V}
      />
      <Composition
        id="TutorialRelatorios"
        component={TutorialRelatorios}
        durationInFrames={TUTORIAL_RELATORIOS_DURATION}
        {...V}
      />
      <Composition
        id="TutorialRenovacao"
        component={TutorialRenovacao}
        durationInFrames={TUTORIAL_RENOVACAO_DURATION}
        {...V}
      />
      <Composition
        id="TutorialIndicacao"
        component={TutorialIndicacao}
        durationInFrames={TUTORIAL_INDICACAO_DURATION}
        {...V}
      />
      <Composition
        id="TutorialRotas"
        component={TutorialRotas}
        durationInFrames={TUTORIAL_ROTAS_DURATION}
        {...V}
      />
      <Composition
        id="ApresentacaoApp"
        component={ApresentacaoApp}
        durationInFrames={APRESENTACAO_DURATION}
        {...V}
      />
    </Folder>
    <Folder name="Debug">
      <Composition
        id="DebugFinanceiro"
        component={DebugFinanceiro}
        durationInFrames={ESTADOS_FINANCEIRO.length}
        {...V}
      />
      <Composition
        id="DebugCarteirinha"
        component={DebugCarteirinha}
        durationInFrames={1}
        width={1800}
        height={910}
        fps={30}
        defaultProps={{ tab: "parcelas", ano: "2026", scrolls: [0, 700, 1400, 2100] }}
      />
    </Folder>
    <Folder name="Loja-AppStore">
      {SLIDES_LOJA.map((s) => (
        <Still key={s.id} id={`ios-${s.id}`} component={s.component} width={1290} height={2796} />
      ))}
    </Folder>
    <Folder name="Loja-PlayStore">
      {SLIDES_LOJA.filter((s) => s.android).map((s) => (
        <Still key={s.id} id={`android-${s.id}`} component={s.component} defaultProps={{ android: true }} width={1080} height={1920} />
      ))}
    </Folder>
    <Folder name="Cenas">
      <Composition id="Gancho" component={HookScene} durationInFrames={90} {...V} />
      <Composition id="Alunos" component={AlunosScene} durationInFrames={210} {...V} />
      <Composition id="Painel" component={PainelScene} durationInFrames={180} {...V} />
      <Composition id="WhatsApp" component={WhatsAppScene} durationInFrames={165} {...V} />
      <Composition id="Fechamento" component={OutroScene} durationInFrames={120} {...V} />
    </Folder>
  </>
);
