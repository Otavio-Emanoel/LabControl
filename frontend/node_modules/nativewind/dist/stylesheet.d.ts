export declare function useColorScheme(): {
    setColorScheme(scheme: Parameters<(value: "light" | "dark" | "system") => void>[0]): void;
    toggleColorScheme(): void;
    colorScheme: "light" | "dark" | undefined;
};
