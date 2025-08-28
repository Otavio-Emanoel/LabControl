"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testID = exports.resetComponents = exports.native = exports.INTERNAL_SET = void 0;
exports.render = render;
exports.getWarnings = getWarnings;
exports.createMockComponent = createMockComponent;
exports.createRemappedComponent = createRemappedComponent;
exports.registerCSS = registerCSS;
exports.setupAllComponents = setupAllComponents;
const react_1 = require("react");
const react_native_1 = require("@testing-library/react-native");
const css_to_rn_1 = require("../css-to-rn");
const runtime_1 = require("../runtime");
const api_1 = require("../runtime/api");
const appearance_observables_1 = require("../runtime/native/appearance-observables");
const globals_1 = require("../runtime/native/globals");
const styles_1 = require("../runtime/native/styles");
const unit_observables_1 = require("../runtime/native/unit-observables");
const shared_1 = require("../shared");
__exportStar(require("../index"), exports);
__exportStar(require("../runtime/native/styles"), exports);
__exportStar(require("../types"), exports);
__exportStar(require("@testing-library/react-native"), exports);
var shared_2 = require("../shared");
Object.defineProperty(exports, "INTERNAL_SET", { enumerable: true, get: function () { return shared_2.INTERNAL_SET; } });
beforeEach(() => {
    (0, styles_1.resetData)();
    unit_observables_1.vw[shared_1.INTERNAL_SET](750);
    unit_observables_1.vw[shared_1.INTERNAL_SET](750);
});
exports.native = {
    vw: unit_observables_1.vw,
    vh: unit_observables_1.vh,
    isReduceMotionEnabled: appearance_observables_1.isReduceMotionEnabled,
};
function render(component, { css, cssOptions, debugCompiled, ...options } = {}) {
    if (debugCompiled) {
        if (css) {
            console.log(`Generated css:\n\n${css}`);
        }
        else {
            console.log(`Generated css:\n\n<empty string>`);
        }
    }
    if (css) {
        registerCSS(css, { ...cssOptions, debugCompiled: debugCompiled });
    }
    return (0, react_native_1.render)(component, options);
}
render.debug = (component, options = {}) => {
    return render(component, { ...options, debugCompiled: true });
};
function getWarnings() {
    return globals_1.warnings;
}
function createMockComponent(Component, mapping) {
    (0, api_1.cssInterop)(Component, mapping);
    const mock = jest.fn(({ ...props }, ref) => {
        return (0, runtime_1.createInteropElement)(Component, { ...props, ref });
    });
    return Object.assign((0, react_1.forwardRef)(mock), {
        mock,
    });
}
function createRemappedComponent(Component, mapping) {
    (0, api_1.remapProps)(Component, mapping);
    const mock = jest.fn(({ ...props }, ref) => {
        return (0, runtime_1.createInteropElement)(Component, { ...props, ref });
    });
    return Object.assign((0, react_1.forwardRef)(mock), {
        mock,
    });
}
const resetComponents = () => {
    api_1.interopComponents.clear();
};
exports.resetComponents = resetComponents;
function registerCSS(css, { debugCompiled = process.env.NODE_OPTIONS?.includes("--inspect"), ...options } = {}) {
    const compiled = (0, css_to_rn_1.cssToReactNativeRuntime)(css, options);
    if (debugCompiled) {
        console.log(`Compiled styles:\n\n${JSON.stringify({ compiled }, null, 2)}`);
    }
    (0, styles_1.injectData)(compiled);
}
registerCSS.debug = (css, options = {}) => {
    registerCSS(css, { ...options, debugCompiled: true });
};
registerCSS.noDebug = (css, options = {}) => {
    registerCSS(css, { ...options, debugCompiled: false });
};
exports.testID = "react-native-css-interop";
function setupAllComponents() {
    require("../runtime/components");
}
//# sourceMappingURL=index.js.map