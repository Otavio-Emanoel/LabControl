"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRule = testRule;
exports.testMediaQueries = testMediaQueries;
exports.testMediaQuery = testMediaQuery;
exports.testPseudoClasses = testPseudoClasses;
exports.testContainerQuery = testContainerQuery;
exports.testCondition = testCondition;
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const appearance_observables_1 = require("./appearance-observables");
const unit_observables_1 = require("./unit-observables");
function testRule(rule, refs, tracking) {
    if (rule.pseudoClasses &&
        !testPseudoClasses(refs.sharedState, rule.pseudoClasses, tracking)) {
        return false;
    }
    if (rule.media && !testMediaQueries(refs.sharedState, tracking, rule.media)) {
        return false;
    }
    if (rule.containerQuery &&
        !testContainerQuery(refs, tracking, rule.containerQuery)) {
        return false;
    }
    if (rule.attrs && !testAttributes(refs, tracking, rule.attrs)) {
        return false;
    }
    return true;
}
function testMediaQueries(state, tracking, mediaQueries) {
    return mediaQueries.every((query) => testMediaQuery(tracking, query));
}
function testMediaQuery(tracking, mediaQuery, conditionReference = {
    width: unit_observables_1.vw,
    height: unit_observables_1.vh,
}) {
    const pass = mediaQuery.mediaType !== "print" &&
        testCondition(mediaQuery.condition, conditionReference, tracking);
    return mediaQuery.qualifier === "not" ? !pass : pass;
}
function testPseudoClasses(state, meta, tracking) {
    let passing = true;
    if (meta.hover && state.hover && passing) {
        passing = state.hover.get(tracking?.effect);
    }
    if (meta.active && state.active && passing) {
        passing = state.active.get(tracking?.effect);
    }
    if (meta.focus && state.focus && passing) {
        passing = state.focus.get(tracking?.effect);
    }
    return passing;
}
function testContainerQuery(refs, tracking, containerQuery) {
    if (!containerQuery || containerQuery.length === 0) {
        return true;
    }
    return containerQuery.every((query) => {
        const container = getContainer(query, refs);
        const result = testContainer(query, container, tracking);
        tracking.guards.push((nextRefs) => {
            const nextContainer = getContainer(query, nextRefs);
            const nextResult = testContainer(query, nextContainer);
            return container !== nextContainer || result !== nextResult;
        });
        return result;
    });
}
function getContainer(query, refs) {
    return query.name
        ? refs.containers[query.name]
        : refs.containers[shared_1.DEFAULT_CONTAINER_NAME];
}
function testContainer(query, container, tracking) {
    if (!container)
        return false;
    if (query.pseudoClasses &&
        !testPseudoClasses(container, query.pseudoClasses, tracking)) {
        return false;
    }
    if (query.attrs &&
        !testContainerAttributes(container.originalProps, query.attrs)) {
        return false;
    }
    if (!query.condition)
        return true;
    const layout = container.layout?.get(tracking?.effect);
    if (!layout)
        return false;
    return testCondition(query.condition, {
        width: layout[0],
        height: layout[1],
    }, tracking);
}
function testContainerAttributes(props, conditions) {
    for (const condition of conditions) {
        const attrValue = condition.type === "data-attribute"
            ? props?.["dataSet"]?.[condition.name]
            : props?.[condition.name];
        if (!testAttribute(attrValue, condition)) {
            return false;
        }
    }
    return true;
}
function testCondition(condition, conditionReference, tracking) {
    if (!condition)
        return true;
    if (condition.type === "operation") {
        if (condition.operator === "and") {
            return condition.conditions.every((c) => {
                return testCondition(c, conditionReference, tracking);
            });
        }
        else {
            return condition.conditions.some((c) => {
                return testCondition(c, conditionReference, tracking);
            });
        }
    }
    else if (condition.type === "not") {
        return !testCondition(condition.value, conditionReference, tracking);
    }
    else if (condition.type === "style") {
        return false;
    }
    return testFeature(condition.value, conditionReference, tracking);
}
function testFeature(feature, conditionReference, tracking) {
    switch (feature.type) {
        case "plain":
            return testPlainFeature(feature, conditionReference, tracking);
        case "range":
            return testRange(feature, conditionReference, tracking);
        case "boolean":
            return testBoolean(feature, tracking);
        case "interval":
            return false;
        default:
            feature;
    }
    return false;
}
function testPlainFeature(feature, ref, tracking) {
    const value = getMediaFeatureValue(feature.value, tracking);
    if (value === null) {
        return false;
    }
    switch (feature.name) {
        case "resolution":
            return value === react_native_1.PixelRatio.get();
        case "display-mode":
            return value === "native" || react_native_1.Platform.OS === value;
        case "prefers-color-scheme":
            return appearance_observables_1.colorScheme.get(tracking?.effect) === value;
        case "width":
            return testComparison("equal", ref.width, value, tracking);
        case "min-width":
            return testComparison("greater-than-equal", ref.width, value, tracking);
        case "max-width":
            return testComparison("less-than-equal", ref.width, value, tracking);
        case "height":
            return testComparison("equal", ref.height, value, tracking);
        case "min-height":
            return testComparison("greater-than-equal", ref.height, value, tracking);
        case "max-height":
            return testComparison("less-than-equal", ref.height, value, tracking);
        case "orientation":
            switch (value) {
                case "landscape":
                    return testComparison("less-than", ref.height, ref.width, tracking);
                case "portrait":
                    return testComparison("greater-than-equal", ref.height, ref.width, tracking);
            }
        default:
            return false;
    }
}
function getMediaFeatureValue(value, tracking) {
    switch (value.type) {
        case "number":
            return value.value;
        case "length":
            if (value.value.type === "value") {
                const length = value.value.value;
                switch (length.unit) {
                    case "px":
                        return length.value;
                    case "rem":
                        return length.value * unit_observables_1.rem.get(tracking?.effect);
                    default:
                        return null;
                }
            }
            else {
                return null;
            }
        case "ident":
            return value.value;
        case "resolution":
            switch (value.value.type) {
                case "dpi":
                    return value.value.value / 160;
                case "dpcm":
                    return value.value.value / (160 * 2.54);
                case "dppx":
                    return value.value.value;
                default:
                    value.value;
            }
        case "boolean":
        case "integer":
        case "ratio":
        case "env":
            return null;
        default:
            value;
    }
}
function testRange(feature, ref, tracking) {
    const value = getMediaFeatureValue(feature.value, tracking);
    if (value === null || typeof value !== "number") {
        return false;
    }
    switch (feature.name) {
        case "height":
            return testComparison(feature.operator, ref.height, value, tracking);
        case "width":
            return testComparison(feature.operator, ref.width, value, tracking);
        case "resolution":
            return testComparison(feature.operator, react_native_1.PixelRatio.get(), value);
        default:
            return false;
    }
}
function testComparison(comparison, ref, value, tracking) {
    ref = unwrap(ref, tracking?.effect);
    value = unwrap(value, tracking?.effect);
    if (typeof value !== "number")
        return false;
    switch (comparison) {
        case "equal":
            return ref === value;
        case "greater-than":
            return ref > value;
        case "greater-than-equal":
            return ref >= value;
        case "less-than":
            return ref < value;
        case "less-than-equal":
            return ref < value;
    }
}
function testBoolean(feature, tracking) {
    switch (feature.name) {
        case "prefers-reduced-motion":
            return appearance_observables_1.isReduceMotionEnabled.get(tracking?.effect);
        case "ltr":
            return react_native_1.I18nManager.isRTL === false;
        case "rtl":
            return react_native_1.I18nManager.isRTL;
    }
    return false;
}
function unwrap(value, effect) {
    return value && typeof value === "object" && "get" in value
        ? value.get(effect)
        : value;
}
function testAttributes(refs, tracking, conditions) {
    for (const condition of conditions) {
        const props = refs.props;
        const attrValue = condition.type === "data-attribute"
            ? props?.["dataSet"]?.[condition.name]
            : props?.[condition.name];
        tracking.guards.push((nextRefs) => {
            const nextValue = condition.type === "data-attribute"
                ? nextRefs.props?.["dataSet"]?.[condition.name]
                : nextRefs.props?.[condition.name];
            return attrValue !== nextValue;
        });
        if (!testAttribute(attrValue, condition)) {
            return false;
        }
    }
    return true;
}
function testAttribute(propValue, condition) {
    const operation = condition.operation;
    if (operation == null)
        return propValue != null;
    switch (operation.operator) {
        case "empty": {
            return propValue == null || propValue == "";
        }
        case "truthy": {
            return Boolean(propValue);
        }
        case "dash-match":
        case "prefix":
        case "substring":
        case "suffix":
            return false;
        case "includes":
            return propValue?.toString().includes(operation.value);
        case "equal": {
            return propValue?.toString() == operation.value;
        }
    }
}
//# sourceMappingURL=conditions.js.map