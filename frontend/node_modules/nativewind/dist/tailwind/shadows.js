"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shadows = void 0;
const flattenColorPalette_1 = __importDefault(require("tailwindcss/lib/util/flattenColorPalette"));
const parseBoxShadowValue_1 = require("tailwindcss/lib/util/parseBoxShadowValue");
const toColorValue_1 = __importDefault(require("tailwindcss/lib/util/toColorValue"));
const transformThemeValue_1 = __importDefault(require("tailwindcss/lib/util/transformThemeValue"));
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
exports.shadows = (0, plugin_1.default)(({ matchUtilities, theme, ...rest }) => {
    const { addDefaults } = rest;
    const boxShadowEntries = Object.entries(theme("boxShadow") ?? {});
    function getElevation(value) {
        let elevationKey = boxShadowEntries.find((entry) => entry[1] === value)?.[0];
        let elevation = theme("elevation")?.[elevationKey];
        if (elevation === undefined) {
            elevation = Number.parseFloat(value.split(" ")[2]);
        }
        if (elevation === undefined || Number.isNaN(elevation)) {
            elevation = 0;
        }
        return elevation;
    }
    addDefaults("box-shadow", {
        "--tw-ring-offset-shadow": "0 0 #0000",
        "--tw-ring-shadow": "0 0 #0000",
        "--tw-shadow": "0 0 #0000",
        "--tw-shadow-colored": "0 0 #0000",
    });
    if (process.env.NATIVEWIND_OS === "android") {
        matchUtilities({
            elevation: (value) => {
                return {
                    "-rn-elevation": value,
                };
            },
        }, { values: theme("elevation") });
    }
    matchUtilities({
        shadow: (value) => {
            const elevation = getElevation(value);
            let transformValue = (0, transformThemeValue_1.default)("boxShadow");
            value = transformValue(value);
            let ast = (0, parseBoxShadowValue_1.parseBoxShadowValue)(value);
            const firstValid = ast.find((shadow) => shadow.valid);
            if (!firstValid) {
                return;
            }
            const { x, y, blur, color } = firstValid;
            const shadow = {
                "--tw-shadow-color": value === "none" ? "#0000" : color,
                "-rn-shadow-color": "var(--tw-shadow-color)",
                "@rn-move -rn-shadow-offset-width \\&shadow-offset\\.width": "true",
                "-rn-shadow-offset-width": x,
                "@rn-move -rn-shadow-offset-height \\&shadow-offset\\.height": "true",
                "-rn-shadow-offset-height": y,
                "-rn-shadow-radius": blur ?? 0,
                "-rn-shadow-opacity": 1,
            };
            if (process.env.NATIVEWIND_OS === "android") {
                shadow["-rn-elevation"] = elevation;
            }
            return shadow;
        },
    }, { values: theme("boxShadow"), type: ["shadow"] });
    matchUtilities({
        shadow: (value) => {
            return {
                "--tw-shadow-color": (0, toColorValue_1.default)(value),
            };
        },
    }, {
        values: (0, flattenColorPalette_1.default)(theme("boxShadowColor")),
        type: ["color", "any"],
    });
});
//# sourceMappingURL=shadows.js.map