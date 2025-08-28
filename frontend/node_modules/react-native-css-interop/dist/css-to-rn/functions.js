"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hairlineWidth = hairlineWidth;
exports.platformSelect = platformSelect;
exports.pixelScaleSelect = pixelScaleSelect;
exports.fontScaleSelect = fontScaleSelect;
exports.pixelScale = pixelScale;
exports.fontScale = fontScale;
exports.getPixelSizeForLayoutSize = getPixelSizeForLayoutSize;
exports.roundToNearestPixel = roundToNearestPixel;
exports.platformColor = platformColor;
function hairlineWidth() {
    return "hairlineWidth()";
}
function platformSelect(specifics) {
    let output = [];
    for (const [key, value] of Object.entries(specifics)) {
        output.push(`${key}/${value}`);
    }
    return `platformSelect(${output.join(",")})`;
}
function pixelScaleSelect(specifics) {
    let output = [];
    for (const [key, value] of Object.entries(specifics)) {
        output.push(`${key}/${value}`);
    }
    return `pixelScaleSelect(${output.join(",")})`;
}
function fontScaleSelect(specifics) {
    let output = [];
    for (const [key, value] of Object.entries(specifics)) {
        output.push(`${key}/${value}`);
    }
    return `fontScaleSelect(${output.join(",")})`;
}
function pixelScale(value) {
    return value === undefined ? `pixelScale()` : `pixelScale(${value})`;
}
function fontScale(value) {
    return value === undefined ? `fontScale()` : `fontScale(${value})`;
}
function getPixelSizeForLayoutSize(value) {
    return `getPixelSizeForLayoutSize(${value})`;
}
function roundToNearestPixel(value) {
    return `roundToNearestPixel(${value})`;
}
function platformColor(...colors) {
    return `platformColor(${colors
        .map((color) => {
        return color
            .replaceAll("?", "\\?")
            .replaceAll("/", "\\/")
            .replaceAll(":", "\\:");
    })
        .join(",")})`;
}
//# sourceMappingURL=functions.js.map