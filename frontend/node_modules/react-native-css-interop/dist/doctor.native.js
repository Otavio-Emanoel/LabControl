"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJSX = verifyJSX;
exports.verifyData = verifyData;
exports.verifyFlag = verifyFlag;
const globals_1 = require("./runtime/native/globals");
function verifyJSX() {
    return <react-native-css-interop-jsx-pragma-check /> === true;
}
function verifyData() {
    if (process.env.NODE_ENV !== "test") {
        if (require("./interop-poison.pill") === false) {
            throw new Error(`Your 'metro.config.js' has overridden the 'config.resolver.resolveRequest' config setting in a non-composable manner. Your styles will not work until this issue is resolved. Note that 'require('metro-config').mergeConfig' is a shallow merge and does not compose existing resolveRequest functions together.`);
        }
    }
    return globals_1.flags.has("enabled");
}
function verifyFlag(name, value = "true") {
    return globals_1.flags.get(name) === value;
}
//# sourceMappingURL=doctor.native.js.map