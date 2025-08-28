"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInstallation = verifyInstallation;
const react_native_css_interop_1 = require("react-native-css-interop");
function verifyInstallation() {
    if (process.env.NODE_ENV !== "development") {
        console.warn("verifyInstallation() was called in a non-development environment()");
    }
    if (!(0, react_native_css_interop_1.verifyJSX)()) {
        throw new Error("jsxImportSource was not set to 'nativewind'. Please refer to http://nativewind.dev/troubleshooting#jsxImportSource");
    }
    if (!(0, react_native_css_interop_1.verifyData)()) {
        throw new Error("Nativewind received no data. Please refer to http://nativewind.dev/troubleshooting#no-data");
    }
    if (!(0, react_native_css_interop_1.verifyFlag)("nativewind")) {
        throw new Error("Nativewind: was unable to detect the 'nativewind/preset'. Please refer to http://nativewind.dev/troubleshooting#tailwind-preset");
    }
    console.log("NativeWind verifyInstallation() found no errors");
    return true;
}
//# sourceMappingURL=doctor.js.map