package com.wattz;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.invertase.firebase.RNFirebasePackage;
import com.RNPlayAudio.RNPlayAudioPackage;
import com.audioStreaming.ReactNativeAudioStreamingPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.imagepicker.ImagePickerPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.reactlibrary.googlesignin.RNGoogleSignInPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.airbnb.android.react.maps.MapsPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;

import java.util.Arrays;
import java.util.List;

//FB SDK
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;

public class MainApplication extends Application implements ReactApplication {
    //FB SDK
    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }
    //END FB SDK

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
            new RNFirebasePackage(),
            new RNPlayAudioPackage(),
            new ReactNativeAudioStreamingPackage(),
            new ReactVideoPackage(),
            new ReactNativeAudioPackage(),
            new ImagePickerPackage(),
                new RNSoundPackage(),
                new FIRMessagingPackage(),
                new LottiePackage(),
                new RNFetchBlobPackage(),
                new VectorIconsPackage(),
                new PickerPackage(),
                new FBSDKPackage(mCallbackManager),
                new RNGoogleSignInPackage(),
                new RNGooglePlacesPackage(),
                new RNI18nPackage(),
                new MapsPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        FacebookSdk.sdkInitialize(getApplicationContext());
        SoLoader.init(this, /* native exopackage */ false);
    }
}
