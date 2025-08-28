"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = exports.createInteropElement = exports.jsxDEV = exports.jsx = exports.jsxs = exports.Fragment = void 0;
const react_1 = require("react");
const jsx_dev_runtime_1 = __importDefault(require("react/jsx-dev-runtime"));
const wrap_jsx_1 = __importDefault(require("./wrap-jsx"));
var react_2 = require("react");
Object.defineProperty(exports, "Fragment", { enumerable: true, get: function () { return react_2.Fragment; } });
exports.jsxs = (0, wrap_jsx_1.default)(jsx_dev_runtime_1.default.jsxs);
exports.jsx = (0, wrap_jsx_1.default)(jsx_dev_runtime_1.default.jsx);
exports.jsxDEV = (0, wrap_jsx_1.default)(jsx_dev_runtime_1.default.jsxDEV);
exports.createInteropElement = (0, wrap_jsx_1.default)(react_1.createElement);
exports.createElement = react_1.createElement;
//# sourceMappingURL=jsx-dev-runtime.js.map