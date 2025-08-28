export declare const featureFlags: {
    transformPercentagePolyfill: string;
    disableGapPercentageValues: string;
    disableDisplayBlock: string;
    disableAlignContentEvenly: string;
    disablePositionStatic: string;
};
export type FeatureFlagStatus = Partial<Record<keyof typeof featureFlags, boolean>>;
export declare const defaultFeatureFlags: {
    [k: string]: boolean;
};
export declare function isFeatureEnabled(key: keyof typeof featureFlags): boolean;
