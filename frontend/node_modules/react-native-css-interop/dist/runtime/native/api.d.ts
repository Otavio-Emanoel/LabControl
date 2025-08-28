import type { CssInterop, RuntimeValueDescriptor } from "../../types";
export { StyleSheet } from "./stylesheet";
export { colorScheme } from "./appearance-observables";
export { rem } from "./unit-observables";
export declare const interopComponents: Map<string | object, import("react").ComponentType<{}>>;
export declare const cssInterop: CssInterop;
export declare const remapProps: CssInterop;
export declare function useColorScheme(): {
    colorScheme: "light" | "dark";
    setColorScheme: (value: "light" | "dark" | "system") => void;
    toggleColorScheme: () => void;
};
export declare function vars(variables: Record<string, RuntimeValueDescriptor>): Record<string, any>;
export declare const useUnstableNativeVariable: (name: string) => any;
export declare const useSafeAreaEnv: () => void;
