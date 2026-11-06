import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneScreen } from "../components/PhoneScreen";
import { BRAND, BrandBackground, ease } from "../components/brand";
import { Beat, beatsDuration } from "../components/tutorial";
import { Narracao, Sfx, SfxEvent } from "../components/Sfx";
import { WabaMessage, WABA_MODELOS } from "../components/WabaMessage";
import { TelaBloqueio } from "../components/TelaBloqueio";
import { MOTORISTA } from "../mocks/data";

/**
 * Venda: cobrança com baixa automática (~59s, narração do Thiago, sem CTA).
 * "Secretário financeiro" -> lembrete com Pix -> baixa sozinha + aviso -> dinheiro na hora
 * -> recibo com a marca -> multa e juros -> confiança -> fechamento.
 * Textos reais: modelo WABA "vence hoje", recibo (public/recibos) e a notificação
 * automaticPaymentReceivedDriver do back-end. Manchete curta por cena.
 */
const FALAS: Array<[string, number]> = [
  ["E se você tivesse um secretário financeiro que cobra os pais, confere o pagamento e ainda manda o recibo por você?", 217],
  ["É isso que a cobrança automática do Van360 faz.", 135],
  ["Nada de lembrar pai por pai. Ele recebe o lembrete no WhatsApp, com o código Pix pronto pra copiar.", 193],
  ["Ainda confere comprovante um por um? Aqui não. O pai pagou, o app dá baixa sozinho e te avisa.", 215],
  ["E o dinheiro cai na hora pra você, já com a taxa descontada.", 125],
  ["Segundos depois, o pai recebe o recibo no WhatsApp, com a sua marca.", 147],
  ["Quer cobrar multa e juros? Você escolhe: a multa entra uma vez, e os juros a cada dia de atraso. O pai pensa duas vezes antes de atrasar. E se atrasar, você recebe tudo junto.", 387],
  ["Tudo processado por banco regulado pelo Banco Central. Mais de 200 motoristas já usam.", 183],
  ["Você dirige. A gente cobra, confere e organiza.", 150],
];
export const BEATS: Beat[] = (() => {
  let t = 0;
  return FALAS.map(([text, duration]) => {
    const b = { text, from: t, duration };
    t += duration;
    return b;
  });
})();
export const COBRANCA_DURATION = beatsDuration(BEATS);

const B = Object.fromEntries(BEATS.map((b, i) => [i + 1, b.from])) as Record<number, number>;
const LEN = (n: number) => BEATS[n - 1].duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const F = 6; // a fala começa 6 quadros depois do beat
const FADE = 8;
const VERDE = "#16a34a";
const VERMELHO = "#dc2626";

/* dados do exemplo (iguais ao recibo real em public/recibos/recibo-davi-marco.png) */
const PAI = "Rodrigo";
const ALUNO = "Davi";
const VALOR = "R$ 280,00";

/* ------------------------------------------------------------------ */
/* peças                                                               */
/* ------------------------------------------------------------------ */
export const Destaque: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") ? (
        <span key={i} style={{ color: BRAND.blue }}>
          {p.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/** Manchete curta no topo (faixa 250 a 420). `de`/`ate` relativos à cena. */
export const Manchete: React.FC<{ text: string; de?: number; ate: number; size?: number }> = ({ text, de = 0, ate, size = 76 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < de || frame >= ate) return null;
  const s = spring({ frame: frame - de - 2, fps, config: { damping: 13, mass: 0.6 } });
  const sai = interpolate(frame, [ate - 8, ate], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 60,
        right: 60,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Manrope",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: BRAND.navy,
        opacity: Math.min(s, sai),
        scale: String(0.85 + 0.15 * s),
      }}
    >
      <span>
        <Destaque text={text} />
      </span>
    </div>
  );
};

export const Cena: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, FADE], [0, 1], { ...clamp, easing: ease });
  const sai = interpolate(frame, [len - FADE, len], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(entra, sai), translate: `${(1 - entra) * 140}px 0px` }}>{children}</AbsoluteFill>;
};

export const Pilula: React.FC<{ texto: string; top: number; cor?: { bg: string; fg: string } }> = ({ texto, top, cor = { bg: "#eef3ff", fg: BRAND.blue } }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "10px 28px", borderRadius: 999, background: cor.bg, color: cor.fg, fontFamily: "Inter", fontWeight: 700, fontSize: 32 }}>{texto}</div>
  </div>
);

