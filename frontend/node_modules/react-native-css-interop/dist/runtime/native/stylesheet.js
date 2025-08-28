"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleSheet = void 0;
const globals_1 = require("./globals");
const styles_1 = require("./styles");
exports.StyleSheet = {
    getGlobalStyle(name) {
        return (0, styles_1.getStyle)(name);
    },
    register() {
        throw new Error("Not yet implemented");
    },
    registerCompiled(options) {
        return (0, styles_1.injectData)(options);
    },
    getFlag(name) {
        return globals_1.flags.get(name)?.toString();
    },
};
//# sourceMappingURL=stylesheet.js.map