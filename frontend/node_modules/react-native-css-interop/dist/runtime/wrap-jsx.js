"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wrapJSX;
const api_1 = require("./api");
const react_native_safe_area_context_1 = require("./third-party-libs/react-native-safe-area-context");
function wrapJSX(jsx) {
    return function (type, props, ...rest) {
        if (type === "react-native-css-interop-jsx-pragma-check") {
            return true;
        }
        if (process.env.NODE_ENV !== "test")
            require("./components");
        type = (0, react_native_safe_area_context_1.maybeHijackSafeAreaProvider)(type);
        if (props && props.cssInterop === false) {
            delete props.cssInterop;
        }
        else {
            type = api_1.interopComponents.get(type) ?? type;
        }
        return jsx.call(jsx, type, props, ...rest);
    };
}
//# sourceMappingURL=wrap-jsx.js.map