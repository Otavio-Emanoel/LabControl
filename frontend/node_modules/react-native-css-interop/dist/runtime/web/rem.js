"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rem = exports._rem = void 0;
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
const isSSR = globalThis.window === undefined;
exports._rem = (0, observable_1.observable)(isSSR
    ? 16
    : Number.parseFloat(globalThis.window.getComputedStyle(globalThis.window.document.documentElement).fontSize) || 16);
exports.rem = {
    get(effect) {
        return exports._rem.get(effect);
    },
    set(value) {
        exports._rem.set(value);
        if (!isSSR) {
            globalThis.window.document.documentElement.style.fontSize = `${value}px`;
        }
    },
    [shared_1.INTERNAL_RESET](value = 16) {
        exports._rem.set(value);
    },
};
//# sourceMappingURL=rem.js.map