import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Fretamentos from "@/pages/Fretamentos";
import PasseioDetalhes from "@/pages/PasseioDetalhes";
import PasseioInscricaoPublica from "@/pages/PasseioInscricaoPublica";
import MenuPage from "@/pages/MenuPage";
import { NovoFretamentoOuPasseioDialog } from "@/components/dialogs/NovoFretamentoOuPasseioDialog";
import { PasseioFormDialog } from "@/components/dialogs/PasseioFormDialog";
import { FretamentoFormDialog } from "@/components/dialogs/FretamentoFormDialog";
import { RegistrarPagamentoParticipanteDialog } from "@/components/dialogs/RegistrarPagamentoParticipanteDialog";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground } from "../components/brand";
import { VideoStateProvider } from "../mocks/videoState";
import { listaFretamentos } from "../mocks/fretamentos";
import { usarLarguraDeCelular } from "../viewport";

const noop = () => {};
const PASSEIO = { titulo: "Excursão Zooparque", destino: "Zooparque Itatiba", origem: "Portão do Colégio Aurora", data_inicio: "2026-03-28T07:00", data_fim: "2026-03-28T17:30", valor_por_pessoa: "60,00", vagas_totais: 18, observacoes: "Levar lanche, garrafinha de água e boné." };
const FRETE = { titulo: "Casamento em Campinas", data_inicio: "2026-03-29", valor_total: "1.200,00", tem_sinal: true, valor_sinal: "400,00" };

/** Quadro N mostra a tela N (para conferir com stills). */
export const DebugFretamentos: React.FC = () => {
  usarLarguraDeCelular();
  const f = useCurrentFrame();
  const det = listaFretamentos(4).find((i) => i.id === "zoo");
  const telas = [
    { route: "/menu", el: <MenuPage />, path: "/menu", etapa: 0 },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 0 },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 0, ov: <NovoFretamentoOuPasseioDialog isOpen onClose={noop} onSelectFretamento={noop} onSelectPasseio={noop} /> },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 0, ov: <PasseioFormDialog isOpen onClose={noop} /> },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 1 },
    { route: "/fretamentos-e-passeios/zoo", el: <PasseioDetalhes />, path: "/fretamentos-e-passeios/:id", etapa: 1 },
    { route: "/passeio/zooparque-aurora", el: <PasseioInscricaoPublica />, path: "/passeio/:slug", etapa: 2, chrome: false },
    { route: "/fretamentos-e-passeios/zoo", el: <PasseioDetalhes />, path: "/fretamentos-e-passeios/:id", etapa: 3 },
    { route: "/fretamentos-e-passeios/zoo", el: <PasseioDetalhes />, path: "/fretamentos-e-passeios/:id", etapa: 3, ov: <RegistrarPagamentoParticipanteDialog isOpen onClose={noop} fretamentoId="zoo" passeioTitulo="Excursão Zooparque" participante={det?.participantes[0] as any} /> },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 4, ov: <FretamentoFormDialog isOpen onClose={noop} /> },
    { route: "/fretamentos-e-passeios", el: <Fretamentos />, path: "/fretamentos-e-passeios", etapa: 5 },
    { route: "/fretamentos-e-passeios/zoo", el: <PasseioDetalhes />, path: "/fretamentos-e-passeios/:id", etapa: 3, sc: 400 },
    { route: "/passeio/zooparque-aurora", el: <PasseioInscricaoPublica />, path: "/passeio/:slug", etapa: 2, chrome: false, sc: 520 },
    { route: "/passeio/zooparque-aurora", el: <PasseioInscricaoPublica />, path: "/passeio/:slug", etapa: 2, chrome: false, sc: 900 },
  ];
  const t = telas[Math.min(f, telas.length - 1)];
  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", top: 100 }}>
        <VideoStateProvider value={{ fretamentos: { etapa: t.etapa }, passeioForm: PASSEIO, freteForm: FRETE }}>
          <PhoneScreen key={f} route={t.route} pageTitle="Fretamentos e Passeios" scale={2} scrollY={(t as any).sc ?? 0} showChrome={t.chrome !== false} contentClassName={t.chrome === false ? "" : undefined} overlay={t.ov}>
            <Routes>
              <Route path={t.path} element={t.el} />
            </Routes>
          </PhoneScreen>
        </VideoStateProvider>
      </AbsoluteFill>
    </BrandBackground>
  );
};
