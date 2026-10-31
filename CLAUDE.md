# Guia de estilo dos vídeos Van360

Leia antes de criar ou mudar qualquer vídeo deste projeto.

## Público e tom
- Motoristas de transporte escolar, 35 a 55 anos, não técnicos, no celular.
- Vender benefício, não ensinar botão. Frases curtas, tom de conversa ("você"), nada de jargão.
- Proibido: travessão (—), a palavra "caderninho", promessas que o app não cumpre.
- Termos do app: "Desativar" (não "inativar"), "Solicitações", "Parcelas", "Carteirinha Digital".
- Confirmar com o Thiago qualquer afirmação de funcionalidade que não esteja clara no código.

## Formatos
- Vertical 1080x1920, 30fps. Máximo de 1 minuto.
- **Tutorial** (Video Commerce, LP, Instagram): 30 a 45s, uma funcionalidade por vídeo,
  falas curtas por cena, dedo tocando na tela, legenda sempre. Sem CTA no fim (o player
  do app já tem o botão); só o logo discreto.
- **Venda/anúncio**: gancho nos 2 primeiros segundos, 3 ou 4 benefícios gerais
  (sem detalhar a tela), fechamento com slogan "Você dirige. A gente organiza." e CTA.

## Capa (obrigatória em todo vídeo, aplicada no próprio MP4)
- Todo vídeo novo ou refeito é ENTREGUE COM A CAPA NO PRIMEIRO QUADRO (0,5s), para o WhatsApp/Instagram
  usar como miniatura. Nunca entregar o vídeo sem a capa aplicada; o PNG avulso vai junto.
- Componente `CapaVideo` (src/components/CapaVideo.tsx). Tudo é configurável e muda a cada vídeo:
  `quadro` (qual tela do vídeo aparece no celular), `titulo` (`**palavra**` em azul),
  `botao` (texto, padrão "Veja como funciona"), `icone` (padrão ▶; null tira) e `subtitulo` (ex.: "Em 47 segundos").
- Registrar no Root, pasta "Finais", com `capa("<Nome>", DURACAO, { Video, quadro, titulo, botao, icone, subtitulo })`.
  Isso cria `Capa<Nome>` (PNG) e `<Nome>Final` (vídeo com a capa na frente, = o que se entrega).
- Quadro: uma tela real cheia e bonita do próprio vídeo, sem troca de celular nem dedo no meio de um movimento. Título vende benefício (até ~6 palavras).
- Gerar: `npx remotion still Capa<Nome> out/capa-<nome>.png` e `npx remotion render <Nome>Final out/<nome>.mp4 ...`
  (+ normalizar o áudio). Conferir o PNG antes de entregar.

## Áreas seguras (player de stories do app)
- Topo (até ~200px): barra de progresso, título e botões. Nada importante.
- Faixa inferior (~440px): gradiente escuro com o botão do player. Nada importante.
- Legenda: faixa 230 a 450px (`<Caption>`). Celular a partir de ~470 a 540px.

