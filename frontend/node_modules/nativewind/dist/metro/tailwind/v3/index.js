"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailwindCliV3 = void 0;
exports.tailwindConfigV3 = tailwindConfigV3;
const child_process_1 = require("child_process");
const child_file = __dirname + "/child.js";
const getEnv = (options) => {
    return {
        ...process.env,
        NATIVEWIND_INPUT: options.input,
        NATIVEWIND_OS: options.platform,
        NATIVEWIND_WATCH: options.onChange ? "true" : "false",
        BROWSERSLIST: options.browserslist ?? undefined,
        BROWSERSLIST_ENV: options.browserslistEnv ?? undefined,
    };
};
const tailwindCliV3 = function (debug) {
    return {
        getCSSForPlatform(options) {
            debug("Start development Tailwind CLI");
            return new Promise((resolve, reject) => {
                try {
                    const child = (0, child_process_1.fork)(child_file, {
                        stdio: "pipe",
                        env: getEnv(options),
                    });
                    let initialMessage = true;
                    let initialDoneIn = true;
                    child.stderr?.on("data", (data) => {
                        data = data.toString();
                        if (data.includes("Done in")) {
                            if (initialDoneIn) {
                                initialDoneIn = false;
                            }
                        }
                        else if (data.includes("warn -")) {
                            console.warn(data);
                        }
                    });
                    child.stdout?.on("data", (data) => {
                        data = data.toString();
                    });
                    child.on("message", (message) => {
                        if (initialMessage) {
                            resolve(message.toString());
                            initialMessage = false;
                            debug("Finished initial development Tailwind CLI");
                        }
                        else if (options.onChange) {
                            debug("Tailwind CLI detected new styles");
                            options.onChange(message.toString());
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        },
    };
};
exports.tailwindCliV3 = tailwindCliV3;
const flattenPresets = (configs = []) => {
    if (!configs)
        return [];
    return configs.flatMap((config) => [
        config,
        ...flattenPresets(config.presets),
    ]);
};
function tailwindConfigV3(path) {
    const config = require("tailwindcss/loadConfig")(path);
    const hasPreset = flattenPresets(config.presets).some((preset) => {
        return preset.nativewind;
    });
    if (!hasPreset) {
        throw new Error("Tailwind CSS has not been configured with the NativeWind preset");
    }
    return config;
}
//# sourceMappingURL=index.js.map