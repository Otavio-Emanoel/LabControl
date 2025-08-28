import type { Declaration, DimensionPercentageFor_LengthValue, Length, LengthValue, NumberOrPercentage, Scale, Translate, UnresolvedColor } from "lightningcss";
import type { ExtractionWarning, RuntimeValueDescriptor } from "../types";
import { FeatureFlagStatus } from "./feature-flags";
type AddStyleProp = (property: string, value?: RuntimeValueDescriptor, moveTokens?: string[]) => void;
type HandleStyleShorthand = (property: string, options: Record<string, RuntimeValueDescriptor>) => void;
type AddAnimationDefaultProp = (property: string, value: unknown[]) => void;
type AddContainerProp = (declaration: Extract<Declaration, {
    property: "container" | "container-name" | "container-type";
}>) => void;
type AddTransitionProp = (declaration: Extract<Declaration, {
    property: "transition-property" | "transition-duration" | "transition-delay" | "transition-timing-function" | "transition";
}>) => void;
type AddWarning = (warning: ExtractionWarning) => undefined;
export interface ParseDeclarationOptions {
    inlineRem?: number | false;
    addStyleProp: AddStyleProp;
    addTransformProp: AddStyleProp;
    handleStyleShorthand: HandleStyleShorthand;
    handleTransformShorthand: HandleStyleShorthand;
    addAnimationProp: AddAnimationDefaultProp;
    addContainerProp: AddContainerProp;
    addTransitionProp: AddTransitionProp;
    addWarning: AddWarning;
    requiresLayout: (name: string) => void;
    features: FeatureFlagStatus;
}
export interface ParseDeclarationOptionsWithValueWarning extends ParseDeclarationOptions {
    addValueWarning: (value: any) => undefined;
    addFunctionValueWarning: (value: any) => undefined;
    allowAuto?: boolean;
}
export declare function parseDeclaration(declaration: Declaration, options: ParseDeclarationOptions): void;
export declare function parseLength(length: number | Length | DimensionPercentageFor_LengthValue | NumberOrPercentage | LengthValue, options: ParseDeclarationOptionsWithValueWarning): RuntimeValueDescriptor;
export declare function parseTranslate(translate: Translate, prop: keyof Extract<Translate, object>, options: ParseDeclarationOptionsWithValueWarning): RuntimeValueDescriptor;
export declare function parseScale(translate: Scale, prop: keyof Extract<Scale, object>, options: ParseDeclarationOptionsWithValueWarning): RuntimeValueDescriptor;
export declare function parseUnresolvedColor(color: UnresolvedColor, options: ParseDeclarationOptionsWithValueWarning): RuntimeValueDescriptor;
export {};
