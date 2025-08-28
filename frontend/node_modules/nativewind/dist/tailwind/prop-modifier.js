"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webPropModifierPlugin = void 0;
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
exports.webPropModifierPlugin = (0, plugin_1.default)(function ({ matchVariant, e }) {
    matchVariant("prop", () => {
        return `&`;
    });
});
//# sourceMappingURL=prop-modifier.js.map