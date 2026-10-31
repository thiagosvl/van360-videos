import React, { useContext } from "react";
import { SemLegenda } from "./tutorial";
import { Audio, Sequence, staticFile } from "remotion";

/** Sons disponíveis em public/sfx (gerados por scripts/build_sfx.py). */
export type SfxName =
  | "tap"
  | "open"
  | "close"
  | "success"
  | "scroll"
  | "pop"
  | "select"
  | "whoosh"
  | "whoosh-soft"
  | "notif"
  | "vibra"
  | "chime";

export type SfxEvent = { at: number; sfx: SfxName; volume?: number };

/** Volume geral dos efeitos por baixo da narração. */
const DUCK = 0.55;

/** Camada de efeitos sonoros: um <Audio> por evento, no frame exato. */
export const Sfx: React.FC<{ events: SfxEvent[] }> = ({ events }) => (
  <>
    {events.map((e, i) => (
      <Sequence key={`${e.sfx}-${e.at}-${i}`} from={Math.round(e.at)} durationInFrames={60} layout="none" name={`sfx ${e.sfx}`}>
        <Audio src={staticFile(`sfx/${e.sfx}.wav`)} volume={(e.volume ?? 1) * DUCK} />
      </Sequence>
    ))}
  </>
);

/** Narração: uma fala por beat, começando junto com a legenda. */
/** (trechos reaproveitados em outro vídeo, com SemLegenda, ficam sem a narração original) */
export const Narracao: React.FC<{ pasta: string; beats: { from: number }[]; atraso?: number }> = ({ pasta, beats, atraso = 6 }) =>
  useContext(SemLegenda) ? null : (
  <>
    {beats.map((b, i) => (
      <Sequence key={i} from={b.from + atraso} layout="none" name={`fala ${i + 1}`}>
        <Audio src={staticFile(`narracao/${pasta}/fala-${i + 1}.mp3`)} />
      </Sequence>
    ))}
  </>
);
