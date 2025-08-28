import { Debugger } from "debug";
import { TailwindCliOptions } from "../types";
export declare const tailwindCliV3: (debug: Debugger) => {
    getCSSForPlatform(options: TailwindCliOptions): Promise<string>;
};
export declare function tailwindConfigV3(path: string): import("tailwindcss/types/config").Config;
