"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJSX = verifyJSX;
exports.verifyFlag = verifyFlag;
exports.verifyData = verifyData;
const computedStyles = globalThis.window
    ? globalThis.window.getComputedStyle(globalThis.window.document.documentElement)
    : { getPropertyValue: () => "asdf" };
function verifyJSX() {
    return <react-native-css-interop-jsx-pragma-check /> === true;
}
function verifyFlag(name, value = "true") {
    return globalThis.window
        ? computedStyles.getPropertyValue(name ? `--css-interop-${name}` : "--css-interop") === value
        : true;
}
function verifyData() {
    return globalThis.window
        ? computedStyles.getPropertyValue("--css-interop") !== ""
        : true;
}
//# sourceMappingURL=doctor.js.map