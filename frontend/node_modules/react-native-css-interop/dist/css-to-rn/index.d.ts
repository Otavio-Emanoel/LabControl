import { CssToReactNativeRuntimeOptions, StyleSheetRegisterCompiledOptions } from "../types";
export type { CssToReactNativeRuntimeOptions };
export declare function cssToReactNativeRuntime(code: Buffer | string, options?: CssToReactNativeRuntimeOptions, debug?: import("debug").Debugger): StyleSheetRegisterCompiledOptions;
