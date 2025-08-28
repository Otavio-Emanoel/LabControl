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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vars = exports.useUnstableNativeVariable = exports.useSafeAreaEnv = exports.useColorScheme = exports.remapProps = exports.rem = exports.cssInterop = exports.createInteropElement = exports.colorScheme = exports.StyleSheet = exports.wrapJSX = exports.createElement = void 0;
var react_1 = require("react");
Object.defineProperty(exports, "createElement", { enumerable: true, get: function () { return react_1.createElement; } });
var wrap_jsx_1 = require("./runtime/wrap-jsx");
Object.defineProperty(exports, "wrapJSX", { enumerable: true, get: function () { return __importDefault(wrap_jsx_1).default; } });
__exportStar(require("./doctor"), exports);
var runtime_1 = require("./runtime");
Object.defineProperty(exports, "StyleSheet", { enumerable: true, get: function () { return runtime_1.StyleSheet; } });
Object.defineProperty(exports, "colorScheme", { enumerable: true, get: function () { return runtime_1.colorScheme; } });
Object.defineProperty(exports, "createInteropElement", { enumerable: true, get: function () { return runtime_1.createInteropElement; } });
Object.defineProperty(exports, "cssInterop", { enumerable: true, get: function () { return runtime_1.cssInterop; } });
Object.defineProperty(exports, "rem", { enumerable: true, get: function () { return runtime_1.rem; } });
Object.defineProperty(exports, "remapProps", { enumerable: true, get: function () { return runtime_1.remapProps; } });
Object.defineProperty(exports, "useColorScheme", { enumerable: true, get: function () { return runtime_1.useColorScheme; } });
Object.defineProperty(exports, "useSafeAreaEnv", { enumerable: true, get: function () { return runtime_1.useSafeAreaEnv; } });
Object.defineProperty(exports, "useUnstableNativeVariable", { enumerable: true, get: function () { return runtime_1.useUnstableNativeVariable; } });
Object.defineProperty(exports, "vars", { enumerable: true, get: function () { return runtime_1.vars; } });
//# sourceMappingURL=index.js.map