import React from "react";
import { AbsoluteFill } from "remotion";
import {
  BusFront, CircleHelp, Gift, MessageSquareQuote, Rocket, ShieldCheck, Smartphone,
} from "lucide-react";
import { AMBER, NAVY } from "../loja/base";

/**
 * Capas dos destaques do Instagram (1080x1920). O Instagram mostra só o círculo central,
 * então o ícone fica no meio, sozinho, sem texto (o nome do destaque é o texto embaixo do círculo).
 * Duas versões: "navy" (fundo azul-escuro, ícone âmbar) e "ambar" (fundo âmbar, ícone azul-escuro).
 */

export const DESTAQUES: Array<{ id: string; nome: string; icone: React.ElementType }> = [
  { id: "1-comece-aqui", nome: "COMECE AQUI", icone: Rocket },
  { id: "2-quem-somos", nome: "QUEM SOMOS", icone: BusFront },
  { id: "3-depoimentos", nome: "DEPOIMENTOS", icone: MessageSquareQuote },
  { id: "4-como-usar", nome: "COMO USAR", icone: Smartphone },
  { id: "5-para-os-pais", nome: "PARA OS PAIS", icone: ShieldCheck },
  { id: "6-duvidas", nome: "DÚVIDAS", icone: CircleHelp },
  { id: "7-indique", nome: "INDIQUE", icone: Gift },
];

/** Props só com texto (o Remotion serializa as props das composições). */
export const CapaDestaque: React.FC<{ id: string; variante: "navy" | "ambar" }> = ({ id, variante }) => {
  const I = DESTAQUES.find((d) => d.id === id)!.icone;
  const navy = variante === "navy";
  return (
    <AbsoluteFill
      style={{
        background: navy
          ? `radial-gradient(circle at 50% 50%, #17396b 0%, ${NAVY} 38%)`
          : `radial-gradient(circle at 50% 50%, #ffc533 0%, ${AMBER} 40%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <I style={{ width: 470, height: 470, color: navy ? AMBER : NAVY }} strokeWidth={1.7} />
    </AbsoluteFill>
  );
};
