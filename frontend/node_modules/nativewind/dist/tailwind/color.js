"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = void 0;
const flattenColorPalette_1 = __importDefault(require("tailwindcss/lib/util/flattenColorPalette"));
const toColorValue_1 = __importDefault(require("tailwindcss/lib/util/toColorValue"));
const withAlphaVariable_1 = __importDefault(require("tailwindcss/lib/util/withAlphaVariable"));
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
exports.color = (0, plugin_1.default)(function ({ matchUtilities, corePlugins, theme }) {
    matchUtilities({
        color: (value) => {
            if (!corePlugins("textOpacity")) {
                return { color: (0, toColorValue_1.default)(value) };
            }
            return (0, withAlphaVariable_1.default)({
                color: value,
                property: "color",
                variable: "--tw-text-opacity",
            });
        },
    }, { values: (0, flattenColorPalette_1.default)(theme("textColor")), type: ["color", "any"] });
});
//# sourceMappingURL=color.js.map