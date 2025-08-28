"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
const common_1 = require("./common");
exports.verify = (0, plugin_1.default)(function ({ addBase }) {
    if (common_1.isWeb) {
        addBase({
            ":root": {
                "--css-interop": "true",
                "--css-interop-nativewind": "true",
            },
        });
    }
    else {
        addBase({ "@cssInterop set nativewind": "true" });
    }
});
//# sourceMappingURL=verify.js.map