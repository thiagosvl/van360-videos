import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.overrideWebpackConfig(webpackOverride);

// Neste ambiente o Chrome do Remotion não baixa; usa o headless shell local.
// Na sua máquina, apague esta linha que o Remotion baixa o dele.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
