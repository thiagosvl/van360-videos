import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhatsAppMessageContainer, WhatsAppActionButton } from "@/components/ui/WhatsAppMessageContainer";
import { BRAND, BrandBackground, Headline, ease } from "../components/brand";
import { LEMBRETE_WHATSAPP, MOTORISTA } from "../mocks/data";

/** Mesma mensagem do WhatsAppShowcaseEmulator do app, com dados fictícios. */
export const WhatsAppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 18, fps, config: { damping: 14, mass: 0.7 } });

  return (
    <BrandBackground>
      <Headline text={"Lembrete **automático** no WhatsApp"} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: 260 }}>
        <div
          style={{
            width: 330,
            scale: String(2.75 * pop),
            opacity: interpolate(frame, [18, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <WhatsAppMessageContainer
            driverName={MOTORISTA.apelido}
            time={LEMBRETE_WHATSAPP.hora}
            className="min-h-0 max-w-none"
            actionButton={
              <WhatsAppActionButton
                label="Copiar código Pix"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] stroke-[#00a884] fill-none stroke-[1.6]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
              />
            }
          >
            <p>
              Olá {LEMBRETE_WHATSAPP.responsavel}, a parcela do transporte escolar de {LEMBRETE_WHATSAPP.aluno} no valor de{" "}
              {LEMBRETE_WHATSAPP.valor} vence HOJE.
            </p>
            <p>Por favor, efetue o pagamento para manter o transporte em dia.</p>
            <p className="italic text-[#54656f] text-[12px] leading-[16px]">
              Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
            </p>
          </WhatsAppMessageContainer>
        </div>
      </AbsoluteFill>

      {/* selo: você não precisa mandar nada */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 38px",
            borderRadius: 999,
            background: "white",
            border: "2px solid #e5e5e5",
            boxShadow: "0 12px 30px -12px rgba(11,26,46,0.25)",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 42,
            color: BRAND.ink,
            opacity: interpolate(frame, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [60, 80], ["0px 40px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 99,
              background: BRAND.whatsapp,
              boxShadow: `0 0 0 8px ${BRAND.whatsapp}33`,
            }}
          />
          Enviado sozinho, sem você digitar nada
        </div>
      </AbsoluteFill>
    </BrandBackground>
  );
};
