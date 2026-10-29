# van360-videos

Vídeos do Van360 feitos com Remotion, usando os **componentes reais** do app.

## Como funciona

- Esta pasta fica **ao lado** do repositório do app:
  ```
  pasta-qualquer/
    van360/          ← repositório do front (thiagosvl/van360)
    van360-videos/   ← este projeto
  ```
  Se o app estiver em outro lugar, rode com `VAN360_APP_PATH=/caminho/do/van360`.
- `@/...` aponta para `van360/src`: as cenas importam `PassageirosList`, `FinancialDashboardCard`, `AppNavbar`, `BottomNavbar`, `WhatsAppMessageContainer` etc. direto do app.
- Só a camada de dados é trocada por mocks (`src/mocks/`): sessão, perfil, Supabase, `useIsMobile`, `useSubscriptionAccess`. Nada no app precisa mudar.
- Os dados fictícios (alunos, escolas, valores) ficam todos em `src/mocks/data.ts`.
- O Tailwind usa o `tailwind.config.ts` do app, com os breakpoints desligados para as telas aparecerem sempre no layout de celular.

## Rodar

```bash
# no app, uma vez (os componentes usam as libs dele)
cd ../van360 && npm install

# aqui
cd ../van360-videos && npm install
npm run dev                     # abre o Remotion Studio para ver/ajustar
npx remotion render Teaser out/teaser.mp4
```

## Estrutura

- `src/components/PhoneScreen.tsx`: celular que roda as telas reais (navbar, menu inferior, safe areas)
- `src/components/brand.tsx`: cores, fontes (Manrope/Inter locais) e título animado
- `src/scenes/`: uma cena por arquivo
- `src/Teaser.tsx`: o vídeo completo (1080x1920, 30fps)

Para um novo tutorial: crie uma cena em `src/scenes/`, coloque a tela real dentro de `<PhoneScreen route="/rota">`, registre em `src/Root.tsx`.
