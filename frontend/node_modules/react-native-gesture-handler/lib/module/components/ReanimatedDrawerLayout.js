// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { StyleSheet, Keyboard, StatusBar, I18nManager, Platform } from 'react-native';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import { MouseButton } from '../handlers/gestureHandlerCommon';
const DRAG_TOSS = 0.05;
export let DrawerPosition;

(function (DrawerPosition) {
  DrawerPosition[DrawerPosition["LEFT"] = 0] = "LEFT";
  DrawerPosition[DrawerPosition["RIGHT"] = 1] = "RIGHT";
})(DrawerPosition || (DrawerPosition = {}));

export let DrawerState;

(function (DrawerState) {
  DrawerState[DrawerState["IDLE"] = 0] = "IDLE";
  DrawerState[DrawerState["DRAGGING"] = 1] = "DRAGGING";
  DrawerState[DrawerState["SETTLING"] = 2] = "SETTLING";
})(DrawerState || (DrawerState = {}));

export let DrawerType;

(function (DrawerType) {
  DrawerType[DrawerType["FRONT"] = 0] = "FRONT";
  DrawerType[DrawerType["BACK"] = 1] = "BACK";
  DrawerType[DrawerType["SLIDE"] = 2] = "SLIDE";
})(DrawerType || (DrawerType = {}));

export let DrawerLockMode;

(function (DrawerLockMode) {
  DrawerLockMode[DrawerLockMode["UNLOCKED"] = 0] = "UNLOCKED";
  DrawerLockMode[DrawerLockMode["LOCKED_CLOSED"] = 1] = "LOCKED_CLOSED";
  DrawerLockMode[DrawerLockMode["LOCKED_OPEN"] = 2] = "LOCKED_OPEN";
})(DrawerLockMode || (DrawerLockMode = {}));

export let DrawerKeyboardDismissMode;

(function (DrawerKeyboardDismissMode) {
  DrawerKeyboardDismissMode[DrawerKeyboardDismissMode["NONE"] = 0] = "NONE";
  DrawerKeyboardDismissMode[DrawerKeyboardDismissMode["ON_DRAG"] = 1] = "ON_DRAG";
})(DrawerKeyboardDismissMode || (DrawerKeyboardDismissMode = {}));

const defaultProps = {
  drawerWidth: 200,
  drawerPosition: DrawerPosition.LEFT,
  drawerType: DrawerType.FRONT,
  edgeWidth: 20,
  minSwipeDistance: 3,
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  drawerLockMode: DrawerLockMode.UNLOCKED,
  enableTrackpadTwoFingerGesture: false,
  activeCursor: 'auto',
  mouseButton: MouseButton.LEFT,
  statusBarAnimation: 'slide'
}; // StatusBar.setHidden and Keyboard.dismiss cannot be directly referenced in worklets.

