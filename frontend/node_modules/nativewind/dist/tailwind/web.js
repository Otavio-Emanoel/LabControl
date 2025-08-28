"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
const color_1 = require("./color");
const common_1 = require("./common");
const dark_mode_1 = require("./dark-mode");
const prop_modifier_1 = require("./prop-modifier");
const switch_1 = require("./switch");
const verify_1 = require("./verify");
const preset = {
    content: [],
    theme: {
        boxShadow: {
            sm: " 0px 1px 1px rgba(0, 0, 0, 0.35)",
            DEFAULT: "0px 1px 4px rgba(0, 0, 0, 0.35)",
            md: "0px 3px 10px rgba(0, 0, 0, 0.35)",
            lg: "0px 4px 10px rgba(0, 0, 0, 0.35)",
            xl: "0px 6px 19px rgba(0, 0, 0, 0.35)",
            "2xl": "0px 12px 38px rgba(0, 0, 0, 0.35) ",
            none: "0 0 #0000",
        },
        extend: {
            trackColor: common_1.allowedColors,
            thumbColor: common_1.allowedColors,
        },
    },
    plugins: [
        (0, plugin_1.default)(({ addVariant }) => addVariant("web", "&")),
        color_1.color,
        dark_mode_1.darkModeAtRule,
        verify_1.verify,
        prop_modifier_1.webPropModifierPlugin,
        switch_1.webSwitch,
    ],
};
exports.default = preset;
//# sourceMappingURL=web.js.map