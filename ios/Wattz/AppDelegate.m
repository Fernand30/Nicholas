/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
@import GooglePlaces;
@import GoogleMaps;
#import "RNFIRMessaging.h"
#import <React/RCTLinkingManager.h>
#import <AVFoundation/AVFoundation.h>


@implementation AppDelegate

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Facebook SDK
  [[FBSDKApplicationDelegate sharedInstance] application:application
                          didFinishLaunchingWithOptions:launchOptions];
  
  // Google sign in
  NSError* configureError;
  [[GGLContext sharedInstance] configureWithError: &configureError];
  NSAssert(!configureError, @"Error configuring Google services: %@", configureError);
  
  [GIDSignIn sharedInstance].delegate = self;
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryAmbient error:nil];
  // Google Maps
  [GMSServices provideAPIKey:@"AIzaSyCZAsvwKmqVVk2KPKYT_YidlYKEPPyHwa4"];
  [GMSPlacesClient provideAPIKey:@"AIzaSyCZAsvwKmqVVk2KPKYT_YidlYKEPPyHwa4"];
  
  //Firebase & Push Notifications
  [FIRApp configure];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Journalists"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

//PUSH NOTIFICATIONS
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  [RNFIRMessaging willPresentNotification:notification withCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler
{
  [RNFIRMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}

//You can skip this method if you don't want to use local notification
-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [RNFIRMessaging didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [RNFIRMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
//END PUSH NOTIFICATIONS

//Handler for iOS <= 8
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  
  BOOL handleGoogle = [[GIDSignIn sharedInstance] handleURL:url
                                          sourceApplication:sourceApplication
                                                 annotation:annotation
                       ];
  
  
  BOOL handledFB = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                  openURL:url
                                                        sourceApplication:sourceApplication
                                                               annotation:annotation
                    ];
  
  BOOL handledRCT = [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
  
  return handleGoogle || handledFB || handledRCT;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  
  BOOL fbHandled = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                  openURL:url
                                                        sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                                                               annotation:options[UIApplicationOpenURLOptionsAnnotationKey]
                    ];
  
  BOOL gHandled = [[GIDSignIn sharedInstance] handleURL:url
                                      sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                                             annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
  
  BOOL rHandled = [RCTLinkingManager application:application
                                         openURL:url
                               sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                                      annotation:options[UIApplicationOpenURLOptionsAnnotationKey]
                   ];
  
  
  return fbHandled || gHandled || rHandled;
}


@end
