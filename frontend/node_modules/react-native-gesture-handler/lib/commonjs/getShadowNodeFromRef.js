"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getShadowNodeFromRef = getShadowNodeFromRef;
// Used by GestureDetector (unsupported on web at the moment) to check whether the
// attached view may get flattened on Fabric. This implementation causes errors
// on web due to the static resolution of `require` statements by webpack breaking
// the conditional importing. Solved by making .web file.
let findHostInstance_DEPRECATED;
let getInternalInstanceHandleFromPublicInstance;

function getShadowNodeFromRef(ref) {
  // Load findHostInstance_DEPRECATED lazily because it may not be available before render
  if (findHostInstance_DEPRECATED === undefined) {
    try {
      var _ReactFabric$default;

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
      const ReactFabric = require('react-native/Libraries/Renderer/shims/ReactFabric'); // Since RN 0.77 ReactFabric exports findHostInstance_DEPRECATED in default object so we're trying to
      // access it first, then fallback on named export
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment


      findHostInstance_DEPRECATED = // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (ReactFabric === null || ReactFabric === void 0 ? void 0 : (_ReactFabric$default = ReactFabric.default) === null || _ReactFabric$default === void 0 ? void 0 : _ReactFabric$default.findHostInstance_DEPRECATED) || ( // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ReactFabric === null || ReactFabric === void 0 ? void 0 : ReactFabric.findHostInstance_DEPRECATED);
    } catch (e) {
      findHostInstance_DEPRECATED = _ref => null;
    }
  } // Load findHostInstance_DEPRECATED lazily because it may not be available before render


  if (getInternalInstanceHandleFromPublicInstance === undefined) {
    try {
      var _require$getInternalI;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      getInternalInstanceHandleFromPublicInstance = // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
      (_require$getInternalI = require('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance').getInternalInstanceHandleFromPublicInstance) !== null && _require$getInternalI !== void 0 ? _require$getInternalI : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      ref => ref._internalInstanceHandle;
    } catch (e) {
      getInternalInstanceHandleFromPublicInstance = ref => // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      ref._internalInstanceHandle;
    }
  } // @ts-ignore Fabric


  return getInternalInstanceHandleFromPublicInstance(findHostInstance_DEPRECATED(ref)).stateNode.node;
}
//# sourceMappingURL=getShadowNodeFromRef.js.map