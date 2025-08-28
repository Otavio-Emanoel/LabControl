"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateY = exports.translateX = void 0;
const createUtilityPlugin_1 = __importDefault(require("tailwindcss/lib/util/createUtilityPlugin"));
let cssTransformValue = [
    "translate(var(--tw-translate-x), var(--tw-translate-y))",
    "rotate(var(--tw-rotate))",
    "skewX(var(--tw-skew-x))",
    "skewY(var(--tw-skew-y))",
    "scaleX(var(--tw-scale-x))",
    "scaleY(var(--tw-scale-y))",
].join(" ");
exports.translateX = (0, createUtilityPlugin_1.default)("translateX", [
    [
        [
            "translate-x",
            [
                ["@defaults transform", {}],
                "--tw-translate-x",
                ["transform", cssTransformValue],
            ],
        ],
    ],
], { supportsNegativeValues: true });
exports.translateY = (0, createUtilityPlugin_1.default)("translateY", [
    [
        [
            "translate-y",
            [
                ["@defaults transform", {}],
                "--tw-translate-y",
                ["transform", cssTransformValue],
            ],
        ],
    ],
], { supportsNegativeValues: true });
//# sourceMappingURL=translate.js.map