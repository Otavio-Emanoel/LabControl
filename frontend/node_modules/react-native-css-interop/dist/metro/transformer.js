"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = transform;
const path_1 = __importDefault(require("path"));
const metro_transform_worker_1 = __importDefault(require("metro-transform-worker"));
async function transform(config, projectRoot, filename, data, options) {
    const transform = config.cssInterop_transformerPath
        ? require(config.cssInterop_transformerPath).transform
        : metro_transform_worker_1.default.transform;
    if (path_1.default.dirname(filename) !== config.cssInterop_outputDirectory ||
        filename.endsWith(".css")) {
        return transform(config, projectRoot, filename, data, options);
    }
    const fakeFile = `import { injectData } from "react-native-css-interop/dist/runtime/native/styles";injectData({});`;
    const result = await transform(config, projectRoot, filename, Buffer.from(fakeFile), options);
    const output = result.output[0];
    const code = output.data.code.replace("({})", data.toString("utf-8"));
    return {
        ...result,
        output: [
            {
                ...output,
                data: {
                    ...output.data,
                    code,
                },
            },
        ],
    };
}
//# sourceMappingURL=transformer.js.map