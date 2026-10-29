// Mock do hook do formulário do pai: form real (react-hook-form) sem backend.
// Os valores vêm do vídeo (useVideoState().externalForm), campo a campo.
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useVideoState } from "@mocks/videoState";
import { ESCOLAS, MOTORISTA } from "@mocks/data";

const DEFAULTS: Record<string, string> = {
  nome: "", nome_responsavel: "", parentesco_responsavel: "", cpf_responsavel: "",
  telefone_responsavel: "", email_responsavel: "", logradouro: "", numero: "", bairro: "",
  cidade: "", estado: "", cep: "", referencia: "", complemento: "", observacoes: "",
  valor_cobranca: "", dia_vencimento: "", escola_id: "", turma: "", sala: "",
  nome_professor: "", periodo: "", modalidade: "", ano_letivo: String(new Date().getFullYear()),
  data_nascimento: "", genero: "", data_inicio_transporte: "", data_fim_transporte: "",
  horario_entrada: "", horario_saida: "",
};

const noop = () => {};

export function usePassageiroExternalForm() {
  const { externalForm = {} } = useVideoState();
  const form = useForm<Record<string, string>>({ defaultValues: DEFAULTS });

  useEffect(() => {
    for (const [k, v] of Object.entries(externalForm)) {
      if (form.getValues(k) !== v) form.setValue(k, v);
    }
  }, [externalForm, form]);

  return {
    form,
    loading: false,
    motoristaApelido: MOTORISTA.apelido,
    motoristaDisplayName: MOTORISTA.apelido,
    motoristaLogoUrl: null,
    submitting: false,
    success: false,
    openAccordionItems: [],
    setOpenAccordionItems: noop,
    escolasList: Object.values(ESCOLAS),
    handleSubmit: noop,
    onFormError: noop,
    handleNewCadastro: noop,
    handleFillMock: noop,
  } as any;
}
