import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Users, GraduationCap } from "lucide-react";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { SecondaryKPICard } from "@/components/features/home/SecondaryKPICard";
import { Banner } from "@/components/ui/Banner";
import { AcessoRapido } from "@/components/features/home/AcessoRapido";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground, Headline, ease, usePhoneRise } from "../components/brand";
import { FINANCEIRO_MES } from "../mocks/data";

const noop = () => {};

/** Tela real de Início: painel financeiro do mês com os números subindo. */
export const PainelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = usePhoneRise(8);

  // 0 → 1 enquanto os valores "carregam"
  const t = interpolate(frame, [30, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const recebido = Math.round(FINANCEIRO_MES.recebido * t);
  const atrasado = Math.round(FINANCEIRO_MES.atrasado * t);
  const pendente = FINANCEIRO_MES.totalEsperado - recebido;

  return (
    <BrandBackground>
      <Headline text={"Saiba **quem pagou** e quem falta pagar"} />
      <AbsoluteFill style={{ alignItems: "center", top: 450 }}>
        <div style={{ translate: `0px ${rise}px` }}>
          <PhoneScreen route="/inicio" scale={1.72}>
            {/* mesma estrutura do bloco superior da Home.tsx */}
            <div className="space-y-3.5">
              <div className="px-1">
                <p className="text-xs font-medium text-[#737373]">quinta-feira, 12 de março</p>
              </div>
              <section
                className="px-1"
                style={{
                  opacity: interpolate(frame, [85, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [85, 100], ["0px -12px", "0px 0px"], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: ease,
                  }),
                }}
              >
                <Banner
                  variant="danger"
                  title="1 parcela em atraso"
                  description="Referente ao mês de Março. Clique para ver agora."
                  onClick={noop}
                />
              </section>
              <div className="px-1 grid grid-cols-1 gap-4">
                <FinancialDashboardCard
                  totalEsperado={FINANCEIRO_MES.totalEsperado}
                  recebido={recebido}
                  pendente={pendente}
                  atrasado={atrasado}
                  showPrivacyToggle={false}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SecondaryKPICard label="Alunos" value={Math.round(24 * t)} icon={Users} />
                  <SecondaryKPICard label="Escolas" value={Math.round(3 * t)} icon={GraduationCap} />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <AcessoRapido onCadastrarPassageiro={noop} onRegistrarGasto={noop} />
            </div>
          </PhoneScreen>
        </div>
      </AbsoluteFill>
    </BrandBackground>
  );
};

