import React from "react";

/**
 * Mensagem automática do Van360 no WhatsApp, fiel aos modelos aprovados
 * no WhatsApp Manager (WABA). Mesmo visual do WhatsAppMessageContainer do app,
 * mas com o rodapé real do modelo: "Mensagem automática via Van360 · Não responda."
 *
 * Textos dos modelos ficam em WABA_MODELOS (copiados do WhatsApp Manager).
 */
export const WABA_MODELOS = {
  /** van360_pais_*_pix: parcela vence hoje */
  venceHoje: (p: { responsavel: string; aluno: string; valor: string }) => (
    <>
      <p>
        Olá {p.responsavel}, a parcela do transporte escolar de {p.aluno} no valor de {p.valor} vence <b>HOJE</b>.
      </p>
      <p>Por favor, efetue o pagamento para manter o transporte em dia.</p>
      <p className="italic">Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.</p>
    </>
  ),
  /** van360_pais_atrasado_pix: parcela em atraso */
  atrasado: (p: { responsavel: string; aluno: string; mes: string; valor: string }) => (
    <>
      <p>
        Olá {p.responsavel}, identificamos que a parcela do transporte escolar de {p.aluno} referente ao mês de {p.mes} está
        em atraso no valor de {p.valor}.
      </p>
      <p>Por favor, efetue o pagamento para manter o transporte em dia.</p>
      <p className="italic">Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.</p>
    </>
  ),
  /** van360_pais_contrato: contrato pronto para assinar (botão "Assinar Contrato") */
  contrato: (p: { responsavel: string; aluno: string }) => (
    <>
      <p>
        Olá {p.responsavel}, o contrato de prestação de serviços de transporte escolar de {p.aluno} já está pronto para
        assinatura digital.
      </p>
      <p>A assinatura é rápida, feita pelo celular e garante a vaga e a segurança do transporte.</p>
    </>
  ),
};

/** Botão de link do modelo (ícone de "abrir fora" do WhatsApp). */
export const BotaoLink: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="border-t border-[#e9edef] py-2.5 flex items-center justify-center gap-2 text-[#00a884] text-[13px]">
    <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#00a884] fill-none stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
    {texto}
  </div>
);

export const WabaMessage: React.FC<{
  motorista: string;
  hora: string;
  comPix?: boolean;
  /** botão do modelo no lugar do Pix (ex.: <BotaoLink texto="Assinar Contrato" />) */
  botao?: React.ReactNode;
  children: React.ReactNode;
}> = ({ motorista, hora, comPix = true, botao, children }) => (
  <div className="relative w-full rounded-[24px] bg-[#efeae2] p-3 border border-[#e5e5e5] shadow-inner overflow-hidden">
    <div
      className="absolute inset-0 pointer-events-none bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/whatsapp-wallpaper.png')" }}
    />
    <div
      className="relative max-w-[276px] bg-white rounded-r-[7.5px] rounded-b-[7.5px] rounded-tl-none shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21] ml-1.5"
      style={{ fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" }}
    >
      <svg viewBox="0 0 8 13" height="13" width="8" className="absolute -left-2 top-0 pointer-events-none">
        <path opacity="0.13" fill="#000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
        <path fill="#ffffff" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
      </svg>
      <div className="px-3 pt-2 pb-1.5 space-y-2">
        <p className="font-bold text-[13px] leading-tight">Transporte Escolar · {motorista}</p>
        <div className="space-y-2 text-[12.5px] leading-[17px]">{children}</div>
        <div className="flex items-end justify-between gap-2 pt-0.5 text-[10px] text-[#667781] leading-tight">
          <span>Mensagem automática via Van360 · Não responda.</span>
          <span className="shrink-0">{hora}</span>
        </div>
      </div>
      {botao}
      {!botao && comPix && (
        <div className="border-t border-[#e9edef] py-2.5 flex items-center justify-center gap-2 text-[#00a884] text-[13px]">
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#00a884] fill-none stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar código Pix
        </div>
      )}
    </div>
  </div>
);
