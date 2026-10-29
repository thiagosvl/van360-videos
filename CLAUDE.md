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

## Mocks (camada de dados)
Ficam em `src/mocks/` e são trocados em `webpack-override.ts` (MOCK_MAP). Tela nova
que quebra no build normalmente precisa de mais um hook mockado ali. Nunca mudar o
código do app para o vídeo funcionar.

## Narração
- Roteiro com uma fala por cena, ~2,5 palavras por segundo.
- O vídeo se ajusta ao áudio: com o áudio em mãos, ajustar `from/duration` dos beats
  e adicionar `<Audio>`.

## Render
```bash
npx remotion still <Id> out/x.png --frame=N   # conferir
npx remotion render <Id> out/<nome>.mp4 --crf=20 --x264-preset=veryfast
```
