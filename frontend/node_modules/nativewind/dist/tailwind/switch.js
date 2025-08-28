"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSwitch = exports.nativeSwitch = void 0;
const flattenColorPalette_1 = __importDefault(require("tailwindcss/lib/util/flattenColorPalette"));
const toColorValue_1 = __importDefault(require("tailwindcss/lib/util/toColorValue"));
const withAlphaVariable_1 = __importDefault(require("tailwindcss/lib/util/withAlphaVariable"));
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
exports.nativeSwitch = (0, plugin_1.default)(function ({ matchUtilities, theme }) {
    matchUtilities({
        thumb: (value) => {
            return {
                "&": {
                    "@rn-move caret-color thumbColor": "true",
                    "caret-color": (0, toColorValue_1.default)(value),
                },
            };
        },
    }, {
        values: (0, flattenColorPalette_1.default)(theme("thumbColor")),
        type: ["color", "any"],
    });
});
exports.webSwitch = (0, plugin_1.default)(function ({ matchUtilities, theme, corePlugins, }) {
    matchUtilities({
        thumb: (value) => {
            if (!corePlugins("backgroundOpacity")) {
                return {
                    "& > div:nth-child(2)": {
                        backgroundColor: (0, toColorValue_1.default)(value) + " !important",
                    },
                };
            }
            const output = (0, withAlphaVariable_1.default)({
                color: value,
                property: "background-color",
                variable: "--tw-bg-opacity",
            });
            output["background-color"] += " !important";
            return {
                "& > div:nth-child(2)": output,
            };
        },
    }, {
        values: (0, flattenColorPalette_1.default)(theme("thumbColor")),
        type: ["color", "any"],
    });
});
//# sourceMappingURL=switch.js.map