function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import * as React from 'react';
import GenericTouchable from './GenericTouchable';

/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
const TouchableWithoutFeedback = /*#__PURE__*/React.forwardRef(({
  delayLongPress = 600,
  extraButtonProps = {
    rippleColor: 'transparent',
    exclusive: true
  },
  ...rest
}, ref) => /*#__PURE__*/React.createElement(GenericTouchable, _extends({
  ref: ref,
  delayLongPress: delayLongPress,
  extraButtonProps: extraButtonProps
}, rest)));
export default TouchableWithoutFeedback;
//# sourceMappingURL=TouchableWithoutFeedback.js.map