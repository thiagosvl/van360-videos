import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { HookScene } from "./scenes/HookScene";
import { AlunosScene } from "./scenes/AlunosScene";
import { PainelScene } from "./scenes/PainelScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { OutroScene } from "./scenes/OutroScene";

export const TRANSITION = 15;
const t = () => linearTiming({ durationInFrames: TRANSITION });

/** Teaser vertical de ~24s para Reels / anúncios. */
export const Teaser: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Gancho" durationInFrames={90}>
      <HookScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={t()} />
    <TransitionSeries.Sequence name="Alunos" durationInFrames={210}>
      <AlunosScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t()} />
    <TransitionSeries.Sequence name="Painel" durationInFrames={180}>
      <PainelScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t()} />
    <TransitionSeries.Sequence name="WhatsApp" durationInFrames={165}>
      <WhatsAppScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={t()} />
    <TransitionSeries.Sequence name="Fechamento" durationInFrames={120}>
      <OutroScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

export const TEASER_DURATION = 90 + 210 + 180 + 165 + 120 - 4 * TRANSITION;
