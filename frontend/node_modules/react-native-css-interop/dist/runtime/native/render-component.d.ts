import { ComponentType } from "react";
import { SharedState } from "./types";
export declare const UpgradeState: {
    NONE: number;
    SHOULD_UPGRADE: number;
    UPGRADED: number;
    WARNED: number;
};
export declare function renderComponent(baseComponent: ComponentType<any>, state: SharedState, props: Record<string, any>, possiblyAnimatedProps: Record<string, any>, variables?: Record<string, any>, containers?: Record<string, any>): import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
