import { Dimensions } from "react-native";
import { INTERNAL_RESET, INTERNAL_SET } from "../../shared";
import { ReadableObservable } from "../observable";
export declare const rem: import("../observable").Observable<number>;
export { INTERNAL_RESET } from "../../shared";
declare const viewportReset: (dimensions: Dimensions) => void;
type ViewportObservable = ReadableObservable<number> & {
    [INTERNAL_RESET]: typeof viewportReset;
    [INTERNAL_SET]: (value: number) => void;
};
export declare const vw: ViewportObservable;
export declare const vh: ViewportObservable;
