"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssToReactNativeRuntime = cssToReactNativeRuntime;
const node_process_1 = require("node:process");
const debug_1 = require("debug");
const lightningcss_1 = require("lightningcss");
const shared_1 = require("../shared");
const feature_flags_1 = require("./feature-flags");
const normalize_selectors_1 = require("./normalize-selectors");
const parseDeclaration_1 = require("./parseDeclaration");
function cssToReactNativeRuntime(code, options = {}, debug = (0, debug_1.debug)("react-native-css-interop")) {
    const features = Object.assign({}, feature_flags_1.defaultFeatureFlags, options.features);
    debug(`Features ${JSON.stringify(features)}`);
    if (Number(node_process_1.versions.node.split(".")[0]) < 18) {
        throw new Error("react-native-css-interop only supports NodeJS >18");
    }
    const grouping = options.grouping?.map((value) => {
        return typeof value === "string" ? new RegExp(value) : value;
    }) ?? [];
    debug(`Grouping ${grouping}`);
    const extractOptions = {
        darkMode: { type: "media" },
        rules: new Map(),
        keyframes: new Map(),
        rootVariables: {},
        universalVariables: {},
        flags: {},
        appearanceOrder: 1,
        ...options,
        features,
        grouping,
        varUsageCount: new Map(),
    };
    debug(`Start lightningcss`);
    const onVarUsage = (token) => {
        if (token.type === "function") {
            token.value.arguments.forEach((token) => onVarUsage(token));
        }
        else if (token.type === "var") {
            const variable = token.value;
            const varName = variable.name.ident;
            extractOptions.varUsageCount.set(varName, (extractOptions.varUsageCount.get(varName) || 0) + 1);
            if (variable.fallback) {
                const fallbackValues = variable.fallback;
                fallbackValues.forEach((varObj) => onVarUsage(varObj));
            }
        }
    };
    (0, lightningcss_1.transform)({
        filename: "style.css",
        code: typeof code === "string" ? new TextEncoder().encode(code) : code,
        visitor: {
            Declaration(decl) {
                if (decl.property !== "unparsed" && decl.property !== "custom")
                    return;
                decl.value.value.forEach((varObj) => onVarUsage(varObj));
            },
            StyleSheetExit(sheet) {
                debug(`Found ${sheet.rules.length} rules to process`);
                for (const rule of sheet.rules) {
                    extractRule(rule, extractOptions);
                }
                debug(`Exiting lightningcss`);
            },
        },
        customAtRules: {
            cssInterop: {
                prelude: "<custom-ident>+",
            },
            "rn-move": {
                prelude: "<custom-ident>+",
            },
        },
    });
    debug(`Found ${extractOptions.rules.size} valid rules`);
    let rules = {};
    let ruleCount = 0;
    for (const [name, styles] of extractOptions.rules) {
        if (styles.length === 0)
            continue;
        options.cache?.rules.set(name, styles);
        const styleRuleSet = { [shared_1.StyleRuleSetSymbol]: true };
        for (const { warnings, ...style } of styles) {
            if (style.s[shared_1.SpecificityIndex.Important]) {
                styleRuleSet.i ??= [];
                styleRuleSet.i.push(style);
            }
            else {
                styleRuleSet.n ??= [];
                styleRuleSet.n.push(style);
            }
            if (warnings) {
                styleRuleSet.warnings ??= [];
                styleRuleSet.warnings.push(...warnings);
            }
            if (style.variables)
                styleRuleSet.variables = true;
            if (style.container)
                styleRuleSet.container = true;
            if (style.animations)
                styleRuleSet.animation = true;
            if (style.transition)
                styleRuleSet.animation = true;
            if (style.pseudoClasses?.active)
                styleRuleSet.active = true;
            if (style.pseudoClasses?.hover)
                styleRuleSet.hover = true;
            if (style.pseudoClasses?.focus)
                styleRuleSet.focus = true;
        }
        rules[name] = styleRuleSet;
        ruleCount++;
    }
    const rem = extractOptions.inlineRem || extractOptions.rem;
    const keyframes = Array.from(extractOptions.keyframes);
    const rootVariables = extractOptions.rootVariables;
    const universalVariables = extractOptions.universalVariables;
    const flags = extractOptions.flags;
    const result = {
        $compiled: true,
        flags,
        rem,
    };
    if (ruleCount)
        result.rules = rules;
    if (keyframes.length)
        result.keyframes = keyframes;
    if (rootVariables && Object.keys(rootVariables).length) {
        result.rootVariables = rootVariables;
    }
    if (universalVariables && Object.keys(universalVariables).length) {
        result.universalVariables = universalVariables;
    }
    return result;
}
function extractRule(rule, extractOptions, partialStyle = {}) {
    switch (rule.type) {
        case "keyframes": {
            extractKeyFrames(rule.value, extractOptions);
            break;
        }
        case "container": {
            extractedContainer(rule.value, extractOptions);
            break;
        }
        case "media": {
            extractMedia(rule.value, extractOptions);
            break;
        }
        case "style": {
            if (rule.value.declarations) {
                for (const style of getExtractedStyles(rule.value.declarations, extractOptions, getRnMoveMapping(rule.value.rules))) {
                    setStyleForSelectorList({ ...partialStyle, ...style }, rule.value.selectors, extractOptions);
                }
                extractOptions.appearanceOrder++;
            }
            break;
        }
        case "custom": {
            if (rule.value && rule.value?.name === "cssInterop") {
                extractCSSInteropFlag(rule, extractOptions);
            }
        }
    }
}
function getRnMoveMapping(rules) {
    if (!rules)
        return {};
    const mapping = {};
    for (const rule of rules) {
        if (rule.type !== "custom" && rule.value.name !== "rn-move")
            continue;
        let [first, tokens] = rule.value.prelude.value.components.map((c) => c.value);
        if (tokens) {
            if (tokens.startsWith("&")) {
                mapping[(0, normalize_selectors_1.toRNProperty)(first)] = [
                    "style",
                    ...tokens.replace("&", "").split(".").map(normalize_selectors_1.toRNProperty),
                ];
            }
            else {
                mapping[(0, normalize_selectors_1.toRNProperty)(first)] = tokens.split(".").map(normalize_selectors_1.toRNProperty);
            }
        }
        else {
            if (first.startsWith("&")) {
                mapping["*"] = ["style", (0, normalize_selectors_1.toRNProperty)(first.replace("&", ""))];
            }
            else {
                mapping["*"] = [(0, normalize_selectors_1.toRNProperty)(first)];
            }
        }
    }
    return mapping;
}
function extractCSSInteropFlag(rule, extractOptions) {
    if (rule.value.prelude.value.components[0].value !== "set") {
        return;
    }
    const [_, name, type, ...other] = rule.value.prelude.value.components.map((c) => c.value);
    if (name === "darkMode") {
        let value;
        if (other.length === 0 || other[0] === "media") {
            extractOptions.darkMode = { type: "media" };
        }
        else {
            value = other[0];
            if (value.startsWith(".")) {
                value = value.slice(1);
                extractOptions.darkMode = { type: "class", value };
            }
            else if (value.startsWith("[")) {
                extractOptions.darkMode = { type: "attribute", value };
            }
            else if (value === "dark") {
                extractOptions.darkMode = { type: "class", value };
            }
        }
        extractOptions.flags.darkMode = `${type} ${value}`.trim();
    }
    else {
        const value = other.length === 0 ? "true" : other;
        extractOptions.flags[name] = value;
    }
}
function extractMedia(mediaRule, extractOptions) {
    const media = [];
    for (const mediaQuery of mediaRule.query.mediaQueries) {
        if ((mediaQuery.mediaType === "print" && mediaQuery.qualifier !== "not") ||
            (mediaQuery.mediaType !== "print" &&
                mediaQuery.qualifier === "not" &&
                mediaQuery.condition === null)) {
            continue;
        }
        media.push(mediaQuery);
    }
    if (media.length === 0) {
        return;
    }
    for (const rule of mediaRule.rules) {
        extractRule(rule, extractOptions, { media });
    }
}
function extractedContainer(containerRule, extractOptions) {
    for (const rule of containerRule.rules) {
        extractRule(rule, extractOptions, {
            containerQuery: [
                {
                    name: containerRule.name,
                    condition: containerRule.condition,
                },
            ],
        });
    }
}
function setStyleForSelectorList(extractedStyle, selectorList, options) {
    const { rules: declarations } = options;
    for (const selector of (0, normalize_selectors_1.normalizeSelectors)(extractedStyle, selectorList, options)) {
        const style = { ...extractedStyle };
        if (!style.d)
            continue;
        if (selector.type === "rootVariables" ||
            selector.type === "universalVariables") {
            const fontSizeValue = style.d.findLast(([value]) => {
                return typeof value === "object" && "fontSize" in value;
            })?.[0];
            if (typeof options.inlineRem !== "number" &&
                fontSizeValue &&
                typeof fontSizeValue === "object" &&
                "fontSize" in fontSizeValue &&
                typeof fontSizeValue["fontSize"] === "number") {
                options.rem = fontSizeValue["fontSize"];
                if (options.inlineRem === undefined) {
                    options.inlineRem = options.rem;
                }
            }
            if (!style.variables) {
                continue;
            }
            const { type, subtype } = selector;
            const record = (options[type] ??= {});
            for (const [name, value] of style.variables) {
                record[name] ??= {};
                record[name][subtype] = value;
            }
            continue;
        }
        else if (selector.type === "className") {
            const { className, groupClassName, pseudoClasses, groupPseudoClasses, attrs, groupAttrs, media, } = selector;
            const specificity = [];
            for (let index = 0; index < 5; index++) {
                const value = (extractedStyle.s[index] ?? 0) + (selector.specificity[index] ?? 0);
                if (value) {
                    specificity[index] = value;
                }
            }
            if (groupClassName) {
                addDeclaration(declarations, groupClassName, {
                    [shared_1.StyleRuleSymbol]: true,
                    s: specificity,
                    attrs,
                    d: [],
                    container: {
                        names: [groupClassName],
                    },
                });
                style.containerQuery ??= [];
                style.containerQuery.push({
                    name: groupClassName,
                    pseudoClasses: groupPseudoClasses,
                    attrs: groupAttrs,
                });
            }
            if (media) {
                style.media ??= [];
                style.media.push(...media);
            }
            const rule = {
                ...style,
                s: specificity,
            };
            if (pseudoClasses)
                rule.pseudoClasses = pseudoClasses;
            if (attrs)
                rule.attrs = attrs;
            addDeclaration(declarations, className, rule);
        }
    }
}
function addDeclaration(declarations, className, style) {
    const existing = declarations.get(className);
    if (existing) {
        existing.push(style);
    }
    else {
        declarations.set(className, [style]);
    }
}
function extractKeyFrames(keyframes, extractOptions) {
    const animation = { frames: [] };
    let rawFrames = [];
    for (const frame of keyframes.keyframes) {
        if (!frame.declarations.declarations)
            continue;
        const specificity = [];
        specificity[shared_1.SpecificityIndex.Important] = 2;
        specificity[shared_1.SpecificityIndex.ClassName] = 1;
        specificity[shared_1.SpecificityIndex.Order] = extractOptions.appearanceOrder;
        const { d: declarations, animations } = declarationsToStyle(frame.declarations.declarations, {
            ...extractOptions,
            requiresLayout(name) {
                if (name === "rnw") {
                    animation.requiresLayoutWidth = true;
                }
                else {
                    animation.requiresLayoutHeight = true;
                }
            },
        }, specificity, {});
        if (!declarations)
            continue;
        const values = declarations.filter((declaration) => declaration.length === 1 || typeof declaration[1] === "string");
        if (values.length === 0)
            continue;
        const easingFunction = animations?.timingFunction?.[0];
        for (const selector of frame.selectors) {
            const keyframe = selector.type === "percentage"
                ? selector.value * 100
                : selector.type === "from"
                    ? 0
                    : selector.type === "to"
                        ? 100
                        : undefined;
            if (keyframe === undefined)
                continue;
            switch (selector.type) {
                case "percentage":
                    rawFrames.push({ selector: selector.value, values, easingFunction });
                    break;
                case "from":
                    rawFrames.push({ selector: 0, values, easingFunction });
                    break;
                case "to":
                    rawFrames.push({ selector: 1, values, easingFunction });
                    break;
                case "timeline-range-percentage":
                    break;
                default:
                    selector;
            }
        }
    }
    rawFrames = rawFrames.sort((a, b) => a.selector - b.selector);
    const frames = {};
    const easingFunctions = [];
    for (let i = 0; i < rawFrames.length; i++) {
        const rawFrame = rawFrames[i];
        const progress = rawFrame.selector;
        if (rawFrame.easingFunction) {
            easingFunctions[i] = rawFrame.easingFunction;
        }
        for (const frameValue of rawFrame.values) {
            const [value, propOrPathTokens] = frameValue;
            if (Array.isArray(propOrPathTokens)) {
                continue;
            }
            if (propOrPathTokens) {
                const key = propOrPathTokens;
                if (!(0, shared_1.isRuntimeDescriptor)(value)) {
                    throw new Error("animation is an object?");
                }
                if (!frames[key]) {
                    frames[key] = [key, []];
                }
                frames[key][1].push({ value, progress });
            }
            else if (value && typeof value === "object" && !Array.isArray(value)) {
                for (const key in value) {
                    if (!frames[key]) {
                        frames[key] = [key, []];
                    }
                    frames[key][1].push({ value: value[key], progress });
                }
            }
        }
    }
    animation.frames = Object.values(frames).map((value) => {
        const valueFrames = value[1];
        if (valueFrames[0].progress !== 0) {
            valueFrames.unshift({ value: "!INHERIT!", progress: 0 });
        }
        if (valueFrames[valueFrames.length - 1].progress !== 1) {
            valueFrames.push({ value: "!INHERIT!", progress: 1 });
        }
        return value;
    });
    if (easingFunctions.length) {
        animation.easingFunctions = Array.from(easingFunctions).map((value) => {
            return value ?? { type: "!PLACEHOLDER!" };
        });
    }
    extractOptions.keyframes.set(keyframes.name.value, animation);
}
function getExtractedStyles(declarationBlock, options, mapping = {}) {
    const extractedStyles = [];
    const specificity = [];
    specificity[shared_1.SpecificityIndex.Order] = options.appearanceOrder;
    if (declarationBlock.declarations && declarationBlock.declarations.length) {
        extractedStyles.push(declarationsToStyle(declarationBlock.declarations, options, specificity, mapping));
    }
    if (declarationBlock.importantDeclarations &&
        declarationBlock.importantDeclarations.length) {
        specificity[shared_1.SpecificityIndex.Important] = 1;
        extractedStyles.push(declarationsToStyle(declarationBlock.importantDeclarations, options, specificity, mapping));
    }
    return extractedStyles;
}
function declarationsToStyle(declarations, options, specificity, mapping) {
    const styleDecls = [];
    let staticStyleDecl = undefined;
    const extractedStyle = {
        [shared_1.StyleRuleSymbol]: true,
        s: [...specificity],
        d: styleDecls,
    };
    function addStyleProp(attribute, value, moveTokens) {
        if (value === undefined) {
            return;
        }
        if (attribute.startsWith("--")) {
            if (!options.varUsageCount.has(attribute)) {
                return;
            }
            return addVariable(attribute, value);
        }
        attribute = (0, normalize_selectors_1.toRNProperty)(attribute);
        const attributeMapping = mapping[attribute] ?? mapping["*"];
        const shouldDelay = Array.isArray(value) && Boolean(value[3]);
        const pathTokens = !moveTokens && !attributeMapping
            ? attribute
            : [...(moveTokens || []), ...(attributeMapping || [])];
        if (typeof pathTokens === "string" &&
            !shared_1.transformKeys.has(pathTokens) &&
            !shouldDelay &&
            typeof value !== "object") {
            if (staticStyleDecl) {
                Object.assign(staticStyleDecl, { [pathTokens]: value });
            }
            else {
                staticStyleDecl = { [pathTokens]: value };
                styleDecls.push([staticStyleDecl]);
            }
        }
        else if (typeof pathTokens === "string") {
            if (shouldDelay) {
                styleDecls.push([value, pathTokens, 1]);
            }
            else {
                styleDecls.push([value, pathTokens]);
            }
        }
        else {
            if (shouldDelay) {
                styleDecls.push([value, pathTokens, 1]);
            }
            else {
                styleDecls.push([value, pathTokens]);
            }
        }
    }
    function addTransformProp(property, value) {
        return addStyleProp(property, value);
    }
    function handleTransformShorthand(name, options) {
        if (allEqual(...Object.values(options))) {
            return addStyleProp(name, Object.values(options)[0], ["transform", name]);
        }
        else {
            for (const [name, value] of Object.entries(options)) {
                addStyleProp(name, value, ["transform", name]);
            }
        }
    }
    function handleStyleShorthand(name, options) {
        if (allEqual(...Object.values(options))) {
            return addStyleProp(name, Object.values(options)[0]);
        }
        else {
            for (const [name, value] of Object.entries(options)) {
                addStyleProp(name, value);
            }
        }
    }
    function addVariable(property, value) {
        extractedStyle.variables ??= [];
        extractedStyle.variables.push([property, value]);
    }
    function addContainerProp(declaration) {
        let names = [shared_1.DEFAULT_CONTAINER_NAME];
        let type;
        switch (declaration.property) {
            case "container":
                if (declaration.value.name.type === "none") {
                    names = false;
                }
                else {
                    names = declaration.value.name.value;
                }
                type = declaration.value.containerType;
                break;
            case "container-name":
                if (declaration.value.type === "none") {
                    names = false;
                }
                else {
                    names = declaration.value.value;
                }
                break;
            case "container-type":
                type = declaration.value;
                break;
        }
        extractedStyle.container ??= {};
        if (names === false) {
            extractedStyle.container.names = false;
        }
        else if (Array.isArray(extractedStyle.container.names)) {
            extractedStyle.container.names = [
                ...new Set([...extractedStyle.container.names, ...names]),
            ];
        }
        else {
            extractedStyle.container.names = names;
        }
        if (type) {
            extractedStyle.container ??= {};
            extractedStyle.container.type = type;
        }
    }
    function addTransitionProp(declaration) {
        extractedStyle.transition ??= {};
        switch (declaration.property) {
            case "transition-property":
                extractedStyle.transition.property = [];
                for (const v of declaration.value) {
                    extractedStyle.transition.property.push((0, normalize_selectors_1.toRNProperty)(v.property));
                }
                break;
            case "transition-duration":
                extractedStyle.transition.duration = declaration.value;
                break;
            case "transition-delay":
                extractedStyle.transition.delay = declaration.value;
                break;
            case "transition-timing-function":
                extractedStyle.transition.timingFunction = declaration.value;
                break;
            case "transition": {
                let setProperty = true;
                let setDuration = true;
                let setDelay = true;
                let setTiming = true;
                if (extractedStyle.transition.property) {
                    setProperty = false;
                }
                else {
                    extractedStyle.transition.property = [];
                }
                if (extractedStyle.transition.duration) {
                    setDuration = false;
                }
                else {
                    extractedStyle.transition.duration = [];
                }
                if (extractedStyle.transition.delay) {
                    setDelay = false;
                }
                else {
                    extractedStyle.transition.delay = [];
                }
                if (extractedStyle.transition.timingFunction) {
                    setTiming = false;
                }
                else {
                    extractedStyle.transition.timingFunction = [];
                }
                for (const value of declaration.value) {
                    if (setProperty) {
                        extractedStyle.transition.property?.push((0, normalize_selectors_1.toRNProperty)(value.property.property));
                    }
                    if (setDuration) {
                        extractedStyle.transition.duration?.push(value.duration);
                    }
                    if (setDelay) {
                        extractedStyle.transition.delay?.push(value.delay);
                    }
                    if (setTiming) {
                        extractedStyle.transition.timingFunction?.push(value.timingFunction);
                    }
                }
                break;
            }
        }
    }
    function addAnimationProp(property, value) {
        if (property === "animation") {
            const groupedProperties = {};
            for (const animation of value) {
                for (const [key, value] of Object.entries(animation)) {
                    groupedProperties[key] ??= [];
                    groupedProperties[key].push(value);
                }
            }
            extractedStyle.animations ??= {};
            for (const [property, value] of Object.entries(groupedProperties)) {
                const key = property
                    .replace("animation-", "")
                    .replace(/-./g, (x) => x[1].toUpperCase());
                extractedStyle.animations[key] ??= value;
            }
        }
        else {
            const key = property
                .replace("animation-", "")
                .replace(/-./g, (x) => x[1].toUpperCase());
            extractedStyle.animations ??= {};
            extractedStyle.animations[key] = value;
        }
    }
    function addWarning(warning) {
        const warningRegexArray = options.ignorePropertyWarningRegex;
        if (warningRegexArray) {
            const match = warningRegexArray.some((regex) => new RegExp(regex).test(warning.property));
            if (match)
                return;
        }
        extractedStyle.warnings ??= [];
        extractedStyle.warnings.push(warning);
    }
    function requiresLayout(name) {
        if (name === "rnw") {
            extractedStyle.requiresLayoutWidth = true;
        }
        else {
            extractedStyle.requiresLayoutHeight = true;
        }
    }
    const parseDeclarationOptions = {
        features: {},
        addStyleProp,
        addTransformProp,
        handleStyleShorthand,
        handleTransformShorthand,
        addAnimationProp,
        addContainerProp,
        addTransitionProp,
        requiresLayout,
        addWarning,
        ...options,
    };
    for (const declaration of declarations) {
        (0, parseDeclaration_1.parseDeclaration)(declaration, parseDeclarationOptions);
    }
    return extractedStyle;
}
function allEqual(...params) {
    return params.every((param, index, array) => {
        return index === 0 ? true : equal(array[0], param);
    });
}
function equal(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (a === null || b === null)
        return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (!equal(a[i], b[i]))
                return false;
        }
        return true;
    }
    if (typeof a === "object" && typeof b === "object") {
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (const key in a) {
            if (!equal(a[key], b[key]))
                return false;
        }
        return true;
    }
    return false;
}
//# sourceMappingURL=index.js.map