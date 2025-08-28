"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailwindCli = tailwindCli;
exports.tailwindConfig = tailwindConfig;
const package_json_1 = __importDefault(require("tailwindcss/package.json"));
const v3_1 = require("./v3");
const isV3 = package_json_1.default.version.split(".")[0].includes("3");
function tailwindCli(debug) {
    if (isV3) {
        return (0, v3_1.tailwindCliV3)(debug);
    }
    throw new Error("NativeWind only supports Tailwind CSS v3");
}
function tailwindConfig(path) {
    if (isV3) {
        return (0, v3_1.tailwindConfigV3)(path);
    }
    else {
        throw new Error("NativeWind only supports Tailwind CSS v3");
    }
}
//# sourceMappingURL=index.js.map