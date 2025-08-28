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
exports.INTERNAL_SET = exports.native = exports.within = exports.fireEvent = exports.screen = exports.createMockComponent = exports.act = void 0;
exports.renderCurrentTest = renderCurrentTest;
exports.render = render;
exports.invalidProperty = invalidProperty;
exports.invalidValue = invalidValue;
const react_native_1 = require("react-native");
const container_queries_1 = __importDefault(require("@tailwindcss/container-queries"));
const postcss_1 = __importDefault(require("postcss"));
const test_1 = require("react-native-css-interop/test");
const tailwindcss_1 = __importDefault(require("tailwindcss"));
const common_1 = require("./metro/common");
var test_2 = require("react-native-css-interop/test");
Object.defineProperty(exports, "act", { enumerable: true, get: function () { return test_2.act; } });
Object.defineProperty(exports, "createMockComponent", { enumerable: true, get: function () { return test_2.createMockComponent; } });
Object.defineProperty(exports, "screen", { enumerable: true, get: function () { return test_2.screen; } });
Object.defineProperty(exports, "fireEvent", { enumerable: true, get: function () { return test_2.fireEvent; } });
Object.defineProperty(exports, "within", { enumerable: true, get: function () { return test_2.within; } });
Object.defineProperty(exports, "native", { enumerable: true, get: function () { return test_2.native; } });
Object.defineProperty(exports, "INTERNAL_SET", { enumerable: true, get: function () { return test_2.INTERNAL_SET; } });
__exportStar(require("./index"), exports);
const testID = "nativewind";
beforeEach(() => {
    (0, test_1.resetData)();
    (0, test_1.setupAllComponents)();
});
process.env.NATIVEWIND_OS = react_native_1.Platform.OS;
async function renderCurrentTest({ className = expect.getState().currentTestName?.split(/\s+/).at(-1), ...options } = {}) {
    if (!className) {
        throw new Error("unable to detect className, please manually set a className");
    }
    await render(<react_native_1.View testID={testID} className={className}/>, options);
    const component = test_1.screen.getByTestId(testID, { hidden: true });
    const { testID: _testID, children, ...props } = component.props;
    const invalid = getInvalid();
    if (invalid) {
        return { props, invalid };
    }
    else {
        return { props };
    }
}
renderCurrentTest.debug = (options = {}) => {
    return renderCurrentTest({ ...options, debugCompiled: true });
};
async function render(component, { config, css, layers = {}, debugCompiled = process.env.NODE_OPTIONS?.includes("--inspect"), ...options } = {}) {
    css ??= Object.entries({
        base: true,
        components: true,
        utilities: true,
        ...layers,
    }).reduce((acc, [layer, enabled]) => {
        return enabled ? `${acc}@tailwind ${layer};` : acc;
    }, "");
    const content = getClassNames(component);
    if (debugCompiled) {
        const classNames = content.map(({ raw }) => `  ${raw}`);
        console.log(`Detected classNames:\n${classNames.join("\n")}\n\n`);
        if (config?.safelist) {
            console.log(`Detected safelist:\n${config.safelist.join("\n")}\n\n`);
        }
    }
    let { css: output } = await (0, postcss_1.default)([
        (0, tailwindcss_1.default)({
            theme: {},
            ...config,
            presets: [require("./tailwind")],
            plugins: [container_queries_1.default, ...(config?.plugins || [])],
            content,
        }),
    ]).process(css, { from: undefined });
    return (0, test_1.render)(component, {
        ...options,
        css: output,
        cssOptions: common_1.cssToReactNativeRuntimeOptions,
        debugCompiled: debugCompiled,
    });
}
render.debug = (component, options = {}) => {
    return render(component, { ...options, debugCompiled: true });
};
render.noDebug = (component, options = {}) => {
    return render(component, { ...options, debugCompiled: false });
};
function getClassNames(component) {
    const classNames = [];
    if (component.props?.className) {
        classNames.push({ raw: component.props.className });
    }
    if (component.props?.children) {
        const children = Array.isArray(component.props.children)
            ? component.props.children
            : [component.props.children];
        classNames.push(...children.flatMap((c) => getClassNames(c)));
    }
    return classNames;
}
function getInvalid() {
    const style = {};
    const properties = [];
    let hasStyles = false;
    for (const warnings of (0, test_1.getWarnings)().values()) {
        for (const warning of warnings) {
            switch (warning.type) {
                case "IncompatibleNativeProperty":
                    properties.push(warning.property);
                    break;
                case "IncompatibleNativeValue": {
                    hasStyles = true;
                    style[warning.property] = warning.value;
                    break;
                }
                case "IncompatibleNativeFunctionValue":
            }
        }
    }
    if (properties.length && hasStyles) {
        return {
            style,
            properties,
        };
    }
    else if (properties.length) {
        return { properties };
    }
    else if (hasStyles) {
        return { style };
    }
}
function invalidProperty(...properties) {
    return properties.map((property) => ({
        type: "IncompatibleNativeProperty",
        property,
    }));
}
function invalidValue(value) {
    return Object.entries(value).map(([property, value]) => ({
        type: "IncompatibleNativeValue",
        property,
        value,
    }));
}
//# sourceMappingURL=test.js.map