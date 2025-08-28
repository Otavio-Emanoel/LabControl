"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeb = exports.allowedColors = void 0;
const denyColors = new Set([
    "lightBlue",
    "warmGray",
    "trueGray",
    "coolGray",
    "blueGray",
]);
const allowedColors = ({ colors }) => {
    const _colors = {};
    for (const color of Object.keys(colors)) {
        if (denyColors.has(color)) {
            continue;
        }
        _colors[color] = colors[color];
    }
    return _colors;
};
exports.allowedColors = allowedColors;
exports.isWeb = process.env.NATIVEWIND_OS === undefined ||
    process.env.NATIVEWIND_OS === "web";
//# sourceMappingURL=common.js.map