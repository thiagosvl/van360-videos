/**
 * Reaproveita o tailwind.config.ts do Van360 (cores, raios, fontes, plugins)
 * e só muda duas coisas para vídeo:
 *  - escaneia o src do app + o src deste projeto
 *  - desliga os breakpoints sm/md/lg/xl: o vídeo tem 1080px de largura,
 *    mas as telas devem aparecer sempre no layout mobile.
 */
const path = require("path");
const jiti = require("jiti")(__filename, { interopDefault: true });

const APP_ROOT = path.resolve(__dirname, process.env.VAN360_APP_PATH ?? "../van360");
const appConfig = jiti(path.join(APP_ROOT, "tailwind.config.ts"));

const OFF = "99999px";

module.exports = {
  ...appConfig,
  content: [
    path.join(APP_ROOT, "src/**/*.{ts,tsx}"),
    path.join(__dirname, "src/**/*.{ts,tsx}"),
  ],
  theme: {
    ...appConfig.theme,
    screens: { sm: OFF, md: OFF, lg: OFF, xl: OFF, "2xl": OFF },
  },
};
