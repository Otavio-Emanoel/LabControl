import { type Route } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '../types';
type Props = NativeStackNavigationOptions & {
    headerTopInsetEnabled: boolean;
    headerHeight: number;
    headerBack: {
        title?: string | undefined;
        href: undefined;
    } | undefined;
    route: Route<string>;
};
export declare function useHeaderConfigProps({ headerBackImageSource, headerBackButtonDisplayMode, headerBackButtonMenuEnabled, headerBackTitle, headerBackTitleStyle, headerBackVisible, headerShadowVisible, headerLargeStyle, headerLargeTitle, headerLargeTitleShadowVisible, headerLargeTitleStyle, headerBackground, headerLeft, headerRight, headerShown, headerStyle, headerBlurEffect, headerTintColor, headerTitle, headerTitleAlign, headerTitleStyle, headerTransparent, headerSearchBarOptions, headerTopInsetEnabled, headerBack, route, title, }: Props): {
    readonly backButtonInCustomView: boolean;
    readonly backgroundColor: string;
    readonly backTitle: string | undefined;
    readonly backTitleVisible: boolean | undefined;
    readonly backButtonDisplayMode: import("react-native-screens").BackButtonDisplayMode | undefined;
    readonly backTitleFontFamily: string | undefined;
    readonly backTitleFontSize: number | undefined;
    readonly blurEffect: import("react-native-screens").BlurEffectTypes | undefined;
    readonly color: string;
    readonly direction: import("@react-navigation/native").LocaleDirection;
    readonly disableBackButtonMenu: boolean;
    readonly hidden: boolean;
    readonly hideBackButton: boolean;
    readonly hideShadow: boolean | undefined;
    readonly largeTitle: boolean | undefined;
    readonly largeTitleBackgroundColor: string | undefined;
    readonly largeTitleColor: string | undefined;
    readonly largeTitleFontFamily: string | undefined;
    readonly largeTitleFontSize: number | undefined;
    readonly largeTitleFontWeight: string | undefined;
    readonly largeTitleHideShadow: boolean;
    readonly title: string;
    readonly titleColor: string | undefined;
    readonly titleFontFamily: string | undefined;
    readonly titleFontSize: number | undefined;
    readonly titleFontWeight: string;
    readonly topInsetEnabled: boolean;
    readonly translucent: boolean;
    readonly children: import("react/jsx-runtime").JSX.Element;
};
export {};
//# sourceMappingURL=useHeaderConfigProps.d.ts.map