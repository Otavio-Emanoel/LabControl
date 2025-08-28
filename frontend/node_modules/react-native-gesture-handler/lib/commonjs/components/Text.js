"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Text = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _gestureObjects = require("../handlers/gestures/gestureObjects");

var _GestureDetector = require("../handlers/gestures/GestureDetector");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const Text = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    onPress,
    onLongPress,
    ...rest
  } = props;
  const textRef = (0, _react.useRef)(null);

  const native = _gestureObjects.GestureObjects.Native().runOnJS(true);

  const refHandler = node => {
    textRef.current = node;

    if (ref === null) {
      return;
    }

    if (typeof ref === 'function') {
      ref(node);
    } else {
      ref.current = node;
    }
  }; // This is a special case for `Text` component. After https://github.com/software-mansion/react-native-gesture-handler/pull/3379 we check for
  // `displayName` field. However, `Text` from RN has this field set to `Text`, but is also present in `RNSVGElements` set.
  // We don't want to treat our `Text` as the one from `SVG`, therefore we add special field to ref.


  refHandler.rngh = true;
  (0, _react.useEffect)(() => {
    if (_reactNative.Platform.OS !== 'web') {
      return;
    }

    const textElement = ref ? ref.current : textRef.current; // At this point we are sure that textElement is div in HTML tree

    textElement === null || textElement === void 0 ? void 0 : textElement.setAttribute('rnghtext', 'true');
  }, []);
  return onPress || onLongPress ? /*#__PURE__*/_react.default.createElement(_GestureDetector.GestureDetector, {
    gesture: native
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, _extends({
    onPress: onPress,
    onLongPress: onLongPress,
    ref: refHandler
  }, rest))) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, _extends({
    ref: ref
  }, rest));
}); // eslint-disable-next-line @typescript-eslint/no-redeclare

exports.Text = Text;
//# sourceMappingURL=Text.js.map