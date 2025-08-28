import type { ExtractedAnimation, RemappedClassName, RuntimeValue, StyleRuleSet, StyleSheetRegisterCompiledOptions } from "../../types";
import { Effect, Observable } from "../observable";
import { cssVariableObservable } from "./appearance-observables";
export type InjectedStyleContextValue = {
    styles: Record<string, Observable<StyleRuleSet>>;
    animations: Record<string, ExtractedAnimation>;
    universalVariables: VariableContextValue;
};
export type VariableContextValue = Map<string, ReturnType<typeof cssVariableObservable> | number | string | RuntimeValue> | Record<string, ReturnType<typeof cssVariableObservable> | number | string | RuntimeValue>;
declare global {
    var __css_interop: {
        styles: Map<string, Observable<StyleRuleSet | undefined>>;
        keyframes: Map<string, Observable<ExtractedAnimation | undefined>>;
        rootVariables: Map<string, ReturnType<typeof cssVariableObservable>>;
        universalVariables: Map<string, ReturnType<typeof cssVariableObservable>>;
    };
}
export declare const opaqueStyles: WeakMap<object, StyleRuleSet | RemappedClassName>;
export declare const VariableContext: import("react").Context<VariableContextValue>;
export declare function getStyle(name: string, effect?: Effect): StyleRuleSet | undefined;
export declare function getOpaqueStyles(style: Record<string, any>, effect?: Effect): (StyleRuleSet | Record<string, any> | void)[];
export declare function getAnimation(name: string, effect: Effect): ExtractedAnimation | undefined;
export declare function getVariable(name: string, store?: VariableContextValue, effect?: Effect): import("../../types").RuntimeValueDescriptor | ((acc: import("../../types").PropAccumulator) => RuntimeValue);
export declare const getUniversalVariable: (name: string, effect: Effect) => import("../../types").RuntimeValueDescriptor | ((acc: import("../../types").PropAccumulator) => RuntimeValue);
export declare function resetData(): void;
export declare function injectData(data: StyleSheetRegisterCompiledOptions): void;
