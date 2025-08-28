"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSafeAreaEnv = exports.useUnstableNativeVariable = exports.remapProps = exports.cssInterop = exports.interopComponents = exports.rem = exports.colorScheme = exports.StyleSheet = void 0;
exports.useColorScheme = useColorScheme;
exports.vars = vars;
const react_1 = require("react");
const shared_1 = require("../../shared");
const config_1 = require("../config");
const observable_1 = require("../observable");
const appearance_observables_1 = require("./appearance-observables");
const native_interop_1 = require("./native-interop");
const styles_1 = require("./styles");
const unwrap_components_1 = require("./unwrap-components");
var stylesheet_1 = require("./stylesheet");
Object.defineProperty(exports, "StyleSheet", { enumerable: true, get: function () { return stylesheet_1.StyleSheet; } });
var appearance_observables_2 = require("./appearance-observables");
Object.defineProperty(exports, "colorScheme", { enumerable: true, get: function () { return appearance_observables_2.colorScheme; } });
var unit_observables_1 = require("./unit-observables");
Object.defineProperty(exports, "rem", { enumerable: true, get: function () { return unit_observables_1.rem; } });
exports.interopComponents = new Map();
const cssInterop = (baseComponent, mapping) => {
    const configs = (0, config_1.getNormalizeConfig)(mapping);
    let component;
    const type = (0, unwrap_components_1.getComponentType)(baseComponent);
    if (type === "function") {
        component = (props) => {
            return (0, native_interop_1.interop)(baseComponent, configs, props, undefined);
        };
    }
    else {
        component = (0, react_1.forwardRef)((props, ref) => {
            return (0, native_interop_1.interop)(baseComponent, configs, props, ref);
        });
    }
    const name = baseComponent.displayName ?? baseComponent.name ?? "unknown";
    component.displayName = `CssInterop.${name}`;
    exports.interopComponents.set(baseComponent, component);
    return component;
};
exports.cssInterop = cssInterop;
const remapProps = (component, mapping) => {
    const configs = (0, config_1.getNormalizeConfig)(mapping);
    const interopComponent = (0, react_1.forwardRef)(function RemapPropsComponent({ ...props }, ref) {
        for (const config of configs) {
            const source = props?.[config.source];
            if (typeof source !== "string" || !source)
                continue;
            const placeholder = {
                [shared_1.PLACEHOLDER_SYMBOL]: true,
            };
            styles_1.opaqueStyles.set(placeholder, {
                [shared_1.StyleRuleSetSymbol]: "RemappedClassName",
                classNames: source.split(/\s+/),
            });
            delete props[config.source];
            (0, shared_1.assignToTarget)(props, placeholder, config, {
                objectMergeStyle: "toArray",
            });
        }
        props.ref = ref;
        return (0, react_1.createElement)(component, props, props.children);
    });
    exports.interopComponents.set(component, interopComponent);
    return interopComponent;
};
exports.remapProps = remapProps;
function useColorScheme() {
    const [effect, setEffect] = (0, react_1.useState)(() => ({
        run: () => setEffect((s) => ({ ...s })),
        dependencies: new Set(),
    }));
    (0, observable_1.cleanupEffect)(effect);
    return {
        colorScheme: appearance_observables_1.colorScheme.get(effect),
        setColorScheme: appearance_observables_1.colorScheme.set,
        toggleColorScheme: appearance_observables_1.colorScheme.toggle,
    };
}
function vars(variables) {
    const style = {};
    styles_1.opaqueStyles.set(style, {
        [shared_1.StyleRuleSetSymbol]: true,
        variables: true,
        n: [
            {
                [shared_1.StyleRuleSymbol]: true,
                s: shared_1.inlineSpecificity,
                variables: Object.entries(variables).map(([name, value]) => {
                    return [name.startsWith("--") ? name : `--${name}`, value];
                }),
            },
        ],
    });
    return style;
}
const useUnstableNativeVariable = (name) => {
    const context = (0, react_1.useContext)(styles_1.VariableContext);
    const [effect, setState] = (0, react_1.useState)(() => ({
        run: () => setState((s) => ({ ...s })),
        dependencies: new Set(),
    }));
    let value = (0, styles_1.getVariable)(name, context, effect);
    if (typeof value === "object" && "get" in value) {
        (0, observable_1.cleanupEffect)(effect);
        value = value.get(effect);
    }
    return value;
};
exports.useUnstableNativeVariable = useUnstableNativeVariable;
const useSafeAreaEnv = () => {
    console.warn("useSafeAreaEnv() is deprecated. Please use <SafeAreaProvider /> directly");
};
exports.useSafeAreaEnv = useSafeAreaEnv;
//# sourceMappingURL=api.js.map