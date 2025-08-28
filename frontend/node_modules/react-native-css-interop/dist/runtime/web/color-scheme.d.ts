import { Appearance } from "react-native";
import { INTERNAL_RESET } from "../../shared";
export declare const colorScheme: {
    set(value: "light" | "dark" | "system"): void;
    get: (effect?: import("../observable").Effect) => "light" | "dark" | undefined;
    toggle(): void;
    [INTERNAL_RESET]: (appearance: typeof Appearance) => void;
};
