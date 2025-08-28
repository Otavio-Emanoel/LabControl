"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlingGestureHandler = exports.flingHandlerName = exports.flingGestureHandlerProps = void 0;

var _createHandler = _interopRequireDefault(require("./createHandler"));

var _gestureHandlerCommon = require("./gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flingGestureHandlerProps = ['numberOfPointers', 'direction'];
exports.flingGestureHandlerProps = flingGestureHandlerProps;
const flingHandlerName = 'FlingGestureHandler';
/**
 * @deprecated FlingGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Fling()` instead.
 */

exports.flingHandlerName = flingHandlerName;

/**
 * @deprecated FlingGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Fling()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
const FlingGestureHandler = (0, _createHandler.default)({
  name: flingHandlerName,
  allowedProps: [..._gestureHandlerCommon.baseGestureHandlerProps, ...flingGestureHandlerProps],
  config: {}
});
exports.FlingGestureHandler = FlingGestureHandler;
//# sourceMappingURL=FlingGestureHandler.js.map