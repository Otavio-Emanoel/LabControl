import { Debugger } from "debug";
export declare function tailwindCli(debug: Debugger): {
    getCSSForPlatform(options: import("./types").TailwindCliOptions): Promise<string>;
};
export declare function tailwindConfig(path: string): import("tailwindcss/types/config").Config;
