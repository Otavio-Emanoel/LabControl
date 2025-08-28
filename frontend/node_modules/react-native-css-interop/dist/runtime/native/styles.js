"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniversalVariable = exports.VariableContext = exports.opaqueStyles = void 0;
exports.getStyle = getStyle;
exports.getOpaqueStyles = getOpaqueStyles;
exports.getAnimation = getAnimation;
exports.getVariable = getVariable;
exports.resetData = resetData;
exports.injectData = injectData;
const react_1 = require("react");
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
const appearance_observables_1 = require("./appearance-observables");
const globals_1 = require("./globals");
const unit_observables_1 = require("./unit-observables");
global.__css_interop ??= {
    styles: new Map(),
    keyframes: new Map(),
    rootVariables: new Map(),
    universalVariables: new Map(),
};
const styles = global.__css_interop.styles;
const keyframes = global.__css_interop.keyframes;
const rootVariables = global.__css_interop.rootVariables;
const universalVariables = global.__css_interop.universalVariables;
const seenStylesForHotReload = new Set();
exports.opaqueStyles = new WeakMap();
exports.VariableContext = (0, react_1.createContext)(rootVariables);
function getStyle(name, effect) {
    if (!seenStylesForHotReload.has(name)) {
        seenStylesForHotReload.add(name);
        initiateStyle(name);
    }
    let obs = styles.get(name);
    if (!obs)
        styles.set(name, (obs = (0, observable_1.observable)(undefined)));
    const style = obs.get(effect);
    const styleWarnings = style?.warnings;
    if (styleWarnings) {
        if (!globals_1.warnings.has(name)) {
            globals_1.warnings.set(name, styleWarnings);
        }
    }
    return style;
}
function getOpaqueStyles(style, effect) {
    const opaqueStyle = exports.opaqueStyles.get(style);
    if (!opaqueStyle) {
        return [style];
    }
    if (opaqueStyle[shared_1.StyleRuleSetSymbol] === "RemappedClassName") {
        return opaqueStyle.classNames.map((className) => {
            return getStyle(className, effect);
        });
    }
    else if (opaqueStyle) {
        return [opaqueStyle];
    }
    return [];
}
function getAnimation(name, effect) {
    let obs = keyframes.get(name);
    if (!obs)
        keyframes.set(name, (obs = (0, observable_1.observable)(undefined)));
    return obs.get(effect);
}
function getVariable(name, store, effect) {
    if (!store)
        return;
    let obs = store instanceof Map ? store.get(name) : store[name];
    return obs && typeof obs === "object" && "get" in obs ? obs.get(effect) : obs;
}
const getUniversalVariable = (name, effect) => {
    return getVariable(name, universalVariables, effect);
};
exports.getUniversalVariable = getUniversalVariable;
function resetData() {
    styles.clear();
    seenStylesForHotReload.clear();
    keyframes.clear();
    globals_1.warnings.clear();
    universalVariables.clear();
    rootVariables.clear();
    appearance_observables_1.colorScheme[unit_observables_1.INTERNAL_RESET](react_native_1.Appearance);
    appearance_observables_1.isReduceMotionEnabled[unit_observables_1.INTERNAL_RESET]();
    unit_observables_1.rem.set(14);
}
let rules = {};
function injectData(data) {
    if (data.rules) {
        Object.assign(rules, data.rules);
    }
    for (const style of seenStylesForHotReload) {
        initiateStyle(style);
    }
    if (data.keyframes) {
        for (const entry of data.keyframes) {
            const value = keyframes.get(entry[0]);
            if (value) {
                value.set(entry[1]);
            }
            else {
                keyframes.set(entry[0], (0, observable_1.observable)(entry[1]));
            }
        }
    }
    if (data.rootVariables) {
        for (const entry of Object.entries(data.rootVariables)) {
            const value = rootVariables.get(entry[0]);
            if (value) {
                value.set(entry[1]);
            }
            else {
                rootVariables.set(entry[0], (0, appearance_observables_1.cssVariableObservable)(entry[1], { name: entry[0] }));
            }
        }
    }
    if (data.universalVariables) {
        for (const entry of Object.entries(data.universalVariables)) {
            const value = universalVariables.get(entry[0]);
            if (value) {
                value.set(entry[1]);
            }
            else {
                universalVariables.set(entry[0], (0, appearance_observables_1.cssVariableObservable)(entry[1]));
            }
        }
    }
    globals_1.flags.set("enabled", "true");
    if (data.flags) {
        for (const [key, value] of Object.entries(data.flags)) {
            globals_1.flags.set(key, value);
        }
    }
    if (data.rem) {
        unit_observables_1.rem.set(data.rem);
    }
}
function initiateStyle(name) {
    const value = styles.get(name);
    const style = rules[name];
    if (!style)
        return;
    style[shared_1.StyleRuleSetSymbol] = true;
    style.n?.forEach((style) => {
        style[shared_1.StyleRuleSymbol] = true;
    });
    style.i?.forEach((style) => {
        style[shared_1.StyleRuleSymbol] = true;
    });
    if (value) {
        value.set(style);
    }
    else {
        styles.set(name, (0, observable_1.observable)(style));
    }
}
//# sourceMappingURL=styles.js.map