import { Appearance } from "react-native";
import { INTERNAL_RESET } from "../../shared";
import { ColorSchemeVariableValue, RuntimeValueDescriptor } from "../../types";
import { Effect, ObservableOptions } from "../observable";
export declare const systemColorScheme: import("../observable").Observable<"light" | "dark">;
export declare const colorScheme: {
    set(value: "light" | "dark" | "system"): void;
    get(effect?: Effect): "light" | "dark";
    getSystem(effect?: Effect): "light" | "dark";
    toggle(): void;
    [INTERNAL_RESET]: (appearance: typeof Appearance) => void;
};
export declare function cssVariableObservable(value?: ColorSchemeVariableValue, { name }?: ObservableOptions<never>): {
    name: string | undefined;
    get(effect?: Effect): RuntimeValueDescriptor;
    set(value: ColorSchemeVariableValue | RuntimeValueDescriptor): void;
};
export declare const isReduceMotionEnabled: import("../observable").Observable<boolean> & {
    [INTERNAL_RESET]: () => void;
};
