"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReduceMotionEnabled = exports.colorScheme = exports.systemColorScheme = void 0;
exports.cssVariableObservable = cssVariableObservable;
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
exports.systemColorScheme = (0, observable_1.observable)(react_native_1.Appearance.getColorScheme() ?? "light");
const colorSchemeObservable = (0, observable_1.observable)(undefined);
exports.colorScheme = {
    set(value) {
        if (value === "system") {
            appearance.setColorScheme(null);
        }
        else {
            appearance.setColorScheme(value);
        }
        if (process.env.NODE_ENV === "test") {
            colorSchemeObservable.set(value === "system" ? "light" : value);
        }
    },
    get(effect) {
        return colorSchemeObservable.get(effect) ?? exports.systemColorScheme.get(effect);
    },
    getSystem(effect) {
        return colorSchemeObservable.get(effect) ?? exports.systemColorScheme.get(effect);
    },
    toggle() {
        let current = colorSchemeObservable.get();
        if (current === undefined)
            current = appearance.getColorScheme() ?? "light";
        exports.colorScheme.set(current === "light" ? "dark" : "light");
    },
    [shared_1.INTERNAL_RESET]: (appearance) => {
        colorSchemeObservable.set(undefined);
        resetAppearanceListeners(appearance, react_native_1.AppState);
    },
};
function cssVariableObservable(value, { name } = {}) {
    const light = (0, observable_1.observable)(value?.light, { name: `${name}#light` });
    const dark = (0, observable_1.observable)(value?.dark, {
        name: `${name}#dark`,
        fallback: light,
    });
    return {
        name,
        get(effect) {
            return exports.colorScheme.get(effect) === "light"
                ? light.get(effect)
                : dark.get(effect);
        },
        set(value) {
            if (typeof value === "object" && value) {
                if ("dark" in value)
                    dark.set(value.dark);
                if ("light" in value)
                    light.set(value.light);
            }
            else {
                light.set(value);
                dark.set(value);
            }
        },
    };
}
let appearance = react_native_1.Appearance;
let appearanceListener;
let appStateListener;
function resetAppearanceListeners($appearance, appState) {
    appearance = $appearance;
    appearanceListener?.remove();
    appStateListener?.remove();
    appearanceListener = appearance.addChangeListener((state) => {
        if (react_native_1.AppState.currentState === "active") {
            exports.systemColorScheme.set(state.colorScheme ?? "light");
        }
    });
    appStateListener = appState.addEventListener("change", (type) => {
        if (type === "active") {
            const colorScheme = appearance.getColorScheme() ?? "light";
            exports.systemColorScheme.set(colorScheme);
        }
    });
}
resetAppearanceListeners(appearance, react_native_1.AppState);
exports.isReduceMotionEnabled = Object.assign((0, observable_1.observable)(false, { name: "isReduceMotionEnabled" }), { [shared_1.INTERNAL_RESET]: () => exports.isReduceMotionEnabled.set(false) });
react_native_1.AccessibilityInfo.isReduceMotionEnabled()?.then(exports.isReduceMotionEnabled.set);
react_native_1.AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
    exports.isReduceMotionEnabled.set(value);
});
//# sourceMappingURL=appearance-observables.js.map