"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interop = interop;
const react_1 = require("react");
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
const conditions_1 = require("./conditions");
const globals_1 = require("./globals");
const render_component_1 = require("./render-component");
const resolve_value_1 = require("./resolve-value");
const styles_1 = require("./styles");
function interop(component, configs, originalProps, ref) {
    const inheritedVariables = (0, react_1.useContext)(styles_1.VariableContext);
    const inheritedContainers = (0, react_1.useContext)(globals_1.containerContext);
    const props = { ...originalProps };
    const sharedState = (0, react_1.useState)({
        initialRender: true,
        originalProps,
        props: {},
        canUpgradeWarn: false,
        animated: render_component_1.UpgradeState.NONE,
        containers: render_component_1.UpgradeState.NONE,
        variables: render_component_1.UpgradeState.NONE,
        pressable: render_component_1.UpgradeState.NONE,
    })[0];
    const refs = {
        sharedState,
        containers: inheritedContainers,
        props,
        variables: inheritedVariables,
    };
    function reducer(state, action) {
        switch (action.type) {
            case "rerender-declarations":
            case "new-declarations":
                const nextState = getDeclarations(state, refs, action);
                return Object.is(nextState, state)
                    ? state
                    : applyStyles(nextState, refs);
            case "styles":
                return applyStyles(state, refs);
        }
    }
    const states = [];
    for (const config of configs) {
        const [state, dispatch] = (0, react_1.useReducer)(reducer, {
            dispatch: (action) => dispatch(action),
            reducer,
            config,
            className: props?.[config.source],
        }, initReducer);
        if (!sharedState.initialRender) {
            if (state.declarationTracking.guards.some((guard) => guard(refs))) {
                dispatch({
                    type: "new-declarations",
                    className: props?.[config.source],
                });
            }
            else if (state.styleTracking.guards.some((guard) => guard(refs))) {
                dispatch({ type: "styles" });
            }
        }
        states.push(state);
        delete props?.[state.config.source];
    }
    const memoOutput = (0, react_1.useMemo)(() => {
        let variables = undefined;
        let containers = {};
        const possiblyAnimatedProps = {};
        const handlers = {};
        let hasNullContainer = false;
        for (const state of states) {
            Object.assign(possiblyAnimatedProps, state.props);
            if (state.variables) {
                variables ||= {};
                Object.assign(variables, state.variables);
            }
            if (state.containerNames !== undefined) {
                if (state.containerNames === false) {
                    hasNullContainer = true;
                }
                else if (!hasNullContainer) {
                    for (const container of state.containerNames) {
                        containers[container] = sharedState;
                    }
                    containers[shared_1.DEFAULT_CONTAINER_NAME] = sharedState;
                }
            }
        }
        if (sharedState.active) {
            handlers.onPressIn = (event) => {
                sharedState.originalProps?.onPressIn?.(event);
                sharedState.active.set(true);
            };
            handlers.onPressOut = (event) => {
                sharedState.originalProps?.onPressOut?.(event);
                sharedState.active.set(false);
            };
        }
        if (sharedState.hover) {
            handlers.onHoverIn = (event) => {
                sharedState.originalProps?.onHoverIn?.(event);
                sharedState.hover.set(true);
            };
            handlers.onHoverOut = (event) => {
                sharedState.originalProps?.onHoverOut?.(event);
                sharedState.hover.set(false);
            };
        }
        if (sharedState.focus) {
            handlers.onFocus = (event) => {
                sharedState.originalProps?.onFocus?.(event);
                sharedState.focus.set(true);
            };
            handlers.onBlur = (event) => {
                sharedState.originalProps?.onBlur?.(event);
                sharedState.focus.set(false);
            };
        }
        if (sharedState.active || sharedState.hover || sharedState.focus) {
            if (component === react_native_1.View) {
                sharedState.pressable ||= render_component_1.UpgradeState.SHOULD_UPGRADE;
            }
            handlers.onPress = (event) => {
                sharedState.originalProps?.onPress?.(event);
            };
        }
        if (sharedState.layout || sharedState.containers) {
            sharedState.layout ??= (0, observable_1.observable)([0, 0]);
            handlers.onLayout = (event) => {
                sharedState.originalProps?.onLayout?.(event);
                const layout = event.nativeEvent.layout;
                const prevLayout = sharedState.layout.get();
                if (layout.width !== prevLayout[0] || layout.height !== prevLayout[0]) {
                    sharedState.layout.set([layout.width, layout.height]);
                }
            };
        }
        return {
            possiblyAnimatedProps,
            handlers,
            variables,
            containers: sharedState.containers && !hasNullContainer ? containers : undefined,
        };
    }, states);
    const variables = (0, react_1.useMemo)(() => {
        return Object.assign({}, inheritedVariables instanceof Map
            ? Object.fromEntries(inheritedVariables.entries())
            : inheritedVariables, memoOutput.variables);
    }, [inheritedVariables, memoOutput.variables]);
    const containers = (0, react_1.useMemo)(() => {
        if (!memoOutput.containers) {
            return inheritedContainers;
        }
        return {
            ...inheritedContainers,
            ...memoOutput.containers,
        };
    }, [inheritedContainers, memoOutput.containers]);
    (0, react_1.useEffect)(() => {
        return () => {
            for (const state of states) {
                (0, observable_1.cleanupEffect)(state.declarationTracking.effect);
                (0, observable_1.cleanupEffect)(state.styleTracking.effect);
            }
        };
    }, []);
    sharedState.originalProps = originalProps;
    sharedState.initialRender = false;
    return (0, render_component_1.renderComponent)(component, sharedState, { ...props, ...memoOutput.handlers, ref }, memoOutput.possiblyAnimatedProps, variables, containers);
}
function initReducer({ dispatch, config, reducer, className, }) {
    return reducer({
        config,
        className,
        props: {},
        normal: [],
        important: [],
        currentRenderAnimation: {},
        declarationTracking: {
            effect: {
                dependencies: new Set(),
                run: () => dispatch({ type: "rerender-declarations" }),
            },
            guards: [],
        },
        styleTracking: {
            effect: {
                dependencies: new Set(),
                run: () => dispatch({ type: "styles" }),
            },
            guards: [],
        },
    }, { type: "new-declarations", className });
}
function getDeclarations(previousState, refs, action) {
    const config = previousState.config;
    (0, observable_1.cleanupEffect)(previousState.declarationTracking.effect);
    const state = {
        ...previousState,
        normal: [],
        important: [],
        currentRenderAnimation: {},
        containerNames: undefined,
        variables: undefined,
        inline: (0, resolve_value_1.getTarget)(refs.props, config),
        declarationTracking: {
            effect: previousState.declarationTracking.effect,
            guards: [],
            previous: refs.props?.[config.source],
        },
        transition: previousState.transition ? { ...defaultTransition } : undefined,
    };
    if (action.type === "new-declarations") {
        state.className = action.className;
    }
    state.declarationTracking.guards.push((refs) => !Object.is(refs.props?.[config.source], state.className) ||
        !Object.is((0, resolve_value_1.getTarget)(refs.props, config), state.inline));
    const normalRules = [];
    const importantRules = [];
    if (state.className) {
        for (const className of state.className.split(/\s+/)) {
            const ruleSet = (0, styles_1.getStyle)(className, state.declarationTracking.effect);
            if (!ruleSet) {
                continue;
            }
            handleUpgrades(refs.sharedState, ruleSet);
            collectRules(state, refs, ruleSet, normalRules, "n");
            collectRules(state, refs, ruleSet, importantRules, "i");
        }
    }
    if (config.inlineProp && refs.props?.[config.inlineProp]) {
        collectInlineRules(state, refs, refs.props[config.inlineProp], state.declarationTracking.effect, normalRules, importantRules);
    }
    state.normal = normalRules
        .filter(Boolean)
        .sort(specificityCompare)
        .flatMap((rule) => (shared_1.StyleRuleSymbol in rule ? rule.d : rule));
    state.important = importantRules
        .filter(Boolean)
        .sort(specificityCompare)
        .flatMap((rule) => (shared_1.StyleRuleSymbol in rule ? rule.d : rule));
    const areEqual = previousState.className === state.className &&
        previousState.inline === state.inline &&
        arraysAreEqual(previousState.normal, state.normal) &&
        arraysAreEqual(previousState.important, state.important) &&
        objectsAreEqual(previousState.variables, state.variables) &&
        containersAreEqual(previousState.containerNames, state.containerNames);
    return areEqual ? previousState : state;
}
function applyStyles(state, refs) {
    (0, observable_1.cleanupEffect)(state.styleTracking.effect);
    state = {
        ...state,
        props: {},
        styleTracking: { effect: state.styleTracking.effect, guards: [] },
    };
    const delayedValues = [];
    const seenAnimatedProps = new Set();
    applyRules(state, refs, state.normal, delayedValues);
    processAnimations(state, refs, seenAnimatedProps);
    applyRules(state, refs, state.important, delayedValues);
    for (const delayed of delayedValues) {
        delayed();
    }
    processTransition(state, refs, seenAnimatedProps);
    retainSharedValues(state, seenAnimatedProps);
    cleanup(state.props, state.config);
    return state;
}
function processAnimations(state, refs, seenAnimatedProps) {
    if (state.currentRenderAnimation?.name?.length) {
        state.sharedValues ??= new Map();
        state.animationNames ??= new Set();
        state.props ??= {};
        const props = state.props;
        const { name: animationNames, duration: durations = defaultAnimation.duration, delay: delays = defaultAnimation.delay, timingFunction: baseEasingFuncs = defaultAnimation.timingFunction, iterationCount: iterations = defaultAnimation.iterationCount, } = state.currentRenderAnimation;
        const { name: prevAnimationNames = [], duration: prevDurations = defaultAnimation.duration, delay: prevDelays = defaultAnimation.delay, timingFunction: prevBaseEasingFuncs = defaultAnimation.timingFunction, iterationCount: prevIterations = defaultAnimation.iterationCount, } = state.previousAnimation || {};
        const waitingLayout = state.isWaitingLayout;
        const { makeMutable, withRepeat, withSequence } = require("react-native-reanimated");
        let shouldResetAnimations = waitingLayout ||
            isDeepEqual(prevAnimationNames, animationNames) ||
            isDeepEqual(prevDurations, durations) ||
            isDeepEqual(prevDelays, delays) ||
            isDeepEqual(prevBaseEasingFuncs, baseEasingFuncs) ||
            isDeepEqual(prevIterations, iterations);
        let names = [];
        for (const name of animationNames) {
            if (name.type === "none") {
                resetAnimation(state);
                break;
            }
            names.push(name.value);
            if (state.animationNames.size === 0 ||
                !state.animationNames.has(name.value)) {
                shouldResetAnimations = true;
            }
        }
        if (shouldResetAnimations) {
            state.animationNames.clear();
            state.isWaitingLayout = false;
            for (let index = names.length - 1; index >= 0; index--) {
                const name = names[index % names.length];
                state.animationNames.add(name);
                const animation = (0, styles_1.getAnimation)(name, state.styleTracking.effect);
                if (!animation) {
                    continue;
                }
                const baseEasingFunc = baseEasingFuncs[index % baseEasingFuncs.length];
                const easingFuncs = animation.easingFunctions?.map((value) => {
                    return value.type === "!PLACEHOLDER!" ? baseEasingFunc : value;
                }) || baseEasingFunc;
                const totalDuration = (0, resolve_value_1.timeToMS)(durations[index % name.length]);
                const delay = (0, resolve_value_1.timeToMS)(delays[index % delays.length]);
                const iterationCount = iterations[index % iterations.length];
                for (const frame of animation.frames) {
                    const animationKey = frame[0];
                    const valueFrames = frame[1];
                    const pathTokens = ["style", animationKey];
                    if (seenAnimatedProps.has(animationKey))
                        continue;
                    seenAnimatedProps.add(animationKey);
                    const [initialValue, ...sequence] = (0, resolve_value_1.resolveAnimation)(state, refs, valueFrames, animationKey, delay, totalDuration, easingFuncs);
                    if (animation.requiresLayoutWidth || animation.requiresLayoutHeight) {
                        const needWidth = animation.requiresLayoutWidth &&
                            props.style?.width === undefined &&
                            (0, resolve_value_1.getWidth)(state, refs, state.styleTracking) === 0;
                        const needHeight = animation.requiresLayoutHeight &&
                            props.style?.height === undefined &&
                            (0, resolve_value_1.getHeight)(state, refs, state.styleTracking) === 0;
                        if (needWidth || needHeight) {
                            state.isWaitingLayout = true;
                        }
                    }
                    let sharedValue = state.sharedValues.get(animationKey);
                    if (!sharedValue) {
                        sharedValue = makeMutable(initialValue);
                        state.sharedValues.set(animationKey, sharedValue);
                    }
                    else {
                        sharedValue.value = initialValue;
                    }
                    sharedValue.value = withRepeat(withSequence(...sequence), iterationCount.type === "infinite" ? -1 : iterationCount.value);
                    (0, shared_1.assignToTarget)(props, sharedValue, pathTokens, {
                        allowTransformMerging: true,
                    });
                }
            }
        }
        else {
            for (const name of names) {
                const keyframes = (0, styles_1.getAnimation)(name, state.styleTracking.effect);
                if (!keyframes)
                    continue;
                for (const [animationKey] of keyframes.frames) {
                    (0, shared_1.assignToTarget)(props, state.sharedValues.get(animationKey), ["style", animationKey], {
                        allowTransformMerging: true,
                    });
                    seenAnimatedProps.add(animationKey);
                }
            }
        }
    }
    else if (state.animationNames?.size) {
        resetAnimation(state);
    }
}
function resetAnimation(state) {
    if (!state.animationNames)
        return;
    for (const name of state.animationNames) {
        const animation = (0, styles_1.getAnimation)(name, state.styleTracking.effect);
        if (!animation) {
            continue;
        }
        state.sharedValues ??= new Map();
        const { cancelAnimation } = require("react-native-reanimated");
        for (const [propertyName] of animation.frames) {
            let defaultValue = resolve_value_1.defaultValues[propertyName];
            if (typeof defaultValue === "function") {
                defaultValue = defaultValue(state.styleTracking.effect);
            }
            let sharedValue = state.sharedValues.get(propertyName);
            if (sharedValue) {
                cancelAnimation(sharedValue);
            }
        }
    }
}
function processTransition(state, refs, seenAnimatedProps) {
    if (!state.transition)
        return;
    state.sharedValues ??= new Map();
    state.props ??= {};
    const props = state.props;
    const { property: properties, duration: durations, delay: delays, timingFunction: easingFunctions, } = state.transition;
    const { makeMutable, withTiming, withDelay, Easing } = require("react-native-reanimated");
    if (properties.length === 0 || properties.includes("none")) {
        return;
    }
    for (let index = 0; index < properties.length; index++) {
        const property = properties[index];
        if (seenAnimatedProps.has(property))
            continue;
        let sharedValue = state.sharedValues.get(property);
        let { value, defaultValue } = (0, resolve_value_1.getBaseValue)(state, [property]);
        if (value === undefined && !sharedValue) {
            continue;
        }
        else if (refs.sharedState.initialRender) {
            const initialValue = value !== undefined ? value : defaultValue;
            sharedValue = makeMutable(initialValue);
            state.sharedValues.set(property, sharedValue);
        }
        else {
            if (!sharedValue) {
                sharedValue = makeMutable(defaultValue);
                state.sharedValues.set(property, sharedValue);
            }
            value ??= defaultValue;
            if (value !== sharedValue.value) {
                const duration = (0, resolve_value_1.timeToMS)(durations[index % durations.length]);
                const delay = (0, resolve_value_1.timeToMS)(delays[index % delays.length]);
                const easing = easingFunctions[index % easingFunctions.length];
                sharedValue.value = withDelay(delay, withTiming(value, {
                    duration,
                    easing: (0, resolve_value_1.getEasing)(easing, Easing),
                }));
            }
        }
        seenAnimatedProps.add(property);
        props.style ??= {};
        (0, shared_1.assignToTarget)(props.style, sharedValue, [property], {
            allowTransformMerging: true,
        });
    }
}
function retainSharedValues(state, seenAnimatedProps) {
    if (!state.sharedValues?.size)
        return;
    state.props ??= {};
    const props = state.props;
    for (const entry of state.sharedValues) {
        if (seenAnimatedProps.has(entry[0]))
            continue;
        let value = props.style?.[entry[0]] ??
            resolve_value_1.defaultValues[entry[0]];
        if (typeof value === "function") {
            value = value(state.styleTracking.effect);
        }
        entry[1].value = value;
        props.style ??= {};
        props.style?.[entry[0]] ??
            resolve_value_1.defaultValues[entry[0]];
        (0, shared_1.assignToTarget)(props.style, entry[1], [entry[0]], {
            allowTransformMerging: true,
        });
    }
}
function handleUpgrades(sharedState, ruleSet) {
    if (ruleSet.active) {
        sharedState.active ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:active`,
        });
    }
    if (ruleSet.hover) {
        sharedState.hover ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:hover`,
        });
    }
    if (ruleSet.focus) {
        sharedState.focus ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:focus`,
        });
    }
    if (ruleSet.animation)
        sharedState.animated ||= render_component_1.UpgradeState.SHOULD_UPGRADE;
    if (ruleSet.variables)
        sharedState.variables ||= render_component_1.UpgradeState.SHOULD_UPGRADE;
    if (ruleSet.container) {
        sharedState.containers ||= render_component_1.UpgradeState.SHOULD_UPGRADE;
        sharedState.active ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:active`,
        });
        sharedState.hover ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:hover`,
        });
        sharedState.focus ||= (0, observable_1.observable)(false, {
            name: `${ruleSet.classNames}:focus`,
        });
    }
}
function cleanup(props, config) {
    if (!config.nativeStyleToProp)
        return;
    for (let move of config.nativeStyleToProp) {
        const source = move[0];
        const target = (0, resolve_value_1.getTarget)(props, config);
        if (!target || !(source in target))
            continue;
        (0, shared_1.assignToTarget)(props, target[source], move[1], {
            allowTransformMerging: true,
        });
        delete target[source];
    }
    if (config.propToRemove) {
        delete props[config.propToRemove];
    }
}
function arraysAreEqual(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}
function objectsAreEqual(a, b) {
    return a && b && arraysAreEqual(Object.values(a), Object.values(b));
}
function containersAreEqual(a, b) {
    return a == b || (a && b && arraysAreEqual(a, b));
}
function applyRules(state, refs, declarations, delayedValues) {
    const props = state.props;
    for (const declaration of declarations) {
        if (Array.isArray(declaration)) {
            let [descriptor, pathTokens] = declaration;
            const assignToTargetPath = pathTokens === undefined
                ? state.config.target
                : typeof pathTokens === "string"
                    ? [...state.config.target, pathTokens]
                    : pathTokens.length === 0
                        ? [...state.config.target.slice(0, -1)]
                        : [...state.config.target.slice(0, -1), ...pathTokens];
            const castToArray = assignToTargetPath[assignToTargetPath.length - 1] === "transform";
            if (typeof descriptor === "object" && !Array.isArray(descriptor)) {
                (0, shared_1.assignToTarget)(props, descriptor, assignToTargetPath, {
                    allowTransformMerging: true,
                });
            }
            else {
                if (isDelayedDeclaration(declaration)) {
                    const uniquePlaceHolder = { [shared_1.PLACEHOLDER_SYMBOL]: true };
                    (0, shared_1.assignToTarget)(props, uniquePlaceHolder, assignToTargetPath, {
                        allowTransformMerging: true,
                    });
                    delayedValues.push(() => {
                        let currentValue = (0, shared_1.getTargetValue)(props, assignToTargetPath);
                        if (currentValue === uniquePlaceHolder) {
                            const value = (0, resolve_value_1.resolveValue)(state, refs, state.styleTracking, descriptor, (0, resolve_value_1.getTarget)(props, state.config), castToArray);
                            (0, shared_1.assignToTarget)(props, value, assignToTargetPath, {
                                allowTransformMerging: true,
                            });
                        }
                    });
                }
                else {
                    const value = (0, resolve_value_1.resolveValue)(state, refs, state.styleTracking, descriptor, (0, resolve_value_1.getTarget)(props, state.config), castToArray);
                    (0, shared_1.assignToTarget)(props, value, assignToTargetPath, {
                        allowTransformMerging: true,
                    });
                }
            }
        }
        else {
            (0, shared_1.assignToTarget)(props, { ...declaration }, state.config, {
                objectMergeStyle: "assign",
            });
        }
    }
}
function specificityCompare(o1, o2) {
    if (!o1)
        return -1;
    if (!o2)
        return 1;
    const aSpec = shared_1.StyleRuleSymbol in o1 ? o1.s : shared_1.inlineSpecificity;
    const bSpec = shared_1.StyleRuleSymbol in o2 ? o2.s : shared_1.inlineSpecificity;
    if (aSpec[shared_1.SpecificityIndex.Important] !== bSpec[shared_1.SpecificityIndex.Important]) {
        return ((aSpec[shared_1.SpecificityIndex.Important] || 0) -
            (bSpec[shared_1.SpecificityIndex.Important] || 0));
    }
    else if (aSpec[shared_1.SpecificityIndex.Inline] !== bSpec[shared_1.SpecificityIndex.Inline]) {
        return ((aSpec[shared_1.SpecificityIndex.Inline] || 0) -
            (bSpec[shared_1.SpecificityIndex.Inline] || 0));
    }
    else if (aSpec[shared_1.SpecificityIndex.PseudoElements] !==
        bSpec[shared_1.SpecificityIndex.PseudoElements]) {
        return ((aSpec[shared_1.SpecificityIndex.PseudoElements] || 0) -
            (bSpec[shared_1.SpecificityIndex.PseudoElements] || 0));
    }
    else if (aSpec[shared_1.SpecificityIndex.ClassName] !== bSpec[shared_1.SpecificityIndex.ClassName]) {
        return ((aSpec[shared_1.SpecificityIndex.ClassName] || 0) -
            (bSpec[shared_1.SpecificityIndex.ClassName] || 0));
    }
    else if (aSpec[shared_1.SpecificityIndex.Order] !== bSpec[shared_1.SpecificityIndex.Order]) {
        return ((aSpec[shared_1.SpecificityIndex.Order] || 0) -
            (bSpec[shared_1.SpecificityIndex.Order] || 0));
    }
    else {
        return 0;
    }
}
function collectRules(state, refs, ruleSet, collection, key) {
    const rules = ruleSet[key];
    if (!rules)
        return;
    for (const rule of rules) {
        if ((0, conditions_1.testRule)(rule, refs, state.declarationTracking)) {
            if (shared_1.StyleRuleSymbol in rule) {
                if (rule.animations) {
                    Object.assign(state.currentRenderAnimation, rule.animations);
                }
                if (rule.transition) {
                    state.transition ??= { ...defaultTransition };
                    Object.assign(state.transition, rule.transition);
                }
                if (rule.variables) {
                    for (const variable of rule.variables) {
                        state.variables ??= {};
                        state.variables[variable[0]] = (0, observable_1.observable)(variable[1]);
                    }
                }
                if (rule.container) {
                    state.containerNames = rule.container.names;
                }
                if (rule.d) {
                    collection.push(rule);
                }
            }
            else {
                collection.push(rule);
            }
        }
    }
}
function collectInlineRules(state, refs, target, effect, normal, important) {
    if (Array.isArray(target)) {
        for (const t of target) {
            collectInlineRules(state, refs, t, effect, normal, important);
        }
    }
    else if (target) {
        const styles = (0, styles_1.getOpaqueStyles)(target, effect);
        for (const style of styles) {
            if (!style) {
                continue;
            }
            if (shared_1.StyleRuleSetSymbol in style) {
                const ruleSet = style;
                handleUpgrades(refs.sharedState, ruleSet);
                collectRules(state, refs, ruleSet, normal, "n");
                collectRules(state, refs, ruleSet, important, "i");
            }
            else {
                normal.push(style);
            }
        }
    }
}
const defaultAnimation = {
    name: [],
    direction: ["normal"],
    fillMode: ["none"],
    iterationCount: [{ type: "number", value: 1 }],
    timingFunction: [{ type: "linear" }],
    playState: ["running"],
    duration: [{ type: "seconds", value: 0 }],
    delay: [{ type: "seconds", value: 0 }],
    timeline: [{ type: "none" }],
};
const defaultTransition = {
    property: [],
    duration: [{ type: "seconds", value: 0 }],
    delay: [{ type: "seconds", value: 0 }],
    timingFunction: [{ type: "linear" }],
};
function isDeepEqual(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (Array.isArray(a)) {
        return (a.length === b.length &&
            a.every((aValue, index) => isDeepEqual(aValue, b[index])));
    }
    else if (typeof a === "object" && a && b) {
        return isDeepEqual(Object.entries(a), Object.entries(b));
    }
    return a === b;
}
function isDelayedDeclaration(declaration) {
    return declaration[2] === 1;
}
//# sourceMappingURL=native-interop.js.map