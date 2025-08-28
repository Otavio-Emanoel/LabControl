"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColorScheme = useColorScheme;
const react_native_css_interop_1 = require("react-native-css-interop");
function useColorScheme() {
    const colorScheme = (0, react_native_css_interop_1.useColorScheme)();
    return {
        ...colorScheme,
        setColorScheme(scheme) {
            const darkMode = react_native_css_interop_1.StyleSheet.getFlag("darkMode") ?? "media";
            if (darkMode === "media") {
                throw new Error("Unable to manually set color scheme without using darkMode: class. See: https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually");
            }
            colorScheme?.setColorScheme(scheme);
        },
        toggleColorScheme() {
            const darkMode = react_native_css_interop_1.StyleSheet.getFlag("darkMode") ?? "media";
            if (darkMode === "media") {
                throw new Error("Unable to manually set color scheme without using darkMode: class. See: https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually");
            }
            colorScheme?.toggleColorScheme();
        },
    };
}
//# sourceMappingURL=stylesheet.js.map