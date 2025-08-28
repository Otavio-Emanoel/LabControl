import type { MetroConfig } from "metro-config";
import { WithCssInteropOptions } from "react-native-css-interop/metro";
interface WithNativeWindOptions extends WithCssInteropOptions {
    input: string;
    projectRoot?: string;
    outputDir?: string;
    configPath?: string;
    cliCommand?: string;
    browserslist?: string | null;
    browserslistEnv?: string | null;
    typescriptEnvPath?: string;
    disableTypeScriptGeneration?: boolean;
}
export declare function withNativeWind(config: MetroConfig, { input, inlineRem, configPath: tailwindConfigPath, browserslist, browserslistEnv, typescriptEnvPath, disableTypeScriptGeneration, ...options }?: WithNativeWindOptions): MetroConfig;
export {};
