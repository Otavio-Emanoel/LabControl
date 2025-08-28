function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { forwardRef, useEffect, useRef } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
export const Text = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    onPress,
    onLongPress,
    ...rest
  } = props;
  const textRef = useRef(null);
  const native = Gesture.Native().runOnJS(true);

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
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const textElement = ref ? ref.current : textRef.current; // At this point we are sure that textElement is div in HTML tree

    textElement === null || textElement === void 0 ? void 0 : textElement.setAttribute('rnghtext', 'true');
  }, []);
  return onPress || onLongPress ? /*#__PURE__*/React.createElement(GestureDetector, {
    gesture: native
  }, /*#__PURE__*/React.createElement(RNText, _extends({
    onPress: onPress,
    onLongPress: onLongPress,
    ref: refHandler
  }, rest))) : /*#__PURE__*/React.createElement(RNText, _extends({
    ref: ref
  }, rest));
}); // eslint-disable-next-line @typescript-eslint/no-redeclare
//# sourceMappingURL=Text.js.map