import path from "path";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import { enableTailwind } from "@remotion/tailwind";
import type { WebpackOverrideFn } from "@remotion/bundler";

/**
 * Liga o projeto de vídeo ao código real do Van360.
 *
 * - "@/..." aponta para o src do app (mesmos componentes, mesmo visual)
 * - Só a camada de dados é trocada por mocks (sessão, perfil, Supabase)
 * - Tailwind usa a mesma config do app, mas sempre em layout mobile
 */
// rode os comandos sempre de dentro da pasta van360-videos
const ROOT = process.cwd();
// caminho do repositório do app (padrão: pasta irmã "van360")
export const APP_ROOT = path.resolve(ROOT, process.env.VAN360_APP_PATH ?? "../van360");
const APP_SRC = path.join(APP_ROOT, "src");
const MOCKS = path.join(ROOT, "src/mocks");

// arquivo do app (regex do caminho resolvido) -> mock local
const MOCK_MAP: Array<[RegExp, string]> = [
  [/src[\\/]hooks[\\/]index\.ts$/, "hooks-barrel.ts"],
  [/src[\\/]hooks[\\/]business[\\/]useSession\.ts$/, "useSession.ts"],
  [/src[\\/]hooks[\\/]business[\\/]useProfile\.ts$/, "useProfile.ts"],
  [/src[\\/]integrations[\\/]supabase[\\/]client\.ts$/, "supabase-client.ts"],
  [/src[\\/]services[\\/]sessionManager\.ts$/, "sessionManager.ts"],
  [/src[\\/]hooks[\\/]ui[\\/]useIsMobile\.tsx?$/, "useIsMobile.ts"],
  [/src[\\/]hooks[\\/]business[\\/]useSubscriptionAccess\.tsx?$/, "useSubscriptionAccess.ts"],
  [/src[\\/]hooks[\\/]api[\\/]useUsuarioResumo\.tsx?$/, "useUsuarioResumo.ts"],
  [/src[\\/]hooks[\\/]business[\\/]useActivityTracker\.tsx?$/, "useActivityTracker.ts"],
  [/src[\\/]hooks[\\/]form[\\/]usePassageiroExternalForm\.tsx?$/, "usePassageiroExternalForm.ts"],
  [/src[\\/]hooks[\\/]ui[\\/]useRevisarSolicitacaoViewModel\.tsx?$/, "useRevisarSolicitacaoViewModel.ts"],
  [/src[\\/]hooks[\\/]ui[\\/]useManualPaymentViewModel\.tsx?$/, "useManualPaymentViewModel.ts"],
  [/src[\\/]hooks[\\/]ui[\\/]useCobrancasViewModel\.tsx?$/, "useCobrancasViewModel.ts"],
  [/src[\\/]hooks[\\/]api[\\/]useMotoristaFinanceiroApi\.tsx?$/, "useMotoristaFinanceiroApi.ts"],
  // embrulham o original: o mock importa "arquivo.tsx?original", que não casa com o $ da regex
  [/src[\\/]components[\\/]common[\\/]DateNavigation\.tsx$/, "DateNavigation.tsx"],
  [/src[\\/]components[\\/]ui[\\/]AppTabNav\.tsx$/, "AppTabNav.tsx"],
  [/src[\\/]utils[\\/]detectPlatform\.ts$/, "detectPlatform.ts"],
  [/src[\\/]hooks[\\/]api[\\/]useRoutes\.ts$/, "useRoutes.ts"],
  [/src[\\/]hooks[\\/]api[\\/]useContratos\.ts$/, "useContratos.ts"],
  [/src[\\/]hooks[\\/]api[\\/]useReciboAnual\.ts$/, "useReciboAnual.ts"],
  [/src[\\/]components[\\/]common[\\/]SignaturePad\.tsx$/, "SignaturePad.tsx"],
  [/src[\\/]hooks[\\/]api[\\/]useRenovacoes\.ts$/, "useRenovacoes.ts"],
  [/src[\\/]hooks[\\/]ui[\\/]useRenovacoesViewModel\.ts$/, "useRenovacoesViewModel.ts"],
];

export const webpackOverride: WebpackOverrideFn = (current) => {
  const config = enableTailwind(current, {
    configLocation: path.join(ROOT, "tailwind.config.js"),
  });

  return {
    ...config,
    resolve: {
      ...config.resolve,
      // pacotes do app (router, react-query, lucide...) vêm do node_modules dele
      modules: [
        path.join(ROOT, "node_modules"),
        path.join(APP_ROOT, "node_modules"),
        "node_modules",
      ],
      alias: {
        ...(config.resolve?.alias as Record<string, string>),
        "@": APP_SRC,
        // mocks importam uns aos outros por aqui (eles "moram" na pasta do app)
        "@mocks": MOCKS,
        // diálogos e gavetas do app abrem dentro do celular, não no <body>
        "@radix-ui/react-portal$": path.join(MOCKS, "portal.tsx"),
        // páginas do contrato como imagem (o PDF de verdade, gerado pelo back-end)
        "react-pdf$": path.join(MOCKS, "react-pdf.tsx"),
        // formulário de gasto preenchido pelo vídeo (mocks/react-hook-form.ts)
        "react-hook-form$": path.join(MOCKS, "react-hook-form.ts"),
        "react-hook-form-original$": path.join(APP_ROOT, "node_modules/react-hook-form/dist/index.esm.mjs"),
        // uma única cópia do React para o app e para o Remotion
        react: path.join(ROOT, "node_modules/react"),
        "react-dom": path.join(ROOT, "node_modules/react-dom"),
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      ...MOCK_MAP.map(
        ([pattern, file]) =>
          new webpack.NormalModuleReplacementPlugin(pattern, (resource) => {
            const target = path.join(MOCKS, file);
            if (resource.createData?.resource) {
              resource.createData.resource = target;
            } else {
              resource.request = target;
            }
          }),
      ),
      // o app usa import.meta.env (Vite)
      new webpack.DefinePlugin({
        "import.meta.env": JSON.stringify({
          MODE: "production",
          DEV: false,
          PROD: true,
          VITE_SUPABASE_URL: "https://mock.supabase.co",
          VITE_SUPABASE_ANON_KEY: "mock",
          VITE_API_URL: "https://mock.local",
        }),
      }),
      // o app referencia "/assets/..." direto (ex.: wallpaper do WhatsApp)
      new CopyPlugin({
        patterns: [{ from: path.join(APP_ROOT, "public/assets"), to: "assets" }],
      }),
    ],
  };
};
