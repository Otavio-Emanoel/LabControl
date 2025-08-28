import type { MediaQuery, SelectorList } from "lightningcss";
import { AttributeCondition, ExtractRuleOptions, Specificity, StyleRule } from "../types";
export type NormalizeSelector = {
    type: "rootVariables" | "universalVariables";
    subtype: "light" | "dark";
} | {
    type: "className";
    className: string;
    media?: MediaQuery[];
    groupClassName?: string;
    pseudoClasses?: Record<string, true>;
    groupPseudoClasses?: Record<string, true>;
    groupAttrs?: AttributeCondition[];
    attrs?: AttributeCondition[];
    specificity: Specificity;
};
export declare function normalizeSelectors(extractedStyle: StyleRule, selectorList: SelectorList, options: ExtractRuleOptions, selectors?: NormalizeSelector[], defaults?: Partial<NormalizeSelector>): NormalizeSelector[];
export declare function toRNProperty(str: string): string;
