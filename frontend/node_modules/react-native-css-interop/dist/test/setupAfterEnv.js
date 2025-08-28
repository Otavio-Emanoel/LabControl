"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const matchers_1 = __importDefault(require("expect/build/matchers"));
matchers_1.default.customTesters = [];
expect.extend({
    toHaveStyle(received, style) {
        const receivedStyle = received?.props?.style
            ? Object.fromEntries(Object.entries(received?.props?.style))
            : undefined;
        return matchers_1.default.toStrictEqual(receivedStyle, style);
    },
});
//# sourceMappingURL=setupAfterEnv.js.map