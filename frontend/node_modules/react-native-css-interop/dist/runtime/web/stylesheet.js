"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleSheet = void 0;
const react_native_1 = require("react-native");
const documentStyle = globalThis.window?.getComputedStyle(globalThis.window?.document.documentElement);
const commonStyleSheet = {
    getFlag(name) {
        return documentStyle?.getPropertyValue(`--css-interop-${name}`);
    },
    unstable_hook_onClassName() { },
    register(_options) {
        throw new Error("Stylesheet.register is not available on web");
    },
    registerCompiled(_options) {
        throw new Error("Stylesheet.registerCompiled is not available on web");
    },
    getGlobalStyle() {
        throw new Error("Stylesheet.getGlobalStyle is not available on web");
    },
};
exports.StyleSheet = Object.assign({}, commonStyleSheet, react_native_1.StyleSheet);
//# sourceMappingURL=stylesheet.js.map