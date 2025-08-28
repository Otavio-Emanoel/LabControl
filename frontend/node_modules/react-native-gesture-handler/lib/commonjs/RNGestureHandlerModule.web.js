"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _EnableNewWebImplementation = require("./EnableNewWebImplementation");

var _Gestures = require("./web/Gestures");

var _InteractionManager = _interopRequireDefault(require("./web/tools/InteractionManager"));

var _NodeManager = _interopRequireDefault(require("./web/tools/NodeManager"));

var HammerNodeManager = _interopRequireWildcard(require("./web_hammer/NodeManager"));

var _GestureHandlerWebDelegate = require("./web/tools/GestureHandlerWebDelegate");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init method is called inside attachGestureHandler function. However, this function may
// fail when received view is not valid HTML element. On the other hand, dropGestureHandler
// will be called even if attach failed, which will result in crash.
//
// We use this flag to check whether or not dropGestureHandler should be called.
let shouldPreventDrop = false;
var _default = {
  handleSetJSResponder(tag, blockNativeResponder) {
    console.warn('handleSetJSResponder: ', tag, blockNativeResponder);
  },

  handleClearJSResponder() {
    console.warn('handleClearJSResponder: ');
  },

  createGestureHandler(handlerName, handlerTag, config) {
    if ((0, _EnableNewWebImplementation.isNewWebImplementationEnabled)()) {
      if (!(handlerName in _Gestures.Gestures)) {
        throw new Error(`react-native-gesture-handler: ${handlerName} is not supported on web.`);
      }

      const GestureClass = _Gestures.Gestures[handlerName];

      _NodeManager.default.createGestureHandler(handlerTag, new GestureClass(new _GestureHandlerWebDelegate.GestureHandlerWebDelegate()));

      _InteractionManager.default.instance.configureInteractions(_NodeManager.default.getHandler(handlerTag), config);
    } else {
      if (!(handlerName in _Gestures.HammerGestures)) {
        throw new Error(`react-native-gesture-handler: ${handlerName} is not supported on web.`);
      } // @ts-ignore If it doesn't exist, the error is thrown
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment


      const GestureClass = _Gestures.HammerGestures[handlerName]; // eslint-disable-next-line @typescript-eslint/no-unsafe-call

      HammerNodeManager.createGestureHandler(handlerTag, new GestureClass());
    }

    this.updateGestureHandler(handlerTag, config);
  },

  attachGestureHandler(handlerTag, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newView, _actionType, propsRef) {
    if (!(newView instanceof Element || newView instanceof _react.default.Component)) {
      shouldPreventDrop = true;
      const handler = (0, _EnableNewWebImplementation.isNewWebImplementationEnabled)() ? _NodeManager.default.getHandler(handlerTag) : HammerNodeManager.getHandler(handlerTag);
      const handlerName = handler.constructor.name;
      throw new Error(`${handlerName} with tag ${handlerTag} received child that is not valid HTML element.`);
    }

    if ((0, _EnableNewWebImplementation.isNewWebImplementationEnabled)()) {
      // @ts-ignore Types should be HTMLElement or React.Component
      _NodeManager.default.getHandler(handlerTag).init(newView, propsRef);
    } else {
      // @ts-ignore Types should be HTMLElement or React.Component
      HammerNodeManager.getHandler(handlerTag).setView(newView, propsRef);
    }
  },

  updateGestureHandler(handlerTag, newConfig) {
    if ((0, _EnableNewWebImplementation.isNewWebImplementationEnabled)()) {
      _NodeManager.default.getHandler(handlerTag).updateGestureConfig(newConfig);

      _InteractionManager.default.instance.configureInteractions(_NodeManager.default.getHandler(handlerTag), newConfig);
    } else {
      HammerNodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
    }
  },

  getGestureHandlerNode(handlerTag) {
    if ((0, _EnableNewWebImplementation.isNewWebImplementationEnabled)()) {
      return _NodeManager.default.getHandler(handlerTag);
    } else {
      return HammerNodeManager.getHandler(handlerTag);
    }
  },

  dropGestureHandler(handlerTag) {
    if (shouldPreventDrop) {
      return;
    }

    if ((0, _EnableNewWebImplementation.isNewWebImplementationEnabled)()) {
      _NodeManager.default.dropGestureHandler(handlerTag);
    } else {
      HammerNodeManager.dropGestureHandler(handlerTag);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {}

};
exports.default = _default;
//# sourceMappingURL=RNGestureHandlerModule.web.js.map