import "@/index.css"; // o CSS global do Van360 (tokens, fontes, base)
import "./video.css";
import React from "react";
import { Composition, Folder, Still } from "remotion";
import { SLIDES_LOJA } from "./loja/Loja";
import { POSTS } from "./posts/Posts";
import { POSTS_LOTE2 } from "./posts/Lote2";
import { POSTS_LOTE3 } from "./posts/Lote3";
import { POSTS_LOTE4 } from "./posts/Lote4";
import { POSTS_LOTE5 } from "./posts/Lote5";
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
import { TutorialContratos, TUTORIAL_CONTRATOS_DURATION } from "./tutoriais/TutorialContratos";

const V = { width: 1080, height: 1920, fps: 30 };

export const RemotionRoot: React.FC = () => (
  <>
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
    <Folder name="Posts">
      {[...POSTS, ...POSTS_LOTE2, ...POSTS_LOTE3, ...POSTS_LOTE4, ...POSTS_LOTE5].flatMap((p) =>
        p.slides.map((S, i) => (
          <Still key={`${p.id}-${i + 1}`} id={`post-${p.id}-${i + 1}`} component={S} width={1080} height={1350} />
        )),
      )}
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
