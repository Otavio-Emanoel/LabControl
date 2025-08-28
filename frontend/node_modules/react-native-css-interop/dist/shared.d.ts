import type { SharedValue } from "react-native-reanimated";
import type { Placeholder, ShorthandResult } from "./runtime/native/types";
import { InteropComponentConfig, RuntimeStyle, RuntimeValueDescriptor, Specificity } from "./types";
export declare const INTERNAL_RESET: unique symbol;
export declare const INTERNAL_SET: unique symbol;
export declare const INTERNAL_FLAGS: unique symbol;
export declare const StyleRuleSetSymbol: unique symbol;
export declare const StyleRuleSymbol: unique symbol;
export declare const PLACEHOLDER_SYMBOL: unique symbol;
export declare const DEFAULT_CONTAINER_NAME = "@__";
export declare const STYLE_SCOPES: {
    GLOBAL: number;
    CONTEXT: number;
    SELF: number;
};
export declare function isDescriptorFunction(value: RuntimeValueDescriptor | RuntimeValueDescriptor[]): value is Extract<RuntimeValueDescriptor, [{}, ...any[]]>;
export declare function isDescriptorArray(value: RuntimeValueDescriptor | RuntimeValueDescriptor[]): value is RuntimeValueDescriptor[];
export declare function isRuntimeDescriptor(value: RuntimeStyle): value is RuntimeValueDescriptor;
type ArrayMergeStyles = "push";
type ObjectMergeStyles = "assign" | "toArray";
export declare function assignToTarget(parent: Record<string, any>, value: Record<string, unknown> | RuntimeValueDescriptor | SharedValue<any> | ShorthandResult | Placeholder, config: InteropComponentConfig | string[], options?: {
    arrayMergeStyle?: ArrayMergeStyles;
    objectMergeStyle?: ObjectMergeStyles;
    allowTransformMerging?: boolean;
    reverseTransformPush?: boolean;
}): void[] | undefined;
export declare function getTargetValue(parent: Record<string, any>, props: string | string[]): any;
export declare const SpecificityIndex: {
    Order: number;
    ClassName: number;
    Important: number;
    Inline: number;
    PseudoElements: number;
};
export declare const inlineSpecificity: Specificity;
export declare const transformKeys: Set<string>;
export {};
