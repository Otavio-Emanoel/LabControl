import { type NavigationContainerProps, type NavigationContainerRef } from '@react-navigation/core';
import * as React from 'react';
import type { DocumentTitleOptions, LinkingOptions, LocaleDirection } from './types';
declare global {
    var REACT_NAVIGATION_DEVTOOLS: WeakMap<NavigationContainerRef<any>, {
        readonly linking: LinkingOptions<any>;
    }>;
}
type Props<ParamList extends {}> = NavigationContainerProps & {
    direction?: LocaleDirection;
    linking?: LinkingOptions<ParamList>;
    fallback?: React.ReactNode;
    documentTitle?: DocumentTitleOptions;
};
export declare const NavigationContainer: <RootParamList extends {} = ReactNavigation.RootParamList>(props: Props<RootParamList> & {
    ref?: React.Ref<NavigationContainerRef<RootParamList>>;
}) => React.ReactElement;
export {};
//# sourceMappingURL=NavigationContainer.d.ts.map