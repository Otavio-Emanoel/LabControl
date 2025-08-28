"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColorScheme = useColorScheme;
const react_1 = require("react");
const color_scheme_1 = require("./color-scheme");
function useColorScheme() {
    const [effect, setEffect] = (0, react_1.useState)(() => ({
        run: () => setEffect((s) => ({ ...s })),
        dependencies: new Set(),
    }));
    return {
        colorScheme: color_scheme_1.colorScheme.get(effect),
        setColorScheme: color_scheme_1.colorScheme.set,
        toggleColorScheme: color_scheme_1.colorScheme.toggle,
    };
}
//# sourceMappingURL=useColorScheme.js.map