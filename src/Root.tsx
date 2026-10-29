import "@/index.css"; // o CSS global do Van360 (tokens, fontes, base)
import "./video.css";
import React from "react";
import { Composition, Folder } from "remotion";
import { Teaser, TEASER_DURATION } from "./Teaser";
import { HookScene } from "./scenes/HookScene";
import { AlunosScene } from "./scenes/AlunosScene";
import { PainelScene } from "./scenes/PainelScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { OutroScene } from "./scenes/OutroScene";
import { TutorialAlunosLista, TUTORIAL_ALUNOS_LISTA_DURATION } from "./tutoriais/TutorialAlunosLista";
import { TutorialAlunosSolicitacoes, TUTORIAL_ALUNOS_SOLICITACOES_DURATION } from "./tutoriais/TutorialAlunosSolicitacoes";

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
