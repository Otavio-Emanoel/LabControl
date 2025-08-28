"use strict";

import { getHeaderTitle, HeaderTitle } from '@react-navigation/elements';
import { useLocale, useTheme } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';
import { isSearchBarAvailableForCurrentPlatform, ScreenStackHeaderBackButtonImage, ScreenStackHeaderCenterView, ScreenStackHeaderLeftView, ScreenStackHeaderRightView, ScreenStackHeaderSearchBarView, SearchBar } from 'react-native-screens';
import { processFonts } from './FontProcessor';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function useHeaderConfigProps({
  headerBackImageSource,
  headerBackButtonDisplayMode,
  headerBackButtonMenuEnabled,
  headerBackTitle,
  headerBackTitleStyle,
  headerBackVisible,
  headerShadowVisible,
  headerLargeStyle,
  headerLargeTitle,
  headerLargeTitleShadowVisible,
  headerLargeTitleStyle,
  headerBackground,
  headerLeft,
  headerRight,
  headerShown,
  headerStyle,
  headerBlurEffect,
  headerTintColor,
  headerTitle,
  headerTitleAlign,
  headerTitleStyle,
  headerTransparent,
  headerSearchBarOptions,
  headerTopInsetEnabled,
  headerBack,
  route,
  title
}) {
  const {
    direction
  } = useLocale();
  const {
    colors,
    fonts
  } = useTheme();
  const tintColor = headerTintColor ?? (Platform.OS === 'ios' ? colors.primary : colors.text);
  const headerBackTitleStyleFlattened = StyleSheet.flatten([fonts.regular, headerBackTitleStyle]) || {};
  const headerLargeTitleStyleFlattened = StyleSheet.flatten([Platform.select({
    ios: fonts.heavy,
    default: fonts.medium
  }), headerLargeTitleStyle]) || {};
  const headerTitleStyleFlattened = StyleSheet.flatten([Platform.select({
    ios: fonts.bold,
    default: fonts.medium
  }), headerTitleStyle]) || {};
  const headerStyleFlattened = StyleSheet.flatten(headerStyle) || {};
  const headerLargeStyleFlattened = StyleSheet.flatten(headerLargeStyle) || {};
  const [backTitleFontFamily, largeTitleFontFamily, titleFontFamily] = processFonts([headerBackTitleStyleFlattened.fontFamily, headerLargeTitleStyleFlattened.fontFamily, headerTitleStyleFlattened.fontFamily]);
  const backTitleFontSize = 'fontSize' in headerBackTitleStyleFlattened ? headerBackTitleStyleFlattened.fontSize : undefined;
  const titleText = getHeaderTitle({
    title,
    headerTitle
  }, route.name);
  const titleColor = 'color' in headerTitleStyleFlattened ? headerTitleStyleFlattened.color : headerTintColor ?? colors.text;
  const titleFontSize = 'fontSize' in headerTitleStyleFlattened ? headerTitleStyleFlattened.fontSize : undefined;
  const titleFontWeight = headerTitleStyleFlattened.fontWeight;
  const largeTitleBackgroundColor = headerLargeStyleFlattened.backgroundColor;
  const largeTitleColor = 'color' in headerLargeTitleStyleFlattened ? headerLargeTitleStyleFlattened.color : undefined;
  const largeTitleFontSize = 'fontSize' in headerLargeTitleStyleFlattened ? headerLargeTitleStyleFlattened.fontSize : undefined;
  const largeTitleFontWeight = headerLargeTitleStyleFlattened.fontWeight;
  const headerTitleStyleSupported = {
    color: titleColor
  };
  if (headerTitleStyleFlattened.fontFamily != null) {
    headerTitleStyleSupported.fontFamily = headerTitleStyleFlattened.fontFamily;
  }
  if (titleFontSize != null) {
    headerTitleStyleSupported.fontSize = titleFontSize;
  }
  if (titleFontWeight != null) {
    headerTitleStyleSupported.fontWeight = titleFontWeight;
  }
  const headerBackgroundColor = headerStyleFlattened.backgroundColor ?? (headerBackground != null || headerTransparent ? 'transparent' : colors.card);
  const canGoBack = headerBack != null;
  const headerLeftElement = headerLeft?.({
    tintColor,
    canGoBack,
    label: headerBackTitle ?? headerBack?.title,
    // `href` is only applicable to web
    href: undefined
  });
  const headerRightElement = headerRight?.({
    tintColor,
    canGoBack
  });
  const headerTitleElement = typeof headerTitle === 'function' ? headerTitle({
    tintColor,
    children: titleText
  }) : null;
  const supportsHeaderSearchBar = typeof isSearchBarAvailableForCurrentPlatform === 'boolean' ? isSearchBarAvailableForCurrentPlatform :
  // Fallback for older versions of react-native-screens
  Platform.OS === 'ios' && SearchBar != null;
  const hasHeaderSearchBar = supportsHeaderSearchBar && headerSearchBarOptions != null;

  /**
   * We need to set this in if:
   * - Back button should stay visible when `headerLeft` is specified
   * - If `headerTitle` for Android is specified, so we only need to remove the title and keep the back button
   */
  const backButtonInCustomView = headerBackVisible || Platform.OS === 'android' && headerTitleElement != null && headerLeftElement == null;
  const translucent = headerBackground != null || headerTransparent ||
  // When using a SearchBar or large title, the header needs to be translucent for it to work on iOS
  (hasHeaderSearchBar || headerLargeTitle) && Platform.OS === 'ios' && headerTransparent !== false;
  const isBackButtonDisplayModeAvailable =
  // On iOS 14+
  Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 14 && (
  // Doesn't have custom styling, by default System, see: https://github.com/software-mansion/react-native-screens/pull/2105#discussion_r1565222738
  backTitleFontFamily == null || backTitleFontFamily === 'System') && backTitleFontSize == null &&
  // Back button menu is not disabled
  headerBackButtonMenuEnabled !== false;
  const isCenterViewRenderedAndroid = headerTitleAlign === 'center';
  const children = /*#__PURE__*/_jsxs(_Fragment, {
    children: [Platform.OS === 'ios' ? /*#__PURE__*/_jsxs(_Fragment, {
      children: [headerLeftElement != null ? /*#__PURE__*/_jsx(ScreenStackHeaderLeftView, {
        children: headerLeftElement
      }) : null, headerTitleElement != null ? /*#__PURE__*/_jsx(ScreenStackHeaderCenterView, {
        children: headerTitleElement
      }) : null]
    }) : /*#__PURE__*/_jsxs(_Fragment, {
      children: [headerLeftElement != null || typeof headerTitle === 'function' ?
      /*#__PURE__*/
      // The style passed to header left, together with title element being wrapped
      // in flex view is reqruied for proper header layout, in particular,
      // for the text truncation to work.
      _jsxs(ScreenStackHeaderLeftView, {
        style: !isCenterViewRenderedAndroid ? {
          flex: 1
        } : null,
        children: [headerLeftElement, headerTitleAlign !== 'center' ? typeof headerTitle === 'function' ? /*#__PURE__*/_jsx(View, {
          style: {
            flex: 1
          },
          children: headerTitleElement
        }) : /*#__PURE__*/_jsx(View, {
          style: {
            flex: 1
          },
          children: /*#__PURE__*/_jsx(HeaderTitle, {
            tintColor: tintColor,
            style: headerTitleStyleSupported,
            children: titleText
          })
        }) : null]
      }) : null, isCenterViewRenderedAndroid ? /*#__PURE__*/_jsx(ScreenStackHeaderCenterView, {
        children: typeof headerTitle === 'function' ? headerTitleElement : /*#__PURE__*/_jsx(HeaderTitle, {
          tintColor: tintColor,
          style: headerTitleStyleSupported,
          children: titleText
        })
      }) : null]
    }), headerBackImageSource !== undefined ? /*#__PURE__*/_jsx(ScreenStackHeaderBackButtonImage, {
      source: headerBackImageSource
    }) : null, headerRightElement != null ? /*#__PURE__*/_jsx(ScreenStackHeaderRightView, {
      children: headerRightElement
    }) : null, hasHeaderSearchBar ? /*#__PURE__*/_jsx(ScreenStackHeaderSearchBarView, {
      children: /*#__PURE__*/_jsx(SearchBar, {
        ...headerSearchBarOptions
      })
    }) : null]
  });
  return {
    backButtonInCustomView,
    backgroundColor: headerBackgroundColor,
    backTitle: headerBackTitle,
    backTitleVisible: isBackButtonDisplayModeAvailable ? undefined : headerBackButtonDisplayMode !== 'minimal',
    backButtonDisplayMode: isBackButtonDisplayModeAvailable ? headerBackButtonDisplayMode : undefined,
    backTitleFontFamily,
    backTitleFontSize,
    blurEffect: headerBlurEffect,
    color: tintColor,
    direction,
    disableBackButtonMenu: headerBackButtonMenuEnabled === false,
    hidden: headerShown === false,
    hideBackButton: headerBackVisible === false,
    hideShadow: headerShadowVisible === false || headerBackground != null || headerTransparent && headerShadowVisible !== true,
    largeTitle: headerLargeTitle,
    largeTitleBackgroundColor,
    largeTitleColor,
    largeTitleFontFamily,
    largeTitleFontSize,
    largeTitleFontWeight,
    largeTitleHideShadow: headerLargeTitleShadowVisible === false,
    title: titleText,
    titleColor,
    titleFontFamily,
    titleFontSize,
    titleFontWeight: String(titleFontWeight),
    topInsetEnabled: headerTopInsetEnabled,
    translucent: translucent === true,
    children
  };
}
//# sourceMappingURL=useHeaderConfigProps.js.map