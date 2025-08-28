"use strict";

import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
// eslint-disable-next-line no-restricted-imports
useSafeAreaFrame } from 'react-native-safe-area-context';
import useLatestCallback from 'use-latest-callback';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';

// Load with require to avoid error from webpack due to missing export in older versions
// eslint-disable-next-line import-x/no-commonjs
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const SafeAreaListener = require('react-native-safe-area-context').SafeAreaListener;
const FrameContext = /*#__PURE__*/React.createContext(undefined);
export function useFrameSize(selector, throttle) {
  const context = React.useContext(FrameContext);
  if (context == null) {
    throw new Error('useFrameSize must be used within a FrameSizeProvider');
  }
  const value = useSyncExternalStoreWithSelector(throttle ? context.subscribeThrottled : context.subscribe, context.getCurrent, context.getCurrent, selector);
  return value;
}
export function FrameSizeProvider({
  initialFrame,
  children
}) {
  const context = React.useContext(FrameContext);
  if (context != null) {
    // If the context is already present, don't wrap again
    return children;
  }
  return /*#__PURE__*/_jsx(FrameSizeProviderInner, {
    initialFrame: initialFrame,
    children: children
  });
}
function FrameSizeProviderInner({
  initialFrame,
  children
}) {
  const frameRef = React.useRef({
    width: initialFrame.width,
    height: initialFrame.height
  });
  const listeners = React.useRef(new Set());
  const getCurrent = useLatestCallback(() => frameRef.current);
  const subscribe = useLatestCallback(listener => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  });
  const subscribeThrottled = useLatestCallback(listener => {
    const delay = 100; // Throttle delay in milliseconds

    let timer;
    let updated = false;
    let waiting = false;
    const throttledListener = () => {
      clearTimeout(timer);
      updated = true;
      if (waiting) {
        // Schedule a timer to call the listener at the end
        timer = setTimeout(() => {
          if (updated) {
            updated = false;
            listener();
          }
        }, delay);
      } else {
        waiting = true;
        setTimeout(function () {
          waiting = false;
        }, delay);

        // Call the listener immediately at start
        updated = false;
        listener();
      }
    };
    const unsubscribe = subscribe(throttledListener);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  });
  const context = React.useMemo(() => ({
    getCurrent,
    subscribe,
    subscribeThrottled
  }), [subscribe, subscribeThrottled, getCurrent]);
  const onChange = useLatestCallback(frame => {
    if (frameRef.current.height === frame.height && frameRef.current.width === frame.width) {
      return;
    }
    frameRef.current = {
      width: frame.width,
      height: frame.height
    };
    listeners.current.forEach(listener => listener());
  });
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [Platform.OS === 'web' ? /*#__PURE__*/_jsx(FrameSizeListenerWeb, {
      onChange: onChange
    }) : typeof SafeAreaListener === 'undefined' ? /*#__PURE__*/_jsx(FrameSizeListenerNativeFallback, {
      onChange: onChange
    }) : /*#__PURE__*/_jsx(SafeAreaListener, {
      onChange: ({
        frame
      }) => onChange(frame),
      style: StyleSheet.absoluteFill
    }), /*#__PURE__*/_jsx(FrameContext.Provider, {
      value: context,
      children: children
    })]
  });
}

// SafeAreaListener is available only on newer versions
// Fallback to an effect-based shim for older versions
function FrameSizeListenerNativeFallback({
  onChange
}) {
  const frame = useSafeAreaFrame();
  React.useLayoutEffect(() => {
    onChange(frame);
  }, [frame, onChange]);
  return null;
}

// FIXME: On the Web, the safe area frame value doesn't update on resize
// So we workaround this by measuring the frame on resize
function FrameSizeListenerWeb({
  onChange
}) {
  const elementRef = React.useRef(null);
  React.useEffect(() => {
    if (elementRef.current == null) {
      return;
    }
    const rect = elementRef.current.getBoundingClientRect();
    onChange({
      width: rect.width,
      height: rect.height
    });
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const {
          width,
          height
        } = entry.contentRect;
        onChange({
          width,
          height
        });
      }
    });
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
    };
  }, [onChange]);
  return /*#__PURE__*/_jsx("div", {
    ref: elementRef,
    style: {
      ...StyleSheet.absoluteFillObject,
      pointerEvents: 'none',
      visibility: 'hidden'
    }
  });
}
//# sourceMappingURL=useFrameSize.js.map