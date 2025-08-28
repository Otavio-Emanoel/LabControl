"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPixelSizeForLayoutSize = exports.platformColor = exports.roundToNearestPixel = exports.fontScale = exports.pixelScale = exports.fontScaleSelect = exports.pixelScaleSelect = exports.platformSelect = exports.hairlineWidth = void 0;
const isNative = Boolean(process.env.NATIVEWIND_OS);
_a = isNative
    ? require("react-native-css-interop/css-to-rn/functions")
    : require("react-native-css-interop/css-to-rn/functions-web"), exports.hairlineWidth = _a.hairlineWidth, exports.platformSelect = _a.platformSelect, exports.pixelScaleSelect = _a.pixelScaleSelect, exports.fontScaleSelect = _a.fontScaleSelect, exports.pixelScale = _a.pixelScale, exports.fontScale = _a.fontScale, exports.roundToNearestPixel = _a.roundToNearestPixel, exports.platformColor = _a.platformColor, exports.getPixelSizeForLayoutSize = _a.getPixelSizeForLayoutSize;
//# sourceMappingURL=theme.js.map