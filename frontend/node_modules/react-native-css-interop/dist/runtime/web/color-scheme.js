"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorScheme = void 0;
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
const stylesheet_1 = require("./stylesheet");
let appearance = react_native_1.Appearance;
let appearanceListener;
const darkModeFlag = stylesheet_1.StyleSheet.getFlag("darkMode");
let darkMode;
let darkModeValue;
let initialColor = undefined;
if (darkModeFlag) {
    const flags = darkModeFlag.split(" ");
    darkMode = flags[0];
    darkModeValue = flags[1];
    if (darkMode === "class") {
        initialColor =
            "window" in globalThis.window &&
                globalThis.window.document.documentElement.classList.contains(darkModeValue)
                ? "dark"
                : "light";
    }
}
else if ("window" in globalThis) {
    const headNode = globalThis.window.document.getElementsByTagName("head")[0];
    new MutationObserver(function (_, observer) {
        const darkModeFlag = stylesheet_1.StyleSheet.getFlag("darkMode");
        if (!darkModeFlag)
            return;
        observer.disconnect();
        const flags = darkModeFlag.split(" ");
        darkMode = flags[0];
        darkModeValue = flags[1];
        exports.colorScheme.set(globalThis.window.document.documentElement.classList.contains(darkModeValue)
            ? "dark"
            : "system");
    }).observe(headNode, { attributes: false, childList: true, subtree: false });
}
const systemColorScheme = (0, observable_1.observable)(appearance.getColorScheme() ?? "light");
const colorSchemeObservable = (0, observable_1.observable)(initialColor, { fallback: systemColorScheme });
exports.colorScheme = {
    set(value) {
        if (darkMode === "media") {
            throw new Error("Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')");
        }
        if (!globalThis.window) {
            throw new Error("Cannot manually set color scheme while not in a browser environment.");
        }
        if (value === "system") {
            colorSchemeObservable.set(undefined);
        }
        else {
            colorSchemeObservable.set(value);
        }
        if (darkModeValue) {
            if (value === "dark") {
                globalThis.window?.document.documentElement.classList.add(darkModeValue);
            }
            else {
                globalThis.window?.document.documentElement.classList.remove(darkModeValue);
            }
        }
    },
    get: colorSchemeObservable.get,
    toggle() {
        let current = colorSchemeObservable.get();
        if (current === undefined)
            current = appearance.getColorScheme() ?? "light";
        exports.colorScheme.set(current === "light" ? "dark" : "light");
    },
    [shared_1.INTERNAL_RESET]: (appearance) => {
        colorSchemeObservable.set(undefined);
        resetAppearanceListeners(appearance);
    },
};
function resetAppearanceListeners($appearance) {
    appearance = $appearance;
    appearanceListener?.remove();
    appearanceListener = appearance.addChangeListener((state) => {
        if (react_native_1.AppState.currentState === "active") {
            systemColorScheme.set(state.colorScheme ?? "light");
        }
    });
}
resetAppearanceListeners(appearance);
//# sourceMappingURL=color-scheme.js.map