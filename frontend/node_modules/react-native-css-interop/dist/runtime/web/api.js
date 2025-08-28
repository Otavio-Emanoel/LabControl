"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnstableNativeVariable = exports.remapProps = exports.cssInterop = exports.useColorScheme = exports.rem = exports.colorScheme = exports.StyleSheet = void 0;
exports.vars = vars;
exports.useSafeAreaEnv = useSafeAreaEnv;
const react_1 = require("react");
const shared_1 = require("../../shared");
const config_1 = require("../config");
const interopComponentsMap_1 = require("./interopComponentsMap");
var stylesheet_1 = require("./stylesheet");
Object.defineProperty(exports, "StyleSheet", { enumerable: true, get: function () { return stylesheet_1.StyleSheet; } });
var color_scheme_1 = require("./color-scheme");
Object.defineProperty(exports, "colorScheme", { enumerable: true, get: function () { return color_scheme_1.colorScheme; } });
var rem_1 = require("./rem");
Object.defineProperty(exports, "rem", { enumerable: true, get: function () { return rem_1.rem; } });
const ForwardRefSymbol = Symbol.for("react.forward_ref");
var useColorScheme_1 = require("./useColorScheme");
Object.defineProperty(exports, "useColorScheme", { enumerable: true, get: function () { return useColorScheme_1.useColorScheme; } });
const cssInterop = (baseComponent, mapping) => {
    const configs = (0, config_1.getNormalizeConfig)(mapping);
    const interopComponent = (0, react_1.forwardRef)(function CssInteropComponent({ ...props }, ref) {
        if (props.cssInterop === false) {
            return (0, react_1.createElement)(baseComponent, props);
        }
        props = { ...props, ref };
        for (const config of configs) {
            const source = props[config.source];
            if (typeof source === "string" && source) {
                (0, shared_1.assignToTarget)(props, {
                    $$css: true,
                    [source]: source,
                }, config, {
                    objectMergeStyle: "toArray",
                });
            }
            delete props[config.source];
        }
        if ("$$typeof" in baseComponent &&
            typeof baseComponent === "function" &&
            baseComponent.$$typeof === ForwardRefSymbol) {
            delete props.cssInterop;
            return baseComponent.render(props, props.ref);
        }
        else if (typeof baseComponent === "function" &&
            !(baseComponent.prototype instanceof react_1.Component)) {
            delete props.cssInterop;
            return baseComponent(props);
        }
        else {
            return (0, react_1.createElement)(baseComponent, props);
        }
    });
    interopComponent.displayName = `CssInterop.${baseComponent.displayName ?? baseComponent.name ?? "unknown"}`;
    interopComponentsMap_1.interopComponents.set(baseComponent, interopComponent);
    return interopComponent;
};
exports.cssInterop = cssInterop;
exports.remapProps = exports.cssInterop;
const useUnstableNativeVariable = (name) => {
    if (process.env.NODE_ENV !== "production") {
        console.log("useUnstableNativeVariable is not supported on web.");
    }
    return undefined;
};
exports.useUnstableNativeVariable = useUnstableNativeVariable;
function vars(variables) {
    const $variables = {};
    for (const [key, value] of Object.entries(variables)) {
        if (key.startsWith("--")) {
            $variables[key] = value.toString();
        }
        else {
            $variables[`--${key}`] = value.toString();
        }
    }
    return $variables;
}
function useSafeAreaEnv() {
    return undefined;
}
//# sourceMappingURL=api.js.map