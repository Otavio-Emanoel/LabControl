"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformKeys = exports.inlineSpecificity = exports.SpecificityIndex = exports.STYLE_SCOPES = exports.DEFAULT_CONTAINER_NAME = exports.PLACEHOLDER_SYMBOL = exports.StyleRuleSymbol = exports.StyleRuleSetSymbol = exports.INTERNAL_FLAGS = exports.INTERNAL_SET = exports.INTERNAL_RESET = void 0;
exports.isDescriptorFunction = isDescriptorFunction;
exports.isDescriptorArray = isDescriptorArray;
exports.isRuntimeDescriptor = isRuntimeDescriptor;
exports.assignToTarget = assignToTarget;
exports.getTargetValue = getTargetValue;
const shared_1 = require("./runtime/native/resolvers/shared");
exports.INTERNAL_RESET = Symbol();
exports.INTERNAL_SET = Symbol();
exports.INTERNAL_FLAGS = Symbol();
exports.StyleRuleSetSymbol = Symbol();
exports.StyleRuleSymbol = Symbol();
exports.PLACEHOLDER_SYMBOL = Symbol();
exports.DEFAULT_CONTAINER_NAME = "@__";
exports.STYLE_SCOPES = {
    GLOBAL: 0,
    CONTEXT: 1,
    SELF: 2,
};
function isDescriptorFunction(value) {
    return (Array.isArray(value) &&
        typeof value[0] === "object" &&
        !Array.isArray(value[0]));
}
function isDescriptorArray(value) {
    if (Array.isArray(value)) {
        return typeof value[0] === "object" ? Array.isArray(value[0]) : true;
    }
    return false;
}
function isRuntimeDescriptor(value) {
    if (typeof value === "object" && Array.isArray(value)) {
        return true;
    }
    else {
        return typeof value !== "object";
    }
}
function assignToTarget(parent, value, config, options = {}) {
    if (typeof value === "object" && shared_1.ShorthandSymbol in value) {
        return value.map((shorthandConfig) => {
            let pathTokens = Array.from(Array.isArray(config) ? config : config.target);
            const shortHandProp = shorthandConfig[0];
            if (typeof shortHandProp === "string") {
                pathTokens.splice(-1, 1, shortHandProp);
            }
            else {
                pathTokens.splice(-1, 1, ...shortHandProp);
            }
            assignToTarget(parent, shorthandConfig[1], pathTokens, options);
        });
    }
    const { arrayMergeStyle = "push", objectMergeStyle = "assign", allowTransformMerging = false, reverseTransformPush = false, } = options;
    let prop;
    let props = Array.isArray(config) ? config : config.target;
    if (props.length === 0) {
        Object.assign(parent, value);
        return;
    }
    for (let index = 0; index < props.length - 1; index++) {
        prop = props[index];
        if (Array.isArray(parent) && isFinite(Number(prop))) {
            prop = Number(prop);
        }
        if (typeof parent[prop] !== "object") {
            parent[prop] = {};
        }
        else if (Object.isFrozen(parent[prop])) {
            parent[prop] = Object.assign({}, parent[prop]);
        }
        parent = parent[prop];
    }
    prop = props[props.length - 1];
    if (allowTransformMerging && exports.transformKeys.has(prop)) {
        let existing;
        if (!Array.isArray(parent.transform)) {
            parent.transform = [];
        }
        else {
            existing = parent.transform.find((t) => prop in t);
        }
        if (existing) {
            existing[prop] = value;
        }
        else {
            if (reverseTransformPush) {
                parent.transform.shift({ [prop]: value });
            }
            else {
                parent.transform.push({ [prop]: value });
            }
        }
    }
    else {
        const target = parent[prop];
        if (Array.isArray(target)) {
            switch (arrayMergeStyle) {
                case "push":
                    target.push(value);
            }
        }
        else if (typeof target === "object" &&
            target &&
            !(exports.PLACEHOLDER_SYMBOL in target)) {
            switch (objectMergeStyle) {
                case "assign": {
                    if (typeof value === "object") {
                        parent[prop] = Object.assign({}, parent[prop], value);
                    }
                    else {
                        parent[prop] = value;
                    }
                    break;
                }
                case "toArray": {
                    parent[prop] = [target, value];
                }
            }
        }
        else if (value &&
            typeof value === "object" &&
            !("_isReanimatedSharedValue" in value) &&
            !(exports.PLACEHOLDER_SYMBOL in value) &&
            !Array.isArray(value)) {
            parent[prop] = Object.assign({}, value);
        }
        else {
            parent[prop] = value;
        }
    }
}
function getTargetValue(parent, props) {
    let prop;
    props = typeof props === "string" ? [props] : props;
    for (let index = 0; index < props.length - 1; index++) {
        prop = props[index];
        if (Array.isArray(parent) && isFinite(Number(prop))) {
            prop = Number(prop);
        }
        if (typeof parent[prop] !== "object") {
            parent[prop] = {};
        }
        parent = parent[prop];
    }
    prop = props[props.length - 1];
    if (exports.transformKeys.has(prop)) {
        let existing;
        if (!Array.isArray(parent.transform)) {
            parent.transform = [];
        }
        else {
            existing = parent.transform.find((t) => prop in t);
        }
        return existing?.[prop];
    }
    else {
        return parent[prop];
    }
}
exports.SpecificityIndex = {
    Order: 0,
    ClassName: 1,
    Important: 2,
    Inline: 3,
    PseudoElements: 4,
};
exports.inlineSpecificity = [];
exports.inlineSpecificity[exports.SpecificityIndex.Inline] = 1;
exports.transformKeys = new Set([
    "translateX",
    "translateY",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "skewX",
    "skewY",
    "perspective",
    "matrix",
    "transformOrigin",
]);
//# sourceMappingURL=shared.js.map