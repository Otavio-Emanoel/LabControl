"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postcss_1 = require("postcss");
const flattenColorPalette_1 = __importDefault(require("tailwindcss/lib/util/flattenColorPalette"));
const toColorValue_1 = __importDefault(require("tailwindcss/lib/util/toColorValue"));
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
const theme_1 = require("../theme");
const color_1 = require("./color");
const common_1 = require("./common");
const dark_mode_1 = require("./dark-mode");
const safe_area_1 = require("./safe-area");
const shadows_1 = require("./shadows");
const switch_1 = require("./switch");
const translate_1 = require("./translate");
const verify_1 = require("./verify");
const kebabCase = (str) => {
    return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
};
const nativePlugins = (0, plugin_1.default)(function ({ addBase, addUtilities, addVariant, config, matchUtilities, matchVariant, theme, ...other }) {
    const nativePlatforms = ["android", "ios", "windows", "macos"];
    other.addDefaults("transform", {
        "--tw-rotate": "0deg",
        "--tw-skew-x": "0deg",
        "--tw-skew-y": "0deg",
    });
    for (const platform of nativePlatforms) {
        addVariant(platform, `@media (display-mode: ${platform})`);
    }
    addVariant("native", nativePlatforms.map((platform) => `@media (display-mode: ${platform})`));
    config("safelist").push("dark");
    addUtilities({
        ".visible": { opacity: 1 },
        ".invisible": { opacity: 0 },
    });
    matchVariant("{}", (value = "", { modifier, container }) => {
        value = kebabCase(value.replace(/&/, "\\&").replaceAll(".", "\\."));
        if (modifier) {
            modifier = modifier.replace(/&/, "\\&").replaceAll(".", "\\.");
        }
        if (modifier && !value) {
            value = modifier;
            modifier = undefined;
        }
        container.walkRules((rule) => {
            rule.append(new postcss_1.AtRule({
                name: "rn-move",
                params: `${modifier ?? "\\*"} ${value}`,
            }));
        });
        return `&`;
    }, { values: { DEFAULT: undefined } });
    addVariant("selection", (({ container }) => {
        container.walkRules((rule) => {
            rule.append(new postcss_1.AtRule({ name: "rn-move", params: "color selectionColor" }));
        });
        return "&";
    }));
    addVariant("placeholder", (({ container }) => {
        container.walkRules((rule) => {
            rule.append(new postcss_1.AtRule({ name: "rn-move", params: "color placeholderTextColor" }));
        });
        return "&";
    }));
    addUtilities({
        ".pointer-events-none": { "pointer-events": "none" },
        ".pointer-events-auto": { "pointer-events": "auto" },
        ".pointer-events-box-none": { "pointer-events": "box-none" },
        ".pointer-events-box-only": { "pointer-events": "box-only" },
    });
    matchUtilities({
        "line-clamp": (value) => ({
            "&": {
                "@rn-move -rn-number-of-lines number-of-lines": "true",
                overflow: "hidden",
                "-rn-number-of-lines": value,
            },
        }),
    }, { values: theme("lineClamp") });
    matchUtilities({
        elevation: (value) => ({
            "-rn-elevation": value,
        }),
    }, { values: theme("elevation") });
    addUtilities({
        ".line-clamp-none": {
            "&": {
                "@rn-move -rn-number-of-lines number-of-lines": "true",
                overflow: "visible",
                "-rn-number-of-lines": "0",
            },
        },
    });
    matchUtilities({
        ripple: (value) => {
            return {
                "&": {
                    "@rn-move color android_ripple\\.color": "true",
                    color: (0, toColorValue_1.default)(value),
                },
            };
        },
    }, {
        values: (0, flattenColorPalette_1.default)(theme("rippleColor")),
        type: ["color", "any"],
    });
    matchUtilities({
        ripple: (value) => {
            return {
                "&": {
                    "@rn-move -rn-borderless android_ripple\\.borderless": "true",
                    "-rn-borderless": value,
                },
            };
        },
    }, {
        values: {
            borderless: "true",
            bordered: "false",
        },
        type: "any",
    });
    matchUtilities({
        caret: (value) => {
            return {
                "&": {
                    "@rn-move caret-color cursor-color": "true",
                    "caret-color": (0, toColorValue_1.default)(value),
                },
            };
        },
    }, {
        values: (0, flattenColorPalette_1.default)(theme("caretColor")),
        type: ["color", "any"],
    });
    matchUtilities({
        fill: (value) => {
            return {
                "&": {
                    "@rn-move fill": "true",
                    fill: `${(0, toColorValue_1.default)(value)}`,
                },
            };
        },
    }, { values: (0, flattenColorPalette_1.default)(theme("fill")), type: ["color", "any"] });
    matchUtilities({
        stroke: (value) => ({
            "&": {
                "@rn-move stroke": "true",
                stroke: (0, toColorValue_1.default)(value),
            },
        }),
    }, { values: (0, flattenColorPalette_1.default)(theme("stroke")), type: ["color", "any"] });
    matchUtilities({
        stroke: (value) => ({
            "&": {
                "@rn-move stroke-width": "true",
                strokeWidth: (0, toColorValue_1.default)(value),
            },
        }),
    }, { values: theme("strokeWidth"), type: ["length", "number", "percentage"] });
});
const preset = {
    content: [],
    theme: {
        extend: {
            fontFamily: {
                sans: (0, theme_1.platformSelect)({ android: "san-serif", ios: "'system font'" }),
                serif: (0, theme_1.platformSelect)({ android: "serif", ios: "Georgia" }),
                mono: (0, theme_1.platformSelect)({ android: "mono", ios: "'Courier New'" }),
            },
            elevation: {
                sm: "1",
                DEFAULT: "3",
                md: "6",
                lg: "8",
                xl: "13",
                "2xl": "24",
                none: "0",
            },
            boxShadow: {
                sm: " 0px 1px 1px rgba(0, 0, 0, 0.35)",
                DEFAULT: "0px 1px 4px rgba(0, 0, 0, 0.35)",
                md: "0px 3px 10px rgba(0, 0, 0, 0.35)",
                lg: "0px 4px 10px rgba(0, 0, 0, 0.35)",
                xl: "0px 6px 19px rgba(0, 0, 0, 0.35)",
                "2xl": "0px 12px 38px rgba(0, 0, 0, 0.35) ",
                none: "0 0 #0000",
            },
            translateX: ({ theme }) => ({
                ...theme("spacing"),
                "1/2": "50rnw",
                "1/3": "33.333333rnw",
                "2/3": "66.666667rnw",
                "1/4": "25rnw",
                "2/4": "50rnw",
                "3/4": "75rnw",
                full: "100rnw",
            }),
            translateY: ({ theme }) => ({
                ...theme("spacing"),
                "1/2": "50rnh",
                "1/3": "33.333333rnh",
                "2/3": "66.666667rnh",
                "1/4": "25rnh",
                "2/4": "50rnh",
                "3/4": "75rnh",
                full: "100rnh",
            }),
            borderWidth: {
                hairline: (0, theme_1.hairlineWidth)(),
            },
            letterSpacing: {
                tighter: "-0.5px",
                tight: "-0.25px",
                normal: "0px",
                wide: "0.25px",
                wider: "0.5px",
                widest: "1px",
            },
            transitionProperty: {
                DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, perspective, rotate, rotateX, rotateY, rotateZ, scale, scaleX, scaleY, translateX, translateY, skewX, skewY, filter, backdrop-filter",
                all: "background-color, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-width, border-color, border-left-color, border-left-width, border-radius, border-right-color, border-right-width, border-top-color, border-top-width, border-width, color, fill, font-size, font-weight, gap, letter-spacing, line-height, margin, margin-bottom, margin-left, margin-right, margin-top, object-position, opacity, order, padding, padding-bottom, padding-left, padding-right, padding-top, rotate, scale, stroke, text-decoration, text-decoration-color, perspective, rotate, rotateX, rotateY, rotateZ, scale, scaleX, scaleY, translateX, translateY, skewX, skewY, transform-origin, translate, vertical-align, visibility, word-spacing, z-index",
                transform: "perspective, rotate, rotateX, rotateY, rotateZ, scale, scaleX, scaleY, translateX, translateY, skewX, skewY",
            },
            trackColor: common_1.allowedColors,
            thumbColor: common_1.allowedColors,
            rippleColor: common_1.allowedColors,
        },
    },
    plugins: [
        safe_area_1.safeArea,
        color_1.color,
        dark_mode_1.darkModeAtRule,
        shadows_1.shadows,
        translate_1.translateX,
        translate_1.translateY,
        verify_1.verify,
        nativePlugins,
        switch_1.nativeSwitch,
    ],
    corePlugins: {
        preflight: false,
        backgroundOpacity: false,
        borderOpacity: false,
        boxShadow: false,
        caretColor: false,
        divideOpacity: false,
        fill: false,
        placeholderColor: false,
        placeholderOpacity: false,
        lineClamp: false,
        ringOpacity: false,
        stroke: false,
        strokeWidth: false,
        textOpacity: false,
        translate: false,
        pointerEvents: false,
        visibility: false,
    },
};
exports.default = preset;
//# sourceMappingURL=native.js.map