export const useSpring = (de: number, cfg = { damping: 12, mass: 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - de, fps, config: cfg });
};

/** toque do dedo: círculo que encolhe (como o Finger dos tutoriais) */
export const Toque: React.FC<{ em: number; size?: number }> = ({ em, size = 96 }) => {
  const frame = useCurrentFrame();
  const aparece = interpolate(frame, [em - 14, em - 6], [0, 1], clamp);
  const aperta = interpolate(frame, [em - 2, em, em + 6], [1, 0.75, 1], clamp);
  const onda = interpolate(frame, [em, em + 14], [0, 1], clamp);
  if (frame < em - 14) return null;
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          border: `4px solid rgba(37,99,235,${0.6 * (1 - onda)})`,
          scale: String(1 + onda),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "4px solid rgba(37,99,235,0.85)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          opacity: aparece,
          scale: String(aperta),
        }}
      />
    </div>
  );
};

/** Lista do "secretário financeiro": cada tarefa ganha ✓ no seu tempo. */
const TAREFAS = ["Cobra os pais", "Confere o pagamento", "Manda o recibo"];
const Secretario: React.FC<{ marcas: number[]; entra?: number; top?: number }> = ({ marcas, entra = 0, top = 560 }) => {
  const card = useSpring(entra, { damping: 14, mass: 0.7 });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 110,
        right: 110,
        padding: "44px 46px",
        borderRadius: 44,
        background: "white",
        boxShadow: "0 30px 70px -28px rgba(11,26,46,0.4)",
        opacity: card,
        translate: `0px ${(1 - card) * 80}px`,
        fontFamily: "Manrope",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ width: 110, height: 110, borderRadius: 999, background: "#eef3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 66 }}>
          🧑‍💼
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#64748b" }}>Seu</div>
          <div style={{ fontSize: 50, fontWeight: 800, color: BRAND.navy, lineHeight: 1.05 }}>secretário financeiro</div>
        </div>
      </div>
      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 22 }}>
        {TAREFAS.map((t, i) => {
          const s = spring({ frame: frame - marcas[i], fps, config: { damping: 11, mass: 0.5 } });
          const feito = frame >= marcas[i];
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "22px 26px",
                borderRadius: 26,
                background: feito ? "#f0fdf4" : "#f8fafc",
                border: `2px solid ${feito ? "#bbf7d0" : "#e2e8f0"}`,
                fontSize: 46,
                fontWeight: 800,
                color: BRAND.navy,
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 999,
                  border: `4px solid ${feito ? VERDE : "#cbd5e1"}`,
                  background: feito ? VERDE : "white",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                }}
              >
                <span style={{ scale: String(s) }}>{feito ? "✓" : ""}</span>
              </div>
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 1. Gancho                                                           */
/* ------------------------------------------------------------------ */
const G = { cobra: F + 81, confere: F + 114, recibo: F + 150 };
const Gancho: React.FC = () => (
  <AbsoluteFill>
    <Manchete text="E se você tivesse um **secretário financeiro**?" ate={LEN(1)} size={70} />
    <Secretario marcas={[G.cobra, G.confere, G.recibo]} entra={4} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* 2. Virada                                                           */
/* ------------------------------------------------------------------ */
const Virada: React.FC = () => {
  const logo = useSpring(2, { damping: 11, mass: 0.7 });
  const nome = useSpring(F + 34, { damping: 13, mass: 0.6 });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 520,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 65%)",
          scale: String(logo),
        }}
      />
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 700, width: 600, scale: String(0.4 + 0.6 * logo), opacity: logo }} />
      <div
        style={{
          position: "absolute",
          top: 930,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Manrope",
          fontWeight: 800,
          color: BRAND.navy,
          opacity: nome,
          scale: String(0.8 + 0.2 * nome),
        }}
      >
        <div style={{ fontSize: 92, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          <Destaque text="Cobrança **automática**" />
        </div>
        <div style={{ fontSize: 44, color: "#64748b", marginTop: 18 }}>com baixa automática no app</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. O lembrete no WhatsApp do pai, com o Pix                          */
/* ------------------------------------------------------------------ */
const L = { chega: F + 54, copia: F + 146 };
const Lembrete: React.FC = () => {
  const frame = useCurrentFrame();
  const msg = useSpring(L.chega, { damping: 14, mass: 0.7 });
  const copiado = useSpring(L.copia + 4, { damping: 12, mass: 0.5 });
  return (
    <AbsoluteFill>
      <Manchete text="Lembrete **automático**" ate={LEN(3)} />
      <Pilula texto="WhatsApp do pai" top={540} cor={{ bg: "#dcfce7", fg: "#15803d" }} />
      {frame >= L.chega - 2 && (
        <AbsoluteFill style={{ alignItems: "center", top: 640 }}>
          <div style={{ width: 330, scale: String(2.7 * (0.9 + 0.1 * msg)), opacity: msg, transformOrigin: "50% 0%", position: "relative" }}>
            <WabaMessage motorista={MOTORISTA.apelido} hora="07:00">
              {WABA_MODELOS.venceHoje({ responsavel: PAI, aluno: ALUNO, valor: VALOR })}
            </WabaMessage>
            {/* o dedo no botão "Copiar código Pix" (rodapé do balão) */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 33, height: 0 }}>
              <Toque em={L.copia} size={36} />
            </div>
          </div>
        </AbsoluteFill>
      )}
      {frame >= L.copia + 4 && (
        <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "18px 34px",
              borderRadius: 999,
              background: BRAND.navy,
              color: "white",
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 36,
              opacity: copiado,
              translate: `0px ${(1 - copiado) * 30}px`,
            }}
          >
            ✓ Código Pix copiado
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Comprovantes um por um -> "Aqui não" -> baixa sozinha + aviso      */
/* ------------------------------------------------------------------ */
const C = { naoAqui: F + 73, troca: F + 92, notif: F + 132 };
const COMPROVANTES = [
  { rot: -8, x: -150, y: 0, at: 4 },
  { rot: 5, x: 120, y: 60, at: 16 },
  { rot: -2, x: -20, y: 150, at: 28 },
];
const Comprovante: React.FC<{ rot: number; x: number; y: number; at: number }> = ({ rot, x, y, at }) => {
  const s = useSpring(at, { damping: 12, mass: 0.6 });
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 210 + x,
        top: 640 + y,
        width: 420,
        padding: 34,
        borderRadius: 30,
        background: "white",
        boxShadow: "0 24px 50px -20px rgba(11,26,46,0.35)",
        rotate: `${rot}deg`,
        opacity: s,
        scale: String(0.7 + 0.3 * s),
        fontFamily: "Inter",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, color: "#64748b" }}>Comprovante Pix</div>
      <div style={{ fontSize: 54, fontWeight: 800, color: BRAND.navy, marginTop: 8 }}>R$ 280,00</div>
      {[0.9, 0.7, 0.8].map((w, i) => (
        <div key={i} style={{ height: 16, width: `${w * 100}%`, borderRadius: 8, background: "#e2e8f0", marginTop: 18 }} />
      ))}
    </div>
  );
};

