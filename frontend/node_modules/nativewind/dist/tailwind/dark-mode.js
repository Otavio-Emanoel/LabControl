"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.darkModeAtRule = void 0;
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
const common_1 = require("./common");
exports.darkModeAtRule = (0, plugin_1.default)(function ({ config, addBase }) {
    const darkMode = config("darkMode");
    let type = "media";
    let value;
    if (darkMode === "media" || !darkMode) {
        type = "media";
    }
    else if (darkMode === "class") {
        type = "class";
        value = "dark";
    }
    else if (darkMode[0] === "class") {
        type = "class";
        value = darkMode[1];
        if (!value) {
            return;
        }
        if (value.startsWith("[") && value.endsWith("]")) {
            type = "attribute";
            value = value.slice(1, -1);
        }
        else if (value.startsWith(".")) {
            value = value.slice(1);
        }
    }
    if (common_1.isWeb) {
        addBase({
            ":root": {
                "--css-interop-darkMode": [type, value].filter(Boolean).join(" "),
            },
        });
    }
    else {
        const atRule = ["@cssInterop set darkMode", type, value]
            .filter(Boolean)
            .join(" ");
        addBase({ [atRule]: "" });
    }
});
//# sourceMappingURL=dark-mode.js.map