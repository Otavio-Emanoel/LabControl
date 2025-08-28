"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentType = getComponentType;
const ForwardRefSymbol = Symbol.for("react.forward_ref");
function getComponentType(component) {
    switch (typeof component) {
        case "function":
        case "object":
            return "$$typeof" in component && component.$$typeof === ForwardRefSymbol
                ? "forwardRef"
                : component.prototype?.isReactComponent
                    ? "class"
                    : typeof component;
        default:
            return "unknown";
    }
}
//# sourceMappingURL=unwrap-components.js.map