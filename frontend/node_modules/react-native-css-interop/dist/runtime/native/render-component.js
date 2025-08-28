"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeState = void 0;
exports.renderComponent = renderComponent;
const react_1 = require("react");
const react_native_1 = require("react-native");
const globals_1 = require("./globals");
const styles_1 = require("./styles");
const animatedCache = new Map();
exports.UpgradeState = {
    NONE: 0,
    SHOULD_UPGRADE: 1,
    UPGRADED: 2,
    WARNED: 3,
};
function renderComponent(baseComponent, state, props, possiblyAnimatedProps, variables, containers) {
    let component = baseComponent;
    const shouldWarn = state.canUpgradeWarn;
    if (props?.testID?.startsWith("debugClassName")) {
        console.log(`Debugging component.testID '${props?.testID}'\n\n${JSON.stringify({
            originalProps: state.originalProps,
            props: state.animated
                ? {
                    ...props,
                    ...possiblyAnimatedProps,
                }
                : { ...props, ...possiblyAnimatedProps },
            variables,
            containers,
        }, getDebugReplacer(), 2)}`);
    }
    if (state.pressable !== exports.UpgradeState.NONE) {
        if (process.env.NODE_ENV !== "production") {
            if (shouldWarn && state.pressable === exports.UpgradeState.SHOULD_UPGRADE) {
                printUpgradeWarning(`Converting View to Pressable should only happen during the initial render otherwise it will remount the View.\n\nTo prevent this warning avoid adding styles which use pseudo-classes (e.g :hover, :active, :focus) to View components after the initial render, or change the View to a Pressable`, state.originalProps);
            }
        }
        component = react_native_1.Pressable;
        state.pressable = exports.UpgradeState.UPGRADED;
        props.cssInterop = false;
    }
    if (state.animated !== exports.UpgradeState.NONE) {
        if (shouldWarn && state.animated === exports.UpgradeState.SHOULD_UPGRADE) {
            if (process.env.NODE_ENV !== "production") {
                printUpgradeWarning(`Components need to be animated during the initial render otherwise they will remount.\n\nTo prevent this warning avoid dynamically adding animation/transition styles to components after the initial render, or add a default style that sets "animation: none"/"transition-property: none"`, state.originalProps);
            }
        }
        else {
            state.animated = exports.UpgradeState.UPGRADED;
            component = createAnimatedComponent(component);
            const { useAnimatedStyle } = require("react-native-reanimated");
            props.style = useAnimatedStyle(() => {
                function flattenAnimatedProps(style) {
                    if (typeof style !== "object" || !style)
                        return style;
                    if ("_isReanimatedSharedValue" in style && "value" in style) {
                        return style.value;
                    }
                    if (Array.isArray(style))
                        return style.map(flattenAnimatedProps);
                    return Object.fromEntries(Object.entries(style).map(([key, value]) => {
                        return [key, flattenAnimatedProps(value)];
                    }));
                }
                try {
                    return flattenAnimatedProps(possiblyAnimatedProps.style) || {};
                }
                catch (error) {
                    console.log(`css-interop error: ${error.message}`);
                    return {};
                }
            }, [possiblyAnimatedProps.style]);
        }
    }
    else {
        props = { ...props, ...possiblyAnimatedProps };
    }
    if (state.variables !== exports.UpgradeState.NONE) {
        if (process.env.NODE_ENV !== "production") {
            if (shouldWarn && state.variables === exports.UpgradeState.SHOULD_UPGRADE) {
                printUpgradeWarning(`Components need to set a variable during the initial render otherwise they will remount.\n\nTo prevent this warning avoid dynamically adding CSS variables components after the initial render, or ensure it has a default style that sets either a CSS variable`, state.originalProps);
            }
        }
        state.variables = exports.UpgradeState.UPGRADED;
        props = {
            value: variables,
            children: (0, react_1.createElement)(component, props),
        };
        component = styles_1.VariableContext.Provider;
    }
    if (state.containers !== exports.UpgradeState.NONE) {
        if (process.env.NODE_ENV !== "production") {
            if (shouldWarn && state.containers === exports.UpgradeState.SHOULD_UPGRADE) {
                printUpgradeWarning(`Components need to marked as a container during the initial render otherwise they will remount.\n\nTo prevent this warning avoid dynamically container styles to a component after the initial render, or ensure it has a default style that sets "container: none" or "container-type: none"`, state.originalProps);
            }
        }
        state.containers = exports.UpgradeState.UPGRADED;
        props = {
            value: containers,
            children: (0, react_1.createElement)(component, props),
        };
        component = globals_1.containerContext.Provider;
    }
    state.canUpgradeWarn = process.env.NODE_ENV !== "production";
    return (0, react_1.createElement)(component, props);
}
function createAnimatedComponent(Component) {
    if (animatedCache.has(Component)) {
        return animatedCache.get(Component);
    }
    else if (Component.displayName?.startsWith("AnimatedComponent")) {
        return Component;
    }
    if (!(typeof Component !== "function" ||
        (Component.prototype && Component.prototype.isReactComponent))) {
        throw new Error(`Looks like you're passing an animation style to a function component \`${Component.name}\`. Please wrap your function component with \`React.forwardRef()\` or use a class component instead.`);
    }
    const { default: Animated } = require("react-native-reanimated");
    const AnimatedComponent = Animated.createAnimatedComponent(Component);
    AnimatedComponent.displayName = `Animated.${Component.displayName || Component.name || "Unknown"}`;
    animatedCache.set(Component, AnimatedComponent);
    return AnimatedComponent;
}
function printUpgradeWarning(warning, originalProps) {
    console.log(`CssInterop upgrade warning.\n\n${warning}.\n\nThis warning was caused by a component with the props:\n${stringify(originalProps)}\n\nIf adding or removing sibling components caused this warning you should add a unique "key" prop to your components. https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key\n`);
}
function stringify(object) {
    const seen = new WeakSet();
    return JSON.stringify(object, function replace(_, value) {
        if (!(value !== null && typeof value === "object")) {
            return value;
        }
        if (seen.has(value)) {
            return "[Circular]";
        }
        seen.add(value);
        const newValue = Array.isArray(value) ? [] : {};
        for (const entry of Object.entries(value)) {
            newValue[entry[0]] = replace(entry[0], entry[1]);
        }
        seen.delete(value);
        return newValue;
    }, 2);
}
function getDebugReplacer() {
    const seen = new WeakSet();
    return (_, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular]";
            }
            seen.add(value);
            if ("_isReanimatedSharedValue" in value && "value" in value) {
                return `${value.value} (animated value)`;
            }
            if ("get" in value && typeof value.get === "function") {
                return value.get();
            }
        }
        else if (typeof value === "function") {
            return value.name ? `[Function ${value.name}]` : "[Function]";
        }
        return value;
    };
}
//# sourceMappingURL=render-component.js.map