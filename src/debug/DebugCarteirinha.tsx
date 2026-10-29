import React from "react";
import { AbsoluteFill } from "remotion";
import { Routes, Route } from "react-router-dom";
import PassageiroCarteirinha from "@/pages/PassageiroCarteirinha";
import { PhoneScreen } from "../components/PhoneScreen";

/** Só para conferir layout: celular com a carteirinha em várias rolagens. */
export const DebugCarteirinha: React.FC<{ tab: string; ano: string; scrolls: number[] }> = ({ tab, ano, scrolls }) => (
  <AbsoluteFill style={{ background: "#ddd", flexDirection: "row", gap: 20, padding: 20 }}>
    {scrolls.map((s) => (
      <div key={s} style={{ width: 414, height: 868 }}>
        <PhoneScreen route={`/alunos/p1?tab=${tab}&ano=${ano}`} pageTitle="Carteirinha" scale={1} scrollY={s}>
          <Routes>
            <Route path="/alunos/:passageiro_id" element={<PassageiroCarteirinha />} />
          </Routes>
        </PhoneScreen>
      </div>
    ))}
  </AbsoluteFill>
);