## Visual
- Fundo claro com brilho azul (`BrandBackground`), cores e fontes em `src/components/brand.tsx`
  (navy #0b1a2e, azul #2563eb, Manrope nos títulos, Inter no corpo).
- Palavra-chave da fala em azul: `**palavra**` no texto do beat.
- Rótulo acima do celular quando troca de aparelho: "Seu celular", "Celular do pai", "Seu WhatsApp".

## Como montar um tutorial
1. Escrever o roteiro como `BEATS` (texto + from + duration) no topo do arquivo em
   `src/tutoriais/`. As ações da tela usam os tempos dos beats (`B[n]`), assim a
   narração gravada depois só ajusta `from/duration`.
2. Usar telas REAIS do app dentro de `<PhoneScreen route="...">`. Dados fictícios em
   `src/mocks/data.ts`.
3. Toques com `<Finger steps=[...]>` no `overlay` do PhoneScreen (coordenadas em px
   do celular 390x844). Conferir posição renderizando stills.
4. Diálogos e gavetas do app abrem dentro do celular (portal mockado). Coloque-os no
   `overlay`, não no conteúdo.
5. Formulários: valores controlados pelo vídeo via `VideoStateProvider`
   (`externalForm`, `revisar`).
6. Registrar em `src/Root.tsx`, renderizar stills de cada beat, conferir, renderizar MP4.

## Relógio fixo
"Hoje" no vídeo é sempre 12/03/2026 (`src/clock.ts`). Vencimentos, atrasos, "há 2 min"
e mês atual dependem disso; monte os dados fictícios em cima dessa data.
Um vídeo pode usar outra data com `usarHoje("...")` no corpo da composição (a Renovação usa 10/12/2026).
Telas que leem `window.innerWidth` (ex.: Menu): `usarLarguraDeCelular()` (src/viewport.ts).

## Diálogos com estado interno
Para tocar/escolher/digitar de verdade (useState do app), use `<AcoesNaTela passos=[...]>`
com a mesma `key` do diálogo (o passo atual). Barras e rodapés `fixed` da página ficam presos
ao fim da página no vídeo: renderize a versão real no `overlay`.

## Mensagens do WhatsApp
Textos dos modelos reais (WhatsApp Manager) ficam em `src/components/WabaMessage.tsx`.
Nunca inventar texto de mensagem automática: usar os modelos ou pedir print ao Thiago.
Nunca mostrar duas mensagens automáticas diferentes na mesma conversa.

## Mocks (camada de dados)
Ficam em `src/mocks/` e são trocados em `webpack-override.ts` (MOCK_MAP). Tela nova
que quebra no build normalmente precisa de mais um hook mockado ali. Nunca mudar o
código do app para o vídeo funcionar.

## Narração
- Roteiro com uma fala por cena, ~2,5 palavras por segundo.
- O vídeo se ajusta ao áudio: com o áudio em mãos, ajustar `from/duration` dos beats
  e adicionar `<Audio>`.
- Geração pelo conector ElevenLabs (`creative_generate_speech`, modelo `eleven_v4`, 1 geração por fala).
  Voz clonada do Thiago: "Thiago (Eu)" `iMAOSIdjlzAHq5LIP44Z`. Alternativa de locutor: "Gabriel"
  `WPgqgCVa3mD38JuyODU6`. Baixar o MP3 (storage.googleapis.com liberado) para `public/narracao/<video>/`.
- No tutorial: `<Narracao pasta="<video>" beats={BEATS} />` (fala N começa 6 frames depois do beat N).
- **SEM BURACOS DE VOZ (regra do Thiago):** nunca deixar 1s ou mais de silêncio entre as falas.
  - Ao montar, `duration` de cada beat = 6 + duração da fala em quadros + no máximo ~12 quadros.
  - Se a tela precisa de mais tempo (digitação, formulário, animação), NÃO esticar o beat calado:
    alongar a fala com o que aparece na tela ou acrescentar uma frase curta (beat extra).
  - Antes de entregar, rodar `bash scripts/checa-silencio.sh out/<video>.mp4` (falha com pausa >= 0,9s;
    só o fim com o logo é livre). Corrigir e renderizar de novo até passar.
- A Apresentação (`ApresentacaoApp`) já tem narração na voz do Thiago (`public/narracao/fala-*.mp3`).

## Efeitos sonoros
- Biblioteca em `public/sfx` (Kenney CC0 + sintetizados), gerada por `scripts/build_sfx.py`.
- No tutorial: lista `SFX: SfxEvent[]` derivada dos mesmos tempos das ações (toques, aberturas,
  notificações, trocas de celular) + `<Sfx events={SFX} />`. Ver TutorialRotas como modelo.
- Todo toque do dedo tem "tap"; toda troca de celular tem "whoosh"; notificação = "vibra" + "notif".
- Rolagem de tela não tem som (o Thiago não gostou).
- Depois do render, normalizar: `ffmpeg -i in.mp4 -c:v copy -af "alimiter=limit=0.89:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k out.mp4`.
- Depois de "Salvar", nunca deixar o celular vazio: manter a tela e mostrar o toast real do app.
- Close/destaque: tela com muitos campos ganha zoom de câmera no bloco principal (ver ZOOM em TutorialContratos: recorte abaixo da legenda, entra e sai em 12 quadros, whoosh-soft).
- Depois de uma ação que muda números (pagar, salvar), voltar a lista ao topo para o painel aparecer inteiro atualizando.
- Navegação fluida: diálogo/recibo só fecha com o dedo indo até o X (ou botão) e tocando; toque em aba sempre no CENTRO do rótulo (conferir com still no quadro do toque).

## Status dos tutoriais (out/2026)
Com narração (voz Thiago), efeitos e capa: TutorialRotas (RotasFinal), TutorialAlunosLista (AlunosListaFinal),
TutorialAlunosSolicitacoes (AlunosSolicitacoesFinal), TutorialCarteirinha (CarteirinhaFinal),
TutorialContratos (ContratosFinal), TutorialGastos (GastosFinal), TutorialRelatorios (RelatoriosFinal),
TutorialParcelas (ParcelasFinal).
Prontos sem áudio, a refazer um por um COM narração (o Thiago assiste e pede ajustes):
TutorialIndicacao, TutorialRenovacao.
- Apresentação: a cena de rotas usa ChamadaEscolaDialog; o certo seria a "Chamada de Embarque" (ChamadaRapidaDialog).

## Contratos
- PDF do contrato gerado com o código real do back-end (`node scripts/gerar-contrato.mjs`):
  páginas viram imagens em `public/contratos/` e o `react-pdf` é trocado por um mock que mostra essas imagens.
- Assinaturas desenhadas (traço único) em `src/mocks/assinaturas.json`; o quadro de assinatura
  (`SignaturePad`) é controlado por `VideoState.assinatura` (editando, progresso).
- Telas com aba em estado interno (ex.: modelo de contrato): `VideoState.abaForcada`.
- Páginas "tela cheia" (h-screen): `contentClassName="tela-cheia"`.

## Render
```bash
bash scripts/stills.sh <Id> 100 200 300          # vários stills com um único bundle
python3 scripts/montagem.py out/st/m.png a.png b.png  # junta stills para conferir
npx remotion still <Id> out/x.png --frame=N   # conferir
npx remotion render <Id> out/<nome>.mp4 --crf=20 --x264-preset=veryfast
```

## Imagens das lojas (App Store / Play Store)
- Slides em `src/loja/Loja.tsx` (lista `SLIDES_LOJA`), peças visuais em `src/loja/base.tsx`,
  telas do app em `src/loja/telas.tsx`. Registrados como `<Still>` em `ios-<id>` (1290x2796,
  os 10) e `android-<id>` (1080x1920, os marcados `android: true`, máx. 8; o 8º leva o selo).
- Medidas em "u" (1u = 1px numa largura de 1290): o mesmo slide serve aos dois tamanhos,
  o Android só corta embaixo. Nada importante abaixo de ~2200u.
- Fundo navy, título branco com destaque âmbar (#FFB300), celular com tela real, e
  cartões `Destaque` para ampliar o que importa. Título vende benefício, não botão.
- Gerar: `bash scripts/render-loja.sh` (ou passe o id de um slide). Saída em `out/loja/`.
