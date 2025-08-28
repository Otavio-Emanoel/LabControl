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
    return 1;
}
function platformSelect(specifics) {
    return specifics["web"] ?? specifics["default"];
}
function pixelScaleSelect(specifics) {
    return specifics[1] ?? specifics["default"];
}
function fontScaleSelect(specifics) {
    return specifics[1] ?? specifics["default"];
}
function pixelScale(value = 1) {
    return value;
}
function fontScale(value = 1) {
    return value;
}
function getPixelSizeForLayoutSize(value) {
    return value;
}
function roundToNearestPixel(value) {
    return value;
}
function platformColor(...colors) {
    return colors;
}
//# sourceMappingURL=functions-web.js.map