const Baixa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = spring({ frame: frame - C.naoAqui, fps, config: { damping: 9, mass: 0.6 } });
  const saiComp = interpolate(frame, [C.troca, C.troca + 12], [0, -1150], { ...clamp, easing: ease });
  const entraCel = interpolate(frame, [C.troca, C.troca + 14], [1150, 0], { ...clamp, easing: ease });
  // aproxima na notificação quando ela chega (recorte abaixo da manchete)
  const zoom = interpolate(frame, [C.notif + 8, C.notif + 20], [1, 1.75], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Manchete text="Ainda confere **comprovante**?" ate={C.troca} size={70} />
      <Manchete text="Baixa **sozinha**" de={C.troca} ate={LEN(4)} />
      {frame < C.troca + 12 && (
        <AbsoluteFill style={{ translate: `${saiComp}px 0px` }}>
          {COMPROVANTES.map((c, i) => (
            <Comprovante key={i} {...c} />
          ))}
          {frame >= C.naoAqui && (
            <div
              style={{
                position: "absolute",
                top: 700,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                scale: String(0.4 + 0.6 * x),
                opacity: x,
                rotate: "-8deg",
              }}
            >
              <div style={{ padding: "18px 44px", border: `10px solid ${VERMELHO}`, borderRadius: 30, color: VERMELHO, fontFamily: "Manrope", fontWeight: 800, fontSize: 110, background: "rgba(255,255,255,0.85)" }}>
                AQUI NÃO
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}
      {frame >= C.troca && (
        <AbsoluteFill style={{ translate: `${entraCel}px 0px` }}>
          <Pilula texto="Seu celular" top={466} />
          <AbsoluteFill style={{ alignItems: "center", top: 540, clipPath: "inset(-70px -500px -600px -500px)" }}>
            <div style={{ scale: String(zoom), transformOrigin: "50% 360px" }}>
            <PhoneScreen route="/" scale={1.45} showChrome={false} contentClassName="">
              <Sequence from={C.troca} layout="none">
                <TelaBloqueio
                  hora="07:42"
                  data="quinta-feira, 12 de março"
                  notificacoes={[
                    {
                      titulo: `Recebido: ${VALOR} • ${ALUNO} 💰`,
                      corpo: `Parcela de mar/26 (${PAI}). Baixa concluída e recibo enviado!`,
                      chegaEm: C.notif - C.troca,
                    },
                  ]}
                />
              </Sequence>
            </PhoneScreen>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 5. O dinheiro cai na hora                                            */
/* ------------------------------------------------------------------ */
const D = { voa: F + 14, chega: F + 44, taxa: F + 62 };
const Dinheiro: React.FC = () => {
  const frame = useCurrentFrame();
  const pai = useSpring(2);
  const voce = useSpring(8);
  const t = interpolate(frame, [D.voa, D.chega], [0, 1], { ...clamp, easing: ease });
  const chegou = useSpring(D.chega, { damping: 9, mass: 0.6 });
  const taxa = useSpring(D.taxa, { damping: 14, mass: 0.6 });
  const xA = 260;
  const xB = 820;
  const y = 900;
  const coinX = xA + (xB - xA) * t;
  const coinY = y - Math.sin(t * Math.PI) * 260;
  const Bola: React.FC<{ x: number; emoji: string; nome: string; s: number; destaque?: number }> = ({ x, emoji, nome, s, destaque = 0 }) => (
    <div style={{ position: "absolute", left: x - 140, top: y - 140, width: 280, display: "flex", flexDirection: "column", alignItems: "center", opacity: s, scale: String((0.7 + 0.3 * s) * (1 + 0.08 * destaque)) }}>
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 999,
          background: "white",
          boxShadow: destaque ? `0 0 0 ${14 * destaque}px rgba(22,163,74,0.18), 0 24px 50px -20px rgba(11,26,46,0.35)` : "0 24px 50px -20px rgba(11,26,46,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 130,
        }}
      >
        {emoji}
      </div>
      <div style={{ marginTop: 22, fontFamily: "Manrope", fontWeight: 800, fontSize: 48, color: BRAND.navy }}>{nome}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Manchete text="Cai **na hora**" ate={LEN(5)} />
      {/* trilha tracejada */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${xA} ${y} Q ${(xA + xB) / 2} ${y - 520} ${xB} ${y}`} stroke="#bfdbfe" strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" fill="none" />
      </svg>
      <Bola x={xA} emoji="👨" nome="Pai" s={pai} />
      <Bola x={xB} emoji="🚐" nome="Você" s={voce} destaque={chegou} />
      {frame >= D.voa && frame < D.chega + 4 && (
        <div
          style={{
            position: "absolute",
            left: coinX - 70,
            top: coinY - 70,
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "linear-gradient(135deg,#34d399,#059669)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 46,
            boxShadow: "0 16px 30px -10px rgba(5,150,105,0.6)",
          }}
        >
          Pix
        </div>
      )}
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div
          style={{
            padding: "20px 44px",
            borderRadius: 999,
            background: VERDE,
            color: "white",
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: 60,
            opacity: chegou,
            scale: String(0.6 + 0.4 * chegou),
          }}
        >
          ⚡ Caiu na hora
        </div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, color: "#64748b", opacity: taxa, translate: `0px ${(1 - taxa) * 20}px` }}>já com a taxa descontada</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 6. O recibo no WhatsApp do pai, com a marca do motorista             */
/* ------------------------------------------------------------------ */
const R = { chega: F + 8, marca: F + 99 };
const ReciboWhats: React.FC = () => {
  const frame = useCurrentFrame();
  const msg = useSpring(R.chega, { damping: 14, mass: 0.7 });
  const anel = interpolate(frame, [R.marca, R.marca + 10], [0, 1], clamp);
  const pulsa = frame >= R.marca ? 1 + 0.06 * Math.sin((frame - R.marca) / 3) : 1;
  return (
    <AbsoluteFill>
      <Manchete text="Recibo **com a sua marca**" ate={LEN(6)} />
      <Pilula texto="WhatsApp do pai" top={466} cor={{ bg: "#dcfce7", fg: "#15803d" }} />
      <AbsoluteFill style={{ alignItems: "center", top: 548 }}>
        <div style={{ width: 340, scale: String(2.1 * (0.9 + 0.1 * msg)), opacity: msg, transformOrigin: "50% 0%" }}>
          <div className="relative w-full rounded-[22px] bg-[#efeae2] p-2.5 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/assets/whatsapp-wallpaper.png')" }} />
            <div
              className="relative bg-white rounded-[8px] p-1 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21]"
              style={{ fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" }}
            >
              <div style={{ position: "relative" }}>
                <Img src={staticFile("recibos/recibo-davi-marco.png")} style={{ width: "100%", borderRadius: 6, display: "block" }} />
                {/* destaque na marca (logo do motorista) */}
                <div
                  style={{
                    position: "absolute",
                    left: "6.5%",
                    top: "4.9%",
                    width: "16.5%",
                    aspectRatio: "1",
                    borderRadius: 999,
                    border: `3px solid ${BRAND.blue}`,
                    opacity: anel,
                    scale: String(pulsa * (1.3 - 0.3 * anel)),
                  }}
                />
              </div>
              <div className="px-2 pt-1.5 pb-1 text-[12.5px] leading-[17px] space-y-2">
                <p>
                  Olá {PAI}, segue o recibo de pagamento da parcela de Março referente ao transporte escolar de {ALUNO} no valor de {VALOR}.
                </p>
                <p>Agradecemos a pontualidade e a confiança!</p>
                <div className="flex items-end justify-between gap-2 text-[10px] text-[#667781] leading-tight">
                  <span>Mensagem automática via Van360 · Não responda.</span>
                  <span className="shrink-0">07:42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Multa e juros (exemplo do Thiago: 200, multa 20, juros 2% ao dia)  */
/* ------------------------------------------------------------------ */
const M = { escolhe: F + 53, dia11: F + 86, dia12: F + 135, pensa: F + 210, recebe: F + 322 };
const LINHAS = [
  { at: 6, dia: "Dia 10", sub: "Pagou em dia", conta: "sem acréscimo", total: "R$ 200,00", cor: BRAND.navy },
  { at: M.dia11, dia: "Dia 11", sub: "1 dia de atraso", conta: "+ R$ 20 multa + R$ 4 juros", total: "R$ 224,00", cor: VERMELHO },
  { at: M.dia12, dia: "Dia 12", sub: "2 dias de atraso", conta: "+ R$ 20 multa + R$ 8 juros", total: "R$ 228,00", cor: VERMELHO },
];
const MultaJuros: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const topo = useSpring(2, { damping: 14, mass: 0.6 });
  const chips = useSpring(M.escolhe, { damping: 11, mass: 0.6 });
  const pensa = useSpring(M.pensa, { damping: 10, mass: 0.6 });
  const recebe = useSpring(M.recebe, { damping: 11, mass: 0.6 });
  return (
    <AbsoluteFill>
      <Manchete text="Multa e juros? **Você escolhe**" ate={M.pensa} size={70} />
      <Manchete text="Menos **atraso**" de={M.pensa} ate={LEN(7)} />
      {/* a parcela do exemplo */}
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: topo }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34, color: "#64748b" }}>Exemplo: parcela de R$ 200 que vence dia 10</div>
        <div style={{ display: "flex", gap: 18, opacity: chips, scale: String(0.7 + 0.3 * chips) }}>
          {["Multa: R$ 20 (uma vez)", "Juros: 2% ao dia"].map((c) => (
            <div key={c} style={{ padding: "14px 26px", borderRadius: 999, background: "#eef3ff", color: BRAND.blue, fontFamily: "Inter", fontWeight: 800, fontSize: 34 }}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 650, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 16 }}>
        {LINHAS.map((l, i) => {
          const s = spring({ frame: frame - l.at, fps, config: { damping: 12, mass: 0.6 } });
          const ultimo = i === LINHAS.length - 1 && frame >= M.recebe;
          return (
            <div
              key={l.dia}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 34px",
                borderRadius: 32,
                background: ultimo ? "#f0fdf4" : "white",
                border: `3px solid ${ultimo ? "#86efac" : "transparent"}`,
                boxShadow: "0 18px 40px -20px rgba(11,26,46,0.3)",
                opacity: s,
                translate: `${(1 - s) * 90}px 0px`,
                fontFamily: "Manrope",
                scale: ultimo ? String(1 + 0.03 * recebe) : undefined,
              }}
            >
              <div>
                <div style={{ fontSize: 46, fontWeight: 800, color: BRAND.navy }}>{l.dia}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#64748b", fontFamily: "Inter" }}>{l.sub}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: i ? VERMELHO : "#64748b", fontFamily: "Inter", marginTop: 4 }}>{l.conta}</div>
              </div>
              <div style={{ fontSize: 60, fontWeight: 800, color: ultimo ? VERDE : l.cor, letterSpacing: "-0.02em" }}>{l.total}</div>
            </div>
          );
        })}
      </div>
      {frame >= M.pensa && frame < M.recebe && (
        <div style={{ position: "absolute", top: 1320, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: pensa, scale: String(0.6 + 0.4 * pensa) }}>
          <div style={{ padding: "20px 40px", borderRadius: 999, background: "#fff7ed", color: "#c2410c", fontFamily: "Manrope", fontWeight: 800, fontSize: 46 }}>
            🤔 O pai pensa duas vezes
          </div>
        </div>
      )}
      {frame >= M.recebe && (
        <div style={{ position: "absolute", top: 1320, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: recebe, scale: String(0.6 + 0.4 * recebe) }}>
          <div style={{ padding: "20px 40px", borderRadius: 999, background: VERDE, color: "white", fontFamily: "Manrope", fontWeight: 800, fontSize: 46 }}>
            ✓ Você recebe tudo junto
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Confiança                                                         */
/* ------------------------------------------------------------------ */
const K = { conta: F + 99 };
const Confianca: React.FC = () => {
  const frame = useCurrentFrame();
  const escudo = useSpring(2, { damping: 10, mass: 0.7 });
  const cont = useSpring(K.conta, { damping: 14 });
  const numero = Math.round(interpolate(frame, [K.conta, K.conta + 32], [0, 200], { ...clamp, easing: ease }));
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Manchete text="Seguro e **regulado**" ate={LEN(8)} />
      <div style={{ position: "absolute", top: 520, display: "flex", flexDirection: "column", alignItems: "center", opacity: escudo, scale: String(0.5 + 0.5 * escudo) }}>
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 999,
            background: "linear-gradient(135deg,#dbeafe,#eff6ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 150,
            boxShadow: "0 24px 60px -24px rgba(37,99,235,0.6)",
          }}
        >
          🛡️
        </div>
        <div style={{ marginTop: 30, textAlign: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 52, color: BRAND.navy, lineHeight: 1.15 }}>
          Processado por banco
          <br />
          <span style={{ color: BRAND.blue }}>regulado pelo Banco Central</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1090, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Manrope", fontWeight: 800, opacity: cont, translate: `0px ${(1 - cont) * 40}px` }}>
        <div style={{ fontSize: 150, color: BRAND.blue, lineHeight: 1, letterSpacing: "-0.04em" }}>+{numero}</div>
        <div style={{ fontSize: 48, color: BRAND.navy, marginTop: 10 }}>motoristas já usam 🚐</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 9. Fechamento: o secretário com tudo feito                           */
/* ------------------------------------------------------------------ */
const Z = { cobra: F + 50, confere: F + 70, organiza: F + 92 };
const Fechamento: React.FC = () => {
  const logo = useSpring(2, { damping: 14 });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Manchete text="Você dirige." ate={Z.cobra - 6} />
      <Manchete text="A gente **cobra, confere e organiza**." de={Z.cobra - 6} ate={LEN(9) + 999} size={66} />
      <Secretario marcas={[Z.cobra, Z.confere, Z.organiza]} entra={2} top={540} />
      <Img src={staticFile("logo-van360-horizontal.png")} style={{ position: "absolute", top: 1330, width: 380, opacity: logo }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros                                                      */
/* ------------------------------------------------------------------ */
const SFX: SfxEvent[] = [
  // 1
  { at: 2, sfx: "whoosh-soft", volume: 0.6 },
  ...[G.cobra, G.confere, G.recibo].map((m): SfxEvent => ({ at: B[1] + m, sfx: "select", volume: 0.6 })),
  // 2
  { at: B[2], sfx: "whoosh", volume: 0.6 },
  { at: B[2] + 4, sfx: "chime", volume: 0.55 },
  // 3
  { at: B[3], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[3] + L.chega - 2, sfx: "vibra", volume: 0.4 },
  { at: B[3] + L.chega, sfx: "notif", volume: 0.65 },
  { at: B[3] + L.copia, sfx: "tap" },
  { at: B[3] + L.copia + 4, sfx: "pop", volume: 0.6 },
  // 4
  { at: B[4], sfx: "whoosh-soft", volume: 0.5 },
  ...COMPROVANTES.map((c): SfxEvent => ({ at: B[4] + c.at, sfx: "pop", volume: 0.5 })),
  { at: B[4] + C.naoAqui, sfx: "close", volume: 0.8 },
  { at: B[4] + C.troca, sfx: "whoosh", volume: 0.55 },
  { at: B[4] + C.notif - 2, sfx: "vibra", volume: 0.45 },
  { at: B[4] + C.notif, sfx: "notif", volume: 0.75 },
  // 5
  { at: B[5], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[5] + D.voa, sfx: "whoosh", volume: 0.5 },
  { at: B[5] + D.chega, sfx: "success", volume: 0.7 },
  // 6
  { at: B[6], sfx: "whoosh-soft", volume: 0.5 },
  { at: B[6] + R.chega, sfx: "notif", volume: 0.6 },
  { at: B[6] + R.marca, sfx: "pop", volume: 0.6 },
  // 7
  { at: B[7], sfx: "whoosh", volume: 0.5 },
  { at: B[7] + M.escolhe, sfx: "select", volume: 0.6 },
  { at: B[7] + M.dia11, sfx: "pop", volume: 0.6 },
  { at: B[7] + M.dia12, sfx: "pop", volume: 0.6 },
  { at: B[7] + M.pensa, sfx: "pop", volume: 0.5 },
  { at: B[7] + M.recebe, sfx: "success", volume: 0.7 },
  // 8
  { at: B[8], sfx: "whoosh", volume: 0.5 },
  { at: B[8] + K.conta, sfx: "select", volume: 0.5 },
  { at: B[8] + K.conta + 32, sfx: "success", volume: 0.6 },
  // 9
  { at: B[9], sfx: "whoosh", volume: 0.5 },
  ...[Z.cobra, Z.confere, Z.organiza].map((m): SfxEvent => ({ at: B[9] + m, sfx: "select", volume: 0.6 })),
  { at: B[9] + Z.organiza + 14, sfx: "chime", volume: 0.6 },
];

const CENAS: React.FC[] = [Gancho, Virada, Lembrete, Baixa, Dinheiro, ReciboWhats, MultaJuros, Confianca, Fechamento];

export const CobrancaAutomatica: React.FC = () => (
  <BrandBackground>
    {CENAS.map((Comp, i) => {
      const n = i + 1;
      const ultimo = n === CENAS.length;
      return (
        <Sequence key={n} from={B[n]} durationInFrames={LEN(n)} name={`Cena ${n}`}>
          {ultimo ? (
            <AbsoluteFill>
              <Comp />
            </AbsoluteFill>
          ) : (
            <Cena len={LEN(n)}>
              <Comp />
            </Cena>
          )}
        </Sequence>
      );
    })}
    <Narracao pasta="cobranca" beats={BEATS} />
    <Sfx events={SFX} />
  </BrandBackground>
);
