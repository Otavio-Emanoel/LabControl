"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSelectors = normalizeSelectors;
exports.toRNProperty = toRNProperty;
const shared_1 = require("../shared");
function normalizeSelectors(extractedStyle, selectorList, options, selectors = [], defaults = {}) {
    for (let cssSelector of selectorList) {
        if (isIsPseudoClass(cssSelector)) {
            normalizeSelectors(extractedStyle, cssSelector[0].selectors, options, selectors);
        }
        else if (isRootVariableSelector(cssSelector)) {
            if (isDarkModeMediaQuery(extractedStyle.media?.[0])) {
                selectors.push({
                    type: "rootVariables",
                    subtype: "dark",
                });
            }
            else {
                selectors.push({
                    type: "rootVariables",
                    subtype: "light",
                });
            }
        }
        else if (isRootDarkVariableSelector(cssSelector, options)) {
            selectors.push({
                type: "rootVariables",
                subtype: "dark",
            });
        }
        else if (isDefaultVariableSelector(cssSelector)) {
            if (isDarkModeMediaQuery(extractedStyle.media?.[0])) {
                selectors.push({
                    type: "universalVariables",
                    subtype: "dark",
                });
            }
            else {
                selectors.push({
                    type: "universalVariables",
                    subtype: "light",
                });
            }
        }
        else if (isDarkUniversalSelector(cssSelector, options)) {
            selectors.push({
                type: "universalVariables",
                subtype: "dark",
            });
        }
        else if (isDarkClassLegacySelector(cssSelector, options)) {
            const [_, __, third, ...rest] = cssSelector;
            normalizeSelectors(extractedStyle, [[third, ...rest]], options, selectors, {
                media: [
                    {
                        mediaType: "all",
                        condition: {
                            type: "feature",
                            value: {
                                type: "plain",
                                name: "prefers-color-scheme",
                                value: { type: "ident", value: "dark" },
                            },
                        },
                    },
                ],
            });
        }
        else if (isDarkClassSelector(cssSelector, options)) {
            const [first] = cssSelector;
            normalizeSelectors(extractedStyle, [[first]], options, selectors, {
                media: [
                    {
                        mediaType: "all",
                        condition: {
                            type: "feature",
                            value: {
                                type: "plain",
                                name: "prefers-color-scheme",
                                value: { type: "ident", value: "dark" },
                            },
                        },
                    },
                ],
            });
        }
        else {
            const selector = reduceSelector({
                ...defaults,
                type: "className",
                className: "",
                specificity: [],
            }, cssSelector, options);
            if (selector === null || !selector.className) {
                continue;
            }
            selectors.push(selector);
        }
    }
    return selectors;
}
function reduceSelector(acc, selectorComponents, options) {
    let previousType = "combinator";
    let inGroup = false;
    for (const component of selectorComponents) {
        switch (component.type) {
            case "universal":
            case "namespace":
            case "nesting":
            case "id":
            case "pseudo-element":
                return null;
            case "attribute": {
                if (!acc.groupClassName && !acc.className) {
                    if (component.name === "dir" &&
                        component.operation?.operator === "equal") {
                        acc.media ??= [];
                        acc.media.push({
                            mediaType: "all",
                            condition: {
                                type: "feature",
                                value: {
                                    type: "boolean",
                                    name: component.operation.value,
                                },
                            },
                        });
                    }
                    else {
                        return null;
                    }
                    break;
                }
                acc.specificity[shared_1.SpecificityIndex.ClassName] =
                    (acc.specificity[shared_1.SpecificityIndex.ClassName] ?? 0) + 1;
                let attrs;
                if (inGroup) {
                    acc.groupAttrs ??= [];
                    attrs = acc.groupAttrs;
                }
                else {
                    acc.attrs ??= [];
                    attrs = acc.attrs;
                }
                if (component.name.startsWith("data-")) {
                    attrs.push({
                        ...component,
                        name: toRNProperty(component.name.replace("data-", "")),
                        type: "data-attribute",
                    });
                }
                else {
                    attrs.push(component);
                }
                break;
            }
            case "type": {
                if (component.name !== options.selectorPrefix) {
                    return null;
                }
                break;
            }
            case "combinator": {
                if (component.value !== "descendant") {
                    return null;
                }
                inGroup = false;
                break;
            }
            case "class": {
                acc.specificity[shared_1.SpecificityIndex.ClassName] =
                    (acc.specificity[shared_1.SpecificityIndex.ClassName] ?? 0) + 1;
                switch (previousType) {
                    case "combinator": {
                        if (acc.className) {
                            return null;
                        }
                        else if (component.name === options.selectorPrefix?.slice(1)) {
                            break;
                        }
                        else {
                            const groupingValid = !acc.groupClassName &&
                                options.grouping.some((group) => {
                                    return group.test(component.name);
                                });
                            if (groupingValid) {
                                acc.groupClassName = component.name;
                                acc.groupPseudoClasses = acc.pseudoClasses;
                                acc.pseudoClasses = {};
                                inGroup = true;
                            }
                            else if (!acc.className) {
                                acc.className = component.name;
                            }
                            else {
                                return null;
                            }
                        }
                        break;
                    }
                    case "class": {
                        if (!inGroup) {
                            return null;
                        }
                        acc.groupAttrs ??= [];
                        acc.groupAttrs.push({
                            type: "attribute",
                            name: "className",
                            operation: { operator: "includes", value: component.name },
                        });
                        break;
                    }
                    default: {
                        return null;
                    }
                }
                break;
            }
            case "pseudo-class": {
                acc.specificity[shared_1.SpecificityIndex.ClassName] =
                    (acc.specificity[shared_1.SpecificityIndex.ClassName] ?? 0) + 1;
                let pseudoClasses;
                let attrs;
                if (component.kind === "is") {
                    if (isDarkUniversalSelector(component.selectors[0], options)) {
                        acc.media ??= [];
                        acc.media.push({
                            mediaType: "all",
                            condition: {
                                type: "feature",
                                value: {
                                    type: "plain",
                                    name: "prefers-color-scheme",
                                    value: { type: "ident", value: "dark" },
                                },
                            },
                        });
                        break;
                    }
                }
                switch (previousType) {
                    case "pseudo-class":
                    case "class": {
                        if (acc.className) {
                            acc.pseudoClasses ??= {};
                            pseudoClasses = acc.pseudoClasses;
                            acc.attrs ??= [];
                            attrs = acc.attrs;
                        }
                        else if (acc.groupClassName) {
                            acc.groupPseudoClasses ??= {};
                            pseudoClasses = acc.groupPseudoClasses;
                            acc.groupAttrs ??= [];
                            attrs = acc.groupAttrs;
                        }
                        else {
                            return null;
                        }
                        break;
                    }
                    default: {
                        return null;
                    }
                }
                switch (component.kind) {
                    case "hover":
                    case "active":
                    case "focus":
                        pseudoClasses ??= {};
                        pseudoClasses[component.kind] = true;
                        break;
                    case "disabled":
                        attrs ??= [];
                        attrs.push({
                            type: "attribute",
                            name: "disabled",
                            operation: { operator: "truthy" },
                        });
                        break;
                    case "empty":
                        attrs ??= [];
                        attrs.push({
                            type: "attribute",
                            name: "children",
                            operation: { operator: "empty" },
                        });
                        break;
                }
            }
        }
        previousType = component.type;
    }
    return acc;
}
function isIsPseudoClass(selector) {
    return (selector.length === 1 &&
        selector[0].type === "pseudo-class" &&
        selector[0].kind === "is");
}
function isDarkModeMediaQuery(query) {
    return Boolean(query?.condition &&
        query.condition.type === "feature" &&
        query.condition.value.type === "plain" &&
        query.condition.value.name === "prefers-color-scheme" &&
        query.condition.value.value.value === "dark");
}
function isDarkClassSelector([first, second, third], options) {
    if (options.darkMode?.type !== "class" || !options.darkMode.value) {
        return false;
    }
    return (first &&
        second &&
        !third &&
        first.type === "class" &&
        second.type === "pseudo-class" &&
        second.kind === "is" &&
        second.selectors.length === 1 &&
        second.selectors[0].length === 3 &&
        second.selectors[0][0].type === "class" &&
        second.selectors[0][0].name === options.darkMode.value &&
        second.selectors[0][1].type === "combinator" &&
        second.selectors[0][1].value === "descendant" &&
        second.selectors[0][2].type === "universal");
}
function isDarkClassLegacySelector([first, second, third], options) {
    if (options.darkMode?.type !== "class" || !options.darkMode.value) {
        return false;
    }
    return (first &&
        second &&
        third &&
        first.type === "class" &&
        first.name === options.darkMode?.value &&
        second.type === "combinator" &&
        second.value === "descendant" &&
        third.type === "class");
}
function isRootVariableSelector([first, second]) {
    return (first && !second && first.type === "pseudo-class" && first.kind === "root");
}
function isDefaultVariableSelector([first, second]) {
    return first && !second && first.type === "universal";
}
function isRootDarkVariableSelector([first, second], options) {
    return (first &&
        second &&
        options.darkMode?.type === "class" &&
        ((first.type === "class" &&
            first.name === options.darkMode.value &&
            second.type === "pseudo-class" &&
            second.kind === "root") ||
            (first.type === "pseudo-class" &&
                first.kind === "root" &&
                second.type === "attribute" &&
                second.name === "class" &&
                second.operation &&
                second.operation.value === options.darkMode.value &&
                ["includes", "equal"].includes(second.operation.operator))));
}
function isDarkUniversalSelector([first, second, third], options) {
    return (options.darkMode?.type === "class" &&
        first &&
        second &&
        third &&
        first.type === "class" &&
        first.name === options.darkMode.value &&
        second.type === "combinator" &&
        second.value === "descendant" &&
        third.type === "universal");
}
function toRNProperty(str) {
    return str.replace(/^-rn-/, "").replace(/-./g, (x) => x[1].toUpperCase());
}
//# sourceMappingURL=normalize-selectors.js.map