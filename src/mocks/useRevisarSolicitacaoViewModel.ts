// Mock do view model de "Revisar solicitação": form real sem backend.
// Valores iniciais vêm da solicitação; o vídeo completa (valor, vencimento).
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useVideoState } from "@mocks/videoState";
import { ESCOLAS } from "@mocks/data";

const noop = () => {};

export function useRevisarSolicitacaoViewModel({ prePassageiro }: { prePassageiro: any }) {
  const { revisar = {} } = useVideoState();
  const ano = String(new Date().getFullYear());
  const p = prePassageiro ?? {};

  const form = useForm<Record<string, any>>({
    defaultValues: {
      veiculo_id: "", escola_id: p.escola_id ?? "", periodo: p.periodo ?? "", ano_letivo: ano,
      isento: false, valor_cobranca: "", dia_vencimento: "",
      mes_inicio_cobranca: String(new Date().getMonth() + 1), ano_inicio_cobranca: ano,
      mes_fim_cobranca: "12", ano_fim_cobranca: ano,
      nome: p.nome ?? "", data_nascimento: p.data_nascimento ?? "", genero: p.genero ?? "",
      observacoes: "", nome_responsavel: p.nome_responsavel ?? "",
      parentesco_responsavel: p.parentesco_responsavel ?? "", telefone_responsavel: p.telefone_responsavel ?? "",
      cpf_responsavel: "", email_responsavel: "", notificacoes_rota_habilitadas: true,
      cep: "", logradouro: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "", referencia: "",
      modalidade: p.modalidade ?? "", horario_entrada: "", horario_saida: "", turma: p.turma ?? "",
      sala: "", nome_professor: "", data_inicio_transporte: "", data_fim_transporte: "",
    },
  });

  useEffect(() => {
    for (const [k, v] of Object.entries(revisar)) {
      if (form.getValues(k) !== v) form.setValue(k, v);
    }
  }, [revisar, form]);

  return {
    form,
    escolasList: Object.values(ESCOLAS),
    veiculosList: [{ id: "v1", modelo: "Sprinter", placa: "ABC1D23" }],
    isLoadingEscolas: false,
    isLoadingVeiculos: false,
    isSubmitting: false,
    handleAddNewSchool: noop,
    handleAddNewVehicle: noop,
    handleFillMock: noop,
    onFormError: noop,
    onSubmit: noop,
  } as any;
}
