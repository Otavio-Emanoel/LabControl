"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNativeWind = withNativeWind;
const path_1 = __importDefault(require("path"));
const debug_1 = require("debug");
const metro_1 = require("react-native-css-interop/metro");
const common_1 = require("./common");
const tailwind_1 = require("./tailwind");
const typescript_1 = require("./typescript");
const debug = (0, debug_1.debug)("nativewind");
function withNativeWind(config, { input, inlineRem = 14, configPath: tailwindConfigPath = "tailwind.config", browserslist = "last 1 version", browserslistEnv = "native", typescriptEnvPath = "nativewind-env.d.ts", disableTypeScriptGeneration = false, ...options } = {}) {
    if (input)
        input = path_1.default.resolve(input);
    debug(`input: ${input}`);
    const { important } = (0, tailwind_1.tailwindConfig)(path_1.default.resolve(tailwindConfigPath));
    debug(`important: ${important}`);
    const cli = (0, tailwind_1.tailwindCli)(debug);
    if (!disableTypeScriptGeneration) {
        debug(`checking TypeScript setup`);
        (0, typescript_1.setupTypeScript)(typescriptEnvPath);
    }
    return (0, metro_1.withCssInterop)(config, {
        ...common_1.cssToReactNativeRuntimeOptions,
        ...options,
        inlineRem,
        selectorPrefix: typeof important === "string" ? important : undefined,
        input,
        parent: {
            name: "nativewind",
            debug: "nativewind",
        },
        getCSSForPlatform: (platform, onChange) => {
            debug(`getCSSForPlatform: ${platform}`);
            return cli.getCSSForPlatform({
                platform,
                input,
                browserslist,
                browserslistEnv,
                onChange,
            });
        },
    });
}
//# sourceMappingURL=index.js.map