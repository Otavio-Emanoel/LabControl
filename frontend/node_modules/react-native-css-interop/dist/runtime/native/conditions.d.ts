import type { ContainerCondition, Declaration, MediaQuery } from "lightningcss";
import { ExtractedContainerQuery, PseudoClassesQuery, StyleRule } from "../../types";
import { ReadableObservable } from "../observable";
import { ReducerTracking, Refs, SharedState } from "./types";
interface ConditionReference {
    width: number | ReadableObservable<number>;
    height: number | ReadableObservable<number>;
}
export declare function testRule(rule: StyleRule, refs: Refs, tracking: ReducerTracking): boolean;
export declare function testMediaQueries(state: SharedState, tracking: ReducerTracking, mediaQueries: MediaQuery[]): boolean;
export declare function testMediaQuery(tracking: ReducerTracking, mediaQuery: MediaQuery, conditionReference?: ConditionReference): boolean;
export declare function testPseudoClasses(state: SharedState, meta: PseudoClassesQuery, tracking?: ReducerTracking): boolean;
export declare function testContainerQuery(refs: Refs, tracking: ReducerTracking, containerQuery: ExtractedContainerQuery[] | undefined): boolean;
export declare function testCondition(condition: ContainerCondition<Declaration> | null | undefined, conditionReference: ConditionReference, tracking?: ReducerTracking): boolean;
export {};
