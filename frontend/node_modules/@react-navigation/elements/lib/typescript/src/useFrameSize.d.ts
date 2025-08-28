import * as React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
type Frame = {
    width: number;
    height: number;
};
export declare function useFrameSize<T>(selector: (frame: Frame) => T, throttle?: boolean): T;
type FrameSizeProviderProps = {
    initialFrame: Frame;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};
export declare function FrameSizeProvider({ initialFrame, children, }: FrameSizeProviderProps): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
export {};
//# sourceMappingURL=useFrameSize.d.ts.map