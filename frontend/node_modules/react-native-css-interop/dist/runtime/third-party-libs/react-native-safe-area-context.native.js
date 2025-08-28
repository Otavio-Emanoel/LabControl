"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeHijackSafeAreaProvider = maybeHijackSafeAreaProvider;
const react_1 = require("react");
const react_native_1 = require("react-native");
const styles_1 = require("../native/styles");
let safeAreaProviderShim;
function maybeHijackSafeAreaProvider(type) {
    const name = type.displayName || type.name;
    if (react_native_1.Platform.OS !== "web" && name === "SafeAreaProvider") {
        safeAreaProviderShim ||= shimFactory(type);
        type = safeAreaProviderShim;
    }
    return type;
}
function shimFactory(type) {
    function SafeAreaEnv({ children }) {
        try {
            const { useSafeAreaInsets, SafeAreaProvider, } = require("react-native-safe-area-context");
            if (type !== SafeAreaProvider) {
                return (0, react_1.createElement)(react_1.Fragment, {}, children);
            }
            const insets = useSafeAreaInsets();
            const parentVarContext = (0, react_1.useContext)(styles_1.VariableContext);
            const parentVars = parentVarContext instanceof Map
                ? Object.fromEntries(parentVarContext.entries())
                : parentVarContext;
            const value = (0, react_1.useMemo)(() => ({
                ...parentVars,
                "--___css-interop___safe-area-inset-bottom": insets.bottom,
                "--___css-interop___safe-area-inset-left": insets.left,
                "--___css-interop___safe-area-inset-right": insets.right,
                "--___css-interop___safe-area-inset-top": insets.top,
            }), [parentVarContext, insets]);
            return (0, react_1.createElement)(styles_1.VariableContext.Provider, { value }, children);
        }
        catch {
            return (0, react_1.createElement)(react_1.Fragment, {}, children);
        }
    }
    return function SafeAreaProviderShim({ children, ...props }) {
        return (0, react_1.createElement)(type, props, (0, react_1.createElement)(SafeAreaEnv, {}, children));
    };
}
//# sourceMappingURL=react-native-safe-area-context.native.js.map