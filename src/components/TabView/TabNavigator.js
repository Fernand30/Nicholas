/* @flow */

import React from 'react';
import { Platform } from 'react-native';

import createNavigator from "react-navigation/src/navigators/createNavigator"
import createNavigationContainer from "react-navigation/src/createNavigationContainer"
import TabRouter from "react-navigation/src/routers/TabRouter"
import TabView from './TabView';
import TabBarTop from "react-navigation/src/views/TabView/TabBarTop"
import TabBarBottom from './TabBarBottom';

import NavigatorTypes from "react-navigation/lib/navigators/NavigatorTypes"

import type { TabViewConfig } from './TabView';

import type {
  NavigationRouteConfigMap,
  NavigationTabRouterConfig,
} from 'react-navigation/src/TypeDefinition';

export type TabNavigatorConfig = {
  containerOptions?: void,
} & NavigationTabRouterConfig &
  TabViewConfig;

const TabNavigator = (
  routeConfigs: NavigationRouteConfigMap,
  config: TabNavigatorConfig = {}
) => {
  // Use the look native to the platform by default
  const mergedConfig = { ...TabNavigator.Presets.Default, ...config };
  const {
          tabBarComponent,
          tabBarPosition,
          tabBarOptions,
          swipeEnabled,
          animationEnabled,
          lazy,
          ...tabsConfig
        } = mergedConfig;

  const router = TabRouter(routeConfigs, tabsConfig);

  const navigator = createNavigator(
    router,
    routeConfigs,
    config,
    NavigatorTypes.STACK
  )((props: *) => (
    <TabView
      {...props}
      tabBarComponent={tabBarComponent}
      tabBarPosition={tabBarPosition}
      tabBarOptions={tabBarOptions}
      swipeEnabled={swipeEnabled}
      animationEnabled={animationEnabled}
      lazy={lazy}
    />
  ));

  return createNavigationContainer(navigator, tabsConfig.containerOptions);
};

const Presets = {
  iOSBottomTabs: {
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    lazy: false,
  },
  AndroidTopTabs: {
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    lazy: false,
  },
};

/**
 * Use these to get Android-style top tabs even on iOS or vice versa.
 *
 * Example:
 * ```
 * const HomeScreenTabNavigator = TabNavigator({
 *  Chat: {
 *    screen: ChatScreen,
 *  },
 *  ...
 * }, {
 *  ...TabNavigator.Presets.AndroidTopTabs,
 *  tabBarOptions: {
 *    ...
 *  },
 * });
 *```
 */
TabNavigator.Presets = {
  iOSBottomTabs: Presets.iOSBottomTabs,
  AndroidTopTabs: Presets.AndroidTopTabs,
  Default: Platform.OS === 'ios'
    ? Presets.iOSBottomTabs
    : Presets.AndroidTopTabs,
};

export default TabNavigator;