const setStatusBarHidden = StatusBar.setHidden;
const dismissKeyboard = Keyboard.dismiss;
const DrawerLayout = /*#__PURE__*/forwardRef(function DrawerLayout(props, ref) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [drawerState, setDrawerState] = useState(DrawerState.IDLE);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const {
    drawerPosition = defaultProps.drawerPosition,
    drawerWidth = defaultProps.drawerWidth,
    drawerType = defaultProps.drawerType,
    drawerBackgroundColor,
    drawerContainerStyle,
    contentContainerStyle,
    minSwipeDistance = defaultProps.minSwipeDistance,
    edgeWidth = defaultProps.edgeWidth,
    drawerLockMode = defaultProps.drawerLockMode,
    overlayColor = defaultProps.overlayColor,
    enableTrackpadTwoFingerGesture = defaultProps.enableTrackpadTwoFingerGesture,
    activeCursor = defaultProps.activeCursor,
    mouseButton = defaultProps.mouseButton,
    statusBarAnimation = defaultProps.statusBarAnimation,
    hideStatusBar,
    keyboardDismissMode,
    userSelect,
    enableContextMenu,
    renderNavigationView,
    onDrawerSlide,
    onDrawerClose,
    onDrawerOpen,
    onDrawerStateChanged,
    animationSpeed: animationSpeedProp
  } = props;
  const isFromLeft = drawerPosition === DrawerPosition.LEFT;
  const sideCorrection = isFromLeft ? 1 : -1; // While closing the drawer when user starts gesture in the greyed out part of the window,
  // we want the drawer to follow only once the finger reaches the edge of the drawer.
  // See the diagram for reference. * = starting finger position, < = current finger position
  // 1) +---------------+ 2) +---------------+ 3) +---------------+ 4) +---------------+
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|..<*..|    |XXXXXXXX|.<-*..|    |XXXXXXXX|<--*..|    |XXXXX|<-----*..|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    +---------------+    +---------------+    +---------------+    +---------------+

  const openValue = useSharedValue(0);
  useDerivedValue(() => {
    onDrawerSlide && runOnJS(onDrawerSlide)(openValue.value);
  }, []);
  const isDrawerOpen = useSharedValue(false);

  const handleContainerLayout = ({
    nativeEvent
  }) => {
    setContainerWidth(nativeEvent.layout.width);
  };

  const emitStateChanged = useCallback((newState, drawerWillShow) => {
    'worklet';

    var _runOnJS;

    onDrawerStateChanged && ((_runOnJS = runOnJS(onDrawerStateChanged)) === null || _runOnJS === void 0 ? void 0 : _runOnJS(newState, drawerWillShow));
  }, [onDrawerStateChanged]);
  const drawerAnimatedProps = useAnimatedProps(() => ({
    accessibilityViewIsModal: isDrawerOpen.value
  }));
  const overlayAnimatedProps = useAnimatedProps(() => ({
    pointerEvents: isDrawerOpen.value ? 'auto' : 'none'
  })); // While the drawer is hidden, it's hitSlop overflows onto the main view by edgeWidth
  // This way it can be swiped open even when it's hidden

  const [edgeHitSlop, setEdgeHitSlop] = useState(isFromLeft ? {
    left: 0,
    width: edgeWidth
  } : {
    right: 0,
    width: edgeWidth
  }); // gestureOrientation is 1 if the gesture is expected to move from left to right and -1 otherwise

  const gestureOrientation = useMemo(() => sideCorrection * (drawerOpened ? -1 : 1), [sideCorrection, drawerOpened]);
  useEffect(() => {
    setEdgeHitSlop(isFromLeft ? {
      left: 0,
      width: edgeWidth
    } : {
      right: 0,
      width: edgeWidth
    });
  }, [isFromLeft, edgeWidth]);
  const animateDrawer = useCallback((toValue, initialVelocity, animationSpeed) => {
    'worklet';

    const willShow = toValue !== 0;
    isDrawerOpen.value = willShow;
    emitStateChanged(DrawerState.SETTLING, willShow);
    runOnJS(setDrawerState)(DrawerState.SETTLING);

    if (hideStatusBar) {
      runOnJS(setStatusBarHidden)(willShow, statusBarAnimation);
    }

    const normalizedToValue = interpolate(toValue, [0, drawerWidth], [0, 1], Extrapolation.CLAMP);
    const normalizedInitialVelocity = interpolate(initialVelocity, [0, drawerWidth], [0, 1], Extrapolation.CLAMP);
    openValue.value = withSpring(normalizedToValue, {
      overshootClamping: true,
      velocity: normalizedInitialVelocity,
      mass: animationSpeed ? 1 / animationSpeed : 1 / (animationSpeedProp !== null && animationSpeedProp !== void 0 ? animationSpeedProp : 1),
      damping: 40,
      stiffness: 500
    }, finished => {
      if (finished) {
        emitStateChanged(DrawerState.IDLE, willShow);
        runOnJS(setDrawerOpened)(willShow);
        runOnJS(setDrawerState)(DrawerState.IDLE);

        if (willShow) {
          var _runOnJS2;

          onDrawerOpen && ((_runOnJS2 = runOnJS(onDrawerOpen)) === null || _runOnJS2 === void 0 ? void 0 : _runOnJS2());
        } else {
          var _runOnJS3;

          onDrawerClose && ((_runOnJS3 = runOnJS(onDrawerClose)) === null || _runOnJS3 === void 0 ? void 0 : _runOnJS3());
        }
      }
    });
  }, [openValue, emitStateChanged, isDrawerOpen, hideStatusBar, onDrawerClose, onDrawerOpen, drawerWidth, statusBarAnimation]);
  const handleRelease = useCallback(event => {
    'worklet';

    let {
      translationX: dragX,
      velocityX,
      x: touchX
    } = event;

    if (drawerPosition !== DrawerPosition.LEFT) {
      // See description in _updateAnimatedEvent about why events are flipped
      // for right-side drawer
      dragX = -dragX;
      touchX = containerWidth - touchX;
      velocityX = -velocityX;
    }

    const gestureStartX = touchX - dragX;
    let dragOffsetBasedOnStart = 0;

    if (drawerType === DrawerType.FRONT) {
      dragOffsetBasedOnStart = gestureStartX > drawerWidth ? gestureStartX - drawerWidth : 0;
    }

    const startOffsetX = dragX + dragOffsetBasedOnStart + (isDrawerOpen.value ? drawerWidth : 0);
    const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;
    const shouldOpen = projOffsetX > drawerWidth / 2;

    if (shouldOpen) {
      animateDrawer(drawerWidth, velocityX);
    } else {
      animateDrawer(0, velocityX);
    }
  }, [animateDrawer, containerWidth, drawerPosition, drawerType, drawerWidth, isDrawerOpen]);
  const openDrawer = useCallback((options = {}) => {
    'worklet';

    var _options$initialVeloc;

    animateDrawer(drawerWidth, (_options$initialVeloc = options.initialVelocity) !== null && _options$initialVeloc !== void 0 ? _options$initialVeloc : 0, options.animationSpeed);
  }, [animateDrawer, drawerWidth]);
  const closeDrawer = useCallback((options = {}) => {
    'worklet';

    var _options$initialVeloc2;

    animateDrawer(0, (_options$initialVeloc2 = options.initialVelocity) !== null && _options$initialVeloc2 !== void 0 ? _options$initialVeloc2 : 0, options.animationSpeed);
  }, [animateDrawer]);
  const overlayDismissGesture = useMemo(() => Gesture.Tap().maxDistance(25).onEnd(() => {
    if (isDrawerOpen.value && drawerLockMode !== DrawerLockMode.LOCKED_OPEN) {
      closeDrawer();
    }
  }), [closeDrawer, isDrawerOpen, drawerLockMode]);
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: openValue.value,
    backgroundColor: overlayColor
  }));
  const fillHitSlop = useMemo(() => isFromLeft ? {
    left: drawerWidth
  } : {
    right: drawerWidth
  }, [drawerWidth, isFromLeft]);
  const panGesture = useMemo(() => {
    return Gesture.Pan().activeCursor(activeCursor).mouseButton(mouseButton).hitSlop(drawerOpened ? fillHitSlop : edgeHitSlop).minDistance(drawerOpened ? 100 : 0).activeOffsetX(gestureOrientation * minSwipeDistance).failOffsetY([-15, 15]).simultaneousWithExternalGesture(overlayDismissGesture).enableTrackpadTwoFingerGesture(enableTrackpadTwoFingerGesture).enabled(drawerState !== DrawerState.SETTLING && (drawerOpened ? drawerLockMode !== DrawerLockMode.LOCKED_OPEN : drawerLockMode !== DrawerLockMode.LOCKED_CLOSED)).onStart(() => {
      emitStateChanged(DrawerState.DRAGGING, false);
      runOnJS(setDrawerState)(DrawerState.DRAGGING);

      if (keyboardDismissMode === DrawerKeyboardDismissMode.ON_DRAG) {
        runOnJS(dismissKeyboard)();
      }

      if (hideStatusBar) {
        runOnJS(setStatusBarHidden)(true, statusBarAnimation);
      }
    }).onUpdate(event => {
      const startedOutsideTranslation = isFromLeft ? interpolate(event.x, [0, drawerWidth, drawerWidth + 1], [0, drawerWidth, drawerWidth]) : interpolate(event.x - containerWidth, [-drawerWidth - 1, -drawerWidth, 0], [drawerWidth, drawerWidth, 0]);
      const startedInsideTranslation = sideCorrection * (event.translationX + (drawerOpened ? drawerWidth * -gestureOrientation : 0));
      const adjustedTranslation = Math.max(drawerOpened ? startedOutsideTranslation : 0, startedInsideTranslation);
      openValue.value = interpolate(adjustedTranslation, [-drawerWidth, 0, drawerWidth], [1, 0, 1], Extrapolation.CLAMP);
    }).onEnd(handleRelease);
  }, [drawerLockMode, openValue, drawerWidth, emitStateChanged, gestureOrientation, handleRelease, edgeHitSlop, fillHitSlop, minSwipeDistance, hideStatusBar, keyboardDismissMode, overlayDismissGesture, drawerOpened, isFromLeft, containerWidth, sideCorrection, drawerState, activeCursor, enableTrackpadTwoFingerGesture, mouseButton, statusBarAnimation]); // When using RTL, row and row-reverse flex directions are flipped.

  const reverseContentDirection = I18nManager.isRTL ? isFromLeft : !isFromLeft;
  const dynamicDrawerStyles = {
    backgroundColor: drawerBackgroundColor,
    width: drawerWidth
  };
  const containerStyles = useAnimatedStyle(() => {
    if (drawerType === DrawerType.FRONT) {
      return {};
    }

    return {
      transform: [{
        translateX: interpolate(openValue.value, [0, 1], [0, drawerWidth * sideCorrection], Extrapolation.CLAMP)
      }]
    };
  });
  const drawerAnimatedStyle = useAnimatedStyle(() => {
    const closedDrawerOffset = drawerWidth * -sideCorrection;
    const isBack = drawerType === DrawerType.BACK;
    const isIdle = drawerState === DrawerState.IDLE;

    if (isBack) {
      return {
        transform: [{
          translateX: 0
        }],
        flexDirection: reverseContentDirection ? 'row-reverse' : 'row'
      };
    }

    let translateX = 0;

    if (isIdle) {
      translateX = drawerOpened ? 0 : closedDrawerOffset;
    } else {
      translateX = interpolate(openValue.value, [0, 1], [closedDrawerOffset, 0], Extrapolation.CLAMP);
    }

    return {
      transform: [{
        translateX
      }],
      flexDirection: reverseContentDirection ? 'row-reverse' : 'row'
    };
  });
  const containerAnimatedProps = useAnimatedProps(() => ({
    importantForAccessibility: Platform.OS === 'android' ? isDrawerOpen.value ? 'no-hide-descendants' : 'yes' : undefined
  }));
  const children = typeof props.children === 'function' ? props.children(openValue) // renderer function
  : props.children;
  useImperativeHandle(ref, () => ({
    openDrawer,
    closeDrawer
  }), [openDrawer, closeDrawer]);
  return /*#__PURE__*/React.createElement(GestureDetector, {
    gesture: panGesture,
    userSelect: userSelect,
    enableContextMenu: enableContextMenu
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: styles.main,
    onLayout: handleContainerLayout
  }, /*#__PURE__*/React.createElement(GestureDetector, {
    gesture: overlayDismissGesture
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [drawerType === DrawerType.FRONT ? styles.containerOnBack : styles.containerInFront, containerStyles, contentContainerStyle],
    animatedProps: containerAnimatedProps
  }, children, /*#__PURE__*/React.createElement(Animated.View, {
    animatedProps: overlayAnimatedProps,
    style: [styles.overlay, overlayAnimatedStyle]
  }))), /*#__PURE__*/React.createElement(Animated.View, {
    pointerEvents: "box-none",
    animatedProps: drawerAnimatedProps,
    style: [styles.drawerContainer, drawerAnimatedStyle, drawerContainerStyle]
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: dynamicDrawerStyles
  }, renderNavigationView(openValue)))));
});
export default DrawerLayout;
const styles = StyleSheet.create({
  drawerContainer: { ...StyleSheet.absoluteFillObject,
    zIndex: 1001,
    flexDirection: 'row'
  },
  containerInFront: { ...StyleSheet.absoluteFillObject,
    zIndex: 1002
  },
  containerOnBack: { ...StyleSheet.absoluteFillObject
  },
  main: {
    flex: 1,
    zIndex: 0,
    overflow: 'hidden'
  },
  overlay: { ...StyleSheet.absoluteFillObject,
    zIndex: 1000
  }
});
//# sourceMappingURL=ReanimatedDrawerLayout.js.map