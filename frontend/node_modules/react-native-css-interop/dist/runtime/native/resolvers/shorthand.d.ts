import { defaultValues } from "../resolve-value";
import type { ShorthandResolveFn } from "../types";
type ShorthandRequiredValue = readonly [
    string | readonly string[],
    "string" | "number" | "length" | "color"
] | ShorthandDefaultValue;
type ShorthandDefaultValue = readonly [
    string | readonly string[],
    "string" | "number" | "length" | "color",
    keyof typeof defaultValues
];
export declare function shorthandHandler(mappings: ShorthandRequiredValue[][], defaults: ShorthandDefaultValue[]): ShorthandResolveFn;
export {};
