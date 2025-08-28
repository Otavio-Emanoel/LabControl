"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValues = exports.timeToMS = void 0;
exports.resolveValue = resolveValue;
exports.resolveAnimation = resolveAnimation;
exports.getEasing = getEasing;
exports.setDeep = setDeep;
exports.getWidth = getWidth;
exports.getHeight = getHeight;
exports.calc = calc;
exports.getBaseValue = getBaseValue;
exports.getTarget = getTarget;
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
const appearance_observables_1 = require("./appearance-observables");
const text_shadow_1 = require("./resolvers/text-shadow");
const styles_1 = require("./styles");
const unit_observables_1 = require("./unit-observables");
function resolveValue(state, refs, tracking, descriptor, style, castToArray = false) {
    try {
        switch (typeof descriptor) {
            case "undefined":
                return;
            case "boolean":
            case "number":
            case "function":
                return descriptor;
            case "string":
                return descriptor.endsWith("px")
                    ? parseInt(descriptor.slice(0, -2), 10)
                    : descriptor;
        }
        if ((0, shared_1.isDescriptorArray)(descriptor)) {
            descriptor = descriptor.flatMap((d) => {
                const value = resolveValue(state, refs, tracking, d, style);
                return value === undefined ? [] : value;
            });
            if (castToArray && !Array.isArray(descriptor)) {
                return [descriptor];
            }
            else {
                return descriptor;
            }
        }
        const [, name, descriptorArgs = []] = descriptor;
        const cast = (value) => {
            if (value === undefined)
                return;
            return castToArray && !Array.isArray(value) ? [value] : value;
        };
        switch (name) {
            case "@textShadow": {
                return (0, text_shadow_1.textShadow)(resolve, state, refs, tracking, descriptorArgs, style);
            }
            case "var": {
                let value = resolve(state, refs, tracking, descriptorArgs[0], style);
                if (typeof value === "string")
                    value = getVar(state, refs, tracking, value, style);
                if (value === undefined && descriptorArgs[1]) {
                    value = resolveValue(state, refs, tracking, descriptorArgs[1], style);
                }
                return cast(value);
            }
            case "calc": {
                return cast(calc(state, refs, tracking, descriptorArgs, style)?.value);
            }
            case "max": {
                let mode;
                let values = [];
                for (const arg of descriptorArgs) {
                    const result = calc(state, refs, tracking, [arg], style);
                    if (result) {
                        if (!mode)
                            mode = result?.mode;
                        if (result.mode === mode) {
                            values.push(result.raw);
                        }
                    }
                }
                const max = Math.max(...values);
                return cast(mode === "percentage" ? `${max}%` : max);
            }
            case "min": {
                let mode;
                let values = [];
                for (const arg of descriptorArgs) {
                    const result = calc(state, refs, tracking, [arg], style);
                    if (result) {
                        if (!mode)
                            mode = result?.mode;
                        if (result.mode === mode) {
                            values.push(result.raw);
                        }
                    }
                }
                const min = Math.min(...values);
                return cast(mode === "percentage" ? `${min}%` : min);
            }
            case "clamp": {
                const min = calc(state, refs, tracking, descriptorArgs[0], style);
                const val = calc(state, refs, tracking, descriptorArgs[1], style);
                const max = calc(state, refs, tracking, descriptorArgs[2], style);
                if (!min || !val || !max)
                    return;
                if (min.mode !== val.mode && max.mode !== val.mode)
                    return;
                const value = Math.max(min.raw, Math.min(val.raw, max.raw));
                return cast(val.mode === "percentage" ? `${value}%` : value);
            }
            case "vh": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const vhValue = unit_observables_1.vh.get(tracking.effect) / 100;
                if (typeof value === "number") {
                    return cast(round(vhValue * value));
                }
            }
            case "vw": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const vwValue = unit_observables_1.vw.get(tracking.effect) / 100;
                if (typeof value === "number") {
                    return cast(round(vwValue * value));
                }
            }
            case "em": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const fontSize = style?.fontSize ?? unit_observables_1.rem.get(tracking.effect);
                if (typeof value === "number") {
                    return cast(round(fontSize * value));
                }
            }
            case "rem": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const remValue = unit_observables_1.rem.get(tracking.effect);
                if (typeof value === "number") {
                    return cast(round(remValue * value));
                }
            }
            case "rnh": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const height = style?.height ?? getHeight(state, refs, tracking);
                if (typeof value === "number") {
                    return cast(round(height * value));
                }
            }
            case "rnw": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                const width = style?.width ?? getWidth(state, refs, tracking);
                if (typeof value === "number") {
                    return cast(round(width * value));
                }
            }
            case "hwb":
                const args = resolve(state, refs, tracking, descriptorArgs, style).flat(10);
                return cast(getColorArgs(args, { 3: "hwb" }));
            case "rgb":
            case "rgba": {
                const args = resolve(state, refs, tracking, descriptorArgs, style).flat(10);
                return cast(getColorArgs(args, { 3: "rgb", 4: "rgba" }));
            }
            case "hsl":
            case "hsla": {
                const args = resolve(state, refs, tracking, descriptorArgs, style).flat(10);
                return cast(getColorArgs(args, { 3: "hsl", 4: "hsla" }));
            }
            case "hairlineWidth": {
                return cast(react_native_1.StyleSheet.hairlineWidth);
            }
            case "platformColor": {
                return cast((0, react_native_1.PlatformColor)(...descriptorArgs));
            }
            case "platformSelect": {
                if (!(0, shared_1.isDescriptorArray)(descriptorArgs))
                    return;
                const value = resolve(state, refs, tracking, react_native_1.Platform.select(Object.fromEntries(descriptorArgs)), style);
                return cast(value);
            }
            case "getPixelSizeForLayoutSize": {
                const v = resolve(state, refs, tracking, descriptorArgs[0], style);
                if (typeof v === "number") {
                    return cast(react_native_1.PixelRatio.getPixelSizeForLayoutSize(v));
                }
            }
            case "fontScale": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                if (typeof value === "number") {
                    return cast(react_native_1.PixelRatio.getFontScale() * value);
                }
            }
            case "pixelScale": {
                const value = resolve(state, refs, tracking, descriptorArgs[0], style);
                if (typeof value === "number") {
                    return cast(react_native_1.PixelRatio.get() * value);
                }
            }
            case "pixelScaleSelect": {
                const specifics = Object.fromEntries(descriptorArgs);
                const value = resolve(state, refs, tracking, specifics[react_native_1.PixelRatio.get()] ?? specifics["default"], style);
                return cast(value);
            }
            case "fontScaleSelect": {
                const specifics = Object.fromEntries(descriptorArgs);
                const value = resolve(state, refs, tracking, specifics[react_native_1.PixelRatio.getFontScale()] ?? specifics["default"], style);
                return cast(value);
            }
            case "roundToNearestPixel": {
                const v = resolve(state, refs, tracking, descriptorArgs[0], style);
                if (typeof v === "number") {
                    return react_native_1.PixelRatio.roundToNearestPixel(v);
                }
            }
            case "translateX":
            case "translateY":
            case "scale":
            case "scaleX":
            case "scaleY":
            case "rotate":
            case "rotateX":
            case "rotateY":
            case "rotateZ":
            case "skewX":
            case "skewY":
            case "perspective":
            case "matrix":
            case "transformOrigin": {
                const value = {
                    [name]: resolve(state, refs, tracking, descriptorArgs[0], style),
                };
                return cast(value);
            }
            case "translate":
            case "scale": {
                return [
                    {
                        [`${name}X`]: resolve(state, refs, tracking, descriptorArgs[0], style),
                    },
                    {
                        [`${name}Y`]: resolve(state, refs, tracking, descriptorArgs[1], style),
                    },
                ];
            }
            default: {
                if ("name" in descriptor && "arguments" in descriptor) {
                    const args = resolve(state, refs, tracking, descriptorArgs, style).join(",");
                    return cast(`${descriptor.name}(${args})`);
                }
                else {
                    return cast(descriptor);
                }
            }
        }
    }
    catch (error) {
        if (process.env.NODE_ENV !== "development") {
            console.error(error);
        }
        return undefined;
    }
}
function resolve(state, refs, tracking, descriptor, style) {
    if (typeof descriptor !== "object" || !Array.isArray(descriptor)) {
        return descriptor;
    }
    if ((0, shared_1.isDescriptorArray)(descriptor)) {
        let resolved = [];
        for (let value of descriptor) {
            value = resolve(state, refs, tracking, value, style);
            if (value !== undefined) {
                resolved.push(value);
            }
        }
        return resolved;
    }
    return resolveValue(state, refs, tracking, descriptor, style);
}
function getVar(state, refs, tracking, name, style) {
    if (!name)
        return;
    let value = undefined;
    value ??= (0, styles_1.getVariable)(name, state.variables);
    value ??= (0, styles_1.getUniversalVariable)(name, tracking.effect);
    if (value === undefined) {
        value = (0, styles_1.getVariable)(name, refs.variables, tracking.effect);
        if (typeof value === "object" && "get" in value) {
            value = value.get(tracking.effect);
        }
        else if (value !== undefined) {
            tracking.guards.push((refs) => (0, styles_1.getVariable)(name, refs.variables, tracking.effect) !== value);
        }
    }
    return resolveValue(state, refs, tracking, value, style);
}
function resolveAnimation(state, refs, [initialFrame, ...frames], property, delay, totalDuration, easingFuncs) {
    const { withDelay, withTiming, Easing } = require("react-native-reanimated");
    let progress = 0;
    const initialValue = resolveAnimationValue(state, refs, property, initialFrame.value);
    return [
        initialValue,
        ...frames.map((frame, index) => {
            const easingFunction = Array.isArray(easingFuncs)
                ? easingFuncs[index]
                : easingFuncs;
            const framesProgress = frame.progress - progress;
            let value = withTiming(resolveAnimationValue(state, refs, property, frame.value), {
                duration: totalDuration * framesProgress,
                easing: getEasing(easingFunction, Easing),
            });
            if (index === 1) {
                value = withDelay(delay, value);
            }
            progress += framesProgress;
            return value;
        }),
    ];
}
function resolveAnimationValue(state, refs, property, value) {
    if (value === "!INHERIT!") {
        const { value: baseValue, defaultValue } = getBaseValue(state, [property]);
        value = baseValue ?? defaultValue;
        if (value === undefined) {
            const defaultValueFn = exports.defaultValues[property];
            return typeof defaultValueFn === "function"
                ? defaultValueFn(state.styleTracking.effect)
                : defaultValueFn;
        }
        return value;
    }
    else {
        return resolve(state, refs, state.styleTracking, value, state.props);
    }
}
const timeToMS = (time) => {
    return time.type === "milliseconds" ? time.value : time.value * 1000;
};
exports.timeToMS = timeToMS;
function round(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
}
function getEasing(timingFunction, Easing) {
    switch (timingFunction.type) {
        case "ease":
            return Easing.ease;
        case "ease-in":
            return Easing.in(Easing.quad);
        case "ease-out":
            return Easing.out(Easing.quad);
        case "ease-in-out":
            return Easing.inOut(Easing.quad);
        case "linear":
            return Easing.linear;
        case "cubic-bezier":
            return Easing.bezier(timingFunction.x1, timingFunction.y1, timingFunction.x2, timingFunction.y2);
        default:
            return Easing.linear;
    }
}
function setDeep(target, paths, value) {
    const prop = paths[paths.length - 1];
    for (let i = 0; i < paths.length - 1; i++) {
        const token = paths[i];
        target[token] ??= {};
        target = target[token];
    }
    if (shared_1.transformKeys.has(prop)) {
        if (target.transform) {
            const existing = target.transform.find((t) => Object.keys(t)[0] === prop);
            if (existing) {
                existing[prop] = value;
            }
            else {
                target.transform.push({ [prop]: value });
            }
        }
        else {
            target.transform ??= [];
            target.transform.push({ [prop]: value });
        }
    }
    else {
        target[prop] = value;
    }
}
function getColorArgs(args, config) {
    if (config[args.length])
        return `${config[args.length]}(${args.join(", ")})`;
    args = args.flatMap((arg) => {
        return typeof arg === "string"
            ? arg.split(/[,\s\/]/g).filter(Boolean)
            : arg;
    });
    if (config[args.length])
        return `${config[args.length]}(${args.join(", ")})`;
}
function getLayout(state, refs, tracking) {
    refs.sharedState.layout ??= (0, observable_1.observable)([0, 0]);
    return refs.sharedState.layout.get(tracking.effect);
}
function getWidth(state, refs, tracking) {
    return getLayout(state, refs, tracking)[0];
}
function getHeight(state, refs, tracking) {
    return getLayout(state, refs, tracking)[1];
}
exports.defaultValues = {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    borderColor: "transparent",
    borderLeftColor: "transparent",
    borderLeftWidth: 0,
    borderRadius: 0,
    borderRightColor: "transparent",
    borderRightWidth: 0,
    borderTopColor: "transparent",
    borderTopWidth: 0,
    borderWidth: 0,
    bottom: 0,
    color: (effect) => {
        return appearance_observables_1.systemColorScheme.get(effect) === "dark" ? "white" : "black";
    },
    flex: 1,
    flexBasis: 1,
    flexGrow: 1,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "400",
    gap: 0,
    left: 0,
    lineHeight: 14,
    margin: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    maxHeight: 99999,
    maxWidth: 99999,
    minHeight: 0,
    minWidth: 0,
    opacity: 1,
    padding: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    perspective: 1,
    right: 0,
    rotate: "0deg",
    rotateX: "0deg",
    rotateY: "0deg",
    rotateZ: "0deg",
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: "0deg",
    skewY: "0deg",
    textShadowRadius: 0,
    top: 0,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
};
const calcPrecedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
};
function applyCalcOperator(operator, b, a, values) {
    switch (operator) {
        case "+":
            return values.push(a + b);
        case "-":
            return values.push(a - b);
        case "*":
            return values.push(a * b);
        case "/":
            return values.push(a / b);
    }
}
function calc(state, refs, tracking, descriptor, style) {
    let mode;
    const values = [];
    const ops = [];
    descriptor = Array.isArray(descriptor)
        ? (0, shared_1.isDescriptorFunction)(descriptor)
            ? [descriptor]
            : descriptor
        : [descriptor];
    for (let token of descriptor) {
        switch (typeof token) {
            case "undefined":
                return;
            case "number":
                if (!mode)
                    mode = "number";
                if (mode !== "number")
                    return;
                values.push(token);
                continue;
            case "object": {
                const value = resolveValue(state, refs, tracking, token, style);
                switch (typeof value) {
                    case "number": {
                        if (!mode)
                            mode = "number";
                        if (mode !== "number")
                            return;
                        values.push(value);
                        continue;
                    }
                    case "string": {
                        if (!value.endsWith("%")) {
                            return;
                        }
                        if (!mode)
                            mode = "percentage";
                        if (mode !== "percentage")
                            return;
                        values.push(Number.parseFloat(value.slice(0, -1)));
                        continue;
                    }
                    default:
                        return;
                }
            }
            case "string": {
                if (token === "(") {
                    ops.push(token);
                }
                else if (token === ")") {
                    while (ops.length && ops[ops.length - 1] !== "(") {
                        applyCalcOperator(ops.pop(), values.pop(), values.pop(), values);
                    }
                    ops.pop();
                }
                else if (token.endsWith("%")) {
                    if (!mode)
                        mode = "percentage";
                    if (mode !== "percentage")
                        return;
                    values.push(Number.parseFloat(token.slice(0, -1)));
                }
                else {
                    while (ops.length &&
                        calcPrecedence[ops[ops.length - 1]] >= calcPrecedence[token]) {
                        applyCalcOperator(ops.pop(), values.pop(), values.pop(), values);
                    }
                    ops.push(token);
                }
            }
        }
    }
    while (ops.length) {
        applyCalcOperator(ops.pop(), values.pop(), values.pop(), values);
    }
    if (!mode)
        return;
    const value = round(values[0]);
    return {
        mode,
        raw: value,
        value: mode === "percentage" ? `${value}%` : value,
    };
}
function getBaseValue(state, paths) {
    paths = [...state.config.target, ...paths];
    let prop = "";
    let target = state.props;
    for (let index = 0; index < paths.length && target; index++) {
        if (!isRecord(target)) {
            target = undefined;
            continue;
        }
        prop = paths[index];
        if (target[prop] === undefined) {
            if (shared_1.transformKeys.has(prop) &&
                isRecord(target) &&
                "transform" in target) {
                target = target.transform.find((t) => t[prop] !== undefined);
                if (isRecord(target) && prop in target) {
                    target = target[prop];
                }
                else {
                    target = undefined;
                }
            }
            else {
                target = undefined;
            }
        }
        else {
            target = target[prop];
        }
    }
    const defaultValueFn = exports.defaultValues[paths[paths.length - 1]];
    const defaultValue = typeof defaultValueFn === "function"
        ? defaultValueFn(state.styleTracking.effect)
        : defaultValueFn;
    return {
        value: target,
        defaultValue,
    };
}
function isRecord(value) {
    return Boolean(typeof value === "object" && value);
}
function getTarget(target, config) {
    for (let index = 0; index < config.target.length && target; index++) {
        const prop = config.target[index];
        target = target[prop];
    }
    return target || undefined;
}
//# sourceMappingURL=resolve-value.js.map