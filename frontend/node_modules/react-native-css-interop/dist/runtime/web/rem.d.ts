import { INTERNAL_RESET } from "../../shared";
import { Effect } from "../observable";
export declare const _rem: import("../observable").Observable<number>;
export declare const rem: {
    get(effect?: Effect): number;
    set(value: number): void;
    [INTERNAL_RESET](value?: number): void;
};
