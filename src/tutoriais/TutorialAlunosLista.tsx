import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PhoneScreen } from "../components/PhoneScreen";
import { FiltrosAlunosSheet } from "../components/FiltrosAlunosSheet";
import { BrandBackground, ease, usePhoneRise } from "../components/brand";
import { Beat, Caption, Finger, beatsDuration } from "../components/tutorial";
import { ESCOLAS, PASSAGEIROS } from "../mocks/data";

/**
 * Tutorial: "Seus alunos, sempre à mão" (tela de Alunos).
 *
 * As falas abaixo são o roteiro. Quando a narração for gravada,
 * é só ajustar `from`/`duration` de cada fala para bater com o áudio:
 * as ações da tela (toques, busca, filtro) seguem os mesmos tempos.
 */
export const BEATS: Beat[] = [
  { text: "Chega de procurar dados de aluno no **papel** ou no WhatsApp.", from: 0, duration: 150 },
  { text: "Aqui ficam todos os seus **alunos**, com responsável, escola e turma.", from: 150, duration: 180 },
  { text: "Precisa achar alguém? É só **buscar** pelo nome.", from: 330, duration: 180 },
  { text: "Quer ver só os alunos de uma escola? Use os **filtros**.", from: 510, duration: 210 },
  { text: "Aluno saiu da van? **Desative** e o histórico continua guardado.", from: 720, duration: 180 },
  { text: "Tudo organizado, direto no seu **celular**.", from: 900, duration: 150 },
];
export const TUTORIAL_ALUNOS_LISTA_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const noop = () => {};

// pontos de toque (px do celular 390x844)
const P = {
  busca: { x: 190, y: 130 },
  limparBusca: { x: 355, y: 130 },
  filtros: { x: 105, y: 180 },
  selectEscola: { x: 195, y: 528 },
  aplicar: { x: 195, y: 770 },
};

const BUSCA = "Helena";
const ESCOLAS_LISTA = Object.values(ESCOLAS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const TutorialAlunosLista: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(4);

  /* ---------- estado da tela por frame ---------- */

  // 1. lista carregando card a card
  const visiveis = Math.max(0, Math.min(PASSAGEIROS.length, Math.floor((frame - 22) / 3)));

  // 3. busca digitada
  const typeStart = B[3] + 40;
  const chars = Math.floor((frame - typeStart) / 5) + 1;
  const busca = frame >= typeStart && frame < B[3] + 165 ? BUSCA.slice(0, Math.min(BUSCA.length, chars)) : "";

  // 4. gaveta de filtros
  const abreGaveta = B[4] + 28;
  const escolhe = B[4] + 90;
  const aplica = B[4] + 132;
  const gaveta =
    frame < aplica + 4
      ? interpolate(frame, [abreGaveta, abreGaveta + 16], [0, 1], { ...clamp, easing: ease })
      : interpolate(frame, [aplica + 4, aplica + 20], [1, 0], { ...clamp, easing: ease });
  const escolaGaveta = frame >= escolhe ? ESCOLAS.aurora.id : "todas";
  const filtroAtivo = frame >= aplica + 6 && frame < B[5];

  // 5. um aluno desativado (o card fica esmaecido, como no app)
  const desativa = B[5] + 60;

  const lista = PASSAGEIROS.slice(0, visiveis)
    .map((p) => (p.id === "p2" && frame >= desativa ? ({ ...p, ativo: false } as typeof p) : p))
    .filter((p) => {
      if (filtroAtivo && p.escola?.id !== ESCOLAS.aurora.id) return false;
      if (!busca) return true;
      return p.nome.toLowerCase().includes(busca.toLowerCase());
    });

  /* ---------- câmera ---------- */
  const zoom =
    frame < B[2] + 140
      ? interpolate(frame, [B[2] + 15, B[2] + 45], [1, 1.28], { ...clamp, easing: ease })
      : interpolate(frame, [B[2] + 140, B[2] + 170], [1.28, 1], { ...clamp, easing: ease });
  const zoomFinal = interpolate(frame, [B[6], B[6] + 40], [1, 0.9], { ...clamp, easing: ease });

  const logoIn = interpolate(frame, [B[6] + 30, B[6] + 50], [0, 1], clamp);

  return (
    <BrandBackground>
      <Caption beats={BEATS} />

      <AbsoluteFill style={{ alignItems: "center", top: 470 }}>
        <div
          style={{
            translate: `0px ${rise}px`,
            scale: String(zoom * zoomFinal),
            transformOrigin: "50% 0%",
          }}
        >
          <PhoneScreen
            route="/alunos"
            pageTitle="Alunos"
            scale={1.5}
            overlay={
              <>
                <FiltrosAlunosSheet
                  progress={gaveta}
                  escola={escolaGaveta}
                  escolas={ESCOLAS_LISTA}
                  aplicarPressionado={frame >= aplica && frame < aplica + 6}
                />
                {/* busca */}
                <Finger
                  showFrom={B[3] + 10}
                  hideAt={B[3] + 168}
                  steps={[
                    { at: B[3] + 10, ...P.busca },
                    { at: B[3] + 26, ...P.busca, tap: true },
                    { at: B[3] + 150, ...P.limparBusca, tap: true },
                  ]}
                />
                {/* filtros */}
                <Finger
                  showFrom={B[4] + 6}
                  hideAt={aplica + 10}
                  steps={[
                    { at: B[4] + 6, ...P.filtros },
                    { at: abreGaveta - 4, ...P.filtros, tap: true },
                    { at: escolhe - 8, ...P.selectEscola, tap: true },
                    { at: aplica, ...P.aplicar, tap: true },
                  ]}
                />
              </>
            }
          >
            <div className="space-y-4">
              <PassageirosToolbar
                searchTerm={busca}
                onSearchChange={noop}
                selectedStatus="todos"
                onStatusChange={noop}
                selectedEscola={filtroAtivo ? ESCOLAS.aurora.id : "todas"}
                onEscolaChange={noop}
                selectedVeiculo="todos"
                onVeiculoChange={noop}
                selectedPeriodo="todos"
                onPeriodoChange={noop}
                escolas={ESCOLAS_LISTA}
                veiculos={[]}
                onClearFilters={noop}
                hasActiveFilters={filtroAtivo}
                onApplyFilters={noop}
                onRegister={noop}
                showAdvancedFilters
                showRegister
                searchPlaceholder="Buscar aluno ou responsável..."
              />
              <div className="flex items-center justify-end px-0.5">
                <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  {lista.length} {lista.length === 1 ? "aluno" : "alunos"}
                </span>
              </div>
              <PassageirosList
                passageiros={lista}
                onHistorico={noop}
                onEdit={noop}
                onToggleClick={noop}
                onDeleteClick={noop}
              />
            </div>
          </PhoneScreen>
        </div>
      </AbsoluteFill>

      {/* assinatura discreta no final, dentro da faixa segura */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 160, opacity: logoIn }}>
        <Img src={staticFile("logo-van360-horizontal.png")} style={{ width: 260 }} />
      </AbsoluteFill>
    </BrandBackground>
  );
};
