"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RotationGestureHandler = exports.rotationHandlerName = void 0;

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rotationHandlerName = 'RotationGestureHandler';
/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */

exports.rotationHandlerName = rotationHandlerName;

/**
 * @deprecated RotationGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Rotation()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const RotationGestureHandler = (0, _createHandler.default)({
  name: rotationHandlerName,
  allowedProps: _gestureHandlerCommon.baseGestureHandlerProps,
  config: {}
});
exports.RotationGestureHandler = RotationGestureHandler;
//# sourceMappingURL=RotationGestureHandler.js.map