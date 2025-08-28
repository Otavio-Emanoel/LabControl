import type { MetroConfig } from "metro-config";
import { CssToReactNativeRuntimeOptions } from "../types";
export type WithCssInteropOptions = CssToReactNativeRuntimeOptions & {
    input: string;
    forceWriteFileSystem?: boolean;
    getCSSForPlatform: GetCSSForPlatform;
    parent?: {
        name: string;
        debug: string;
    };
};
export type GetCSSForPlatform = (platform: string, onChange?: GetCSSForPlatformOnChange) => Promise<string | Buffer>;
export type GetCSSForPlatformOnChange = (platform: string) => void;
export declare function withCssInterop(config: MetroConfig, options: WithCssInteropOptions): MetroConfig;
export declare function withCssInterop(config: () => Promise<MetroConfig>, options: WithCssInteropOptions): () => Promise<MetroConfig>;
