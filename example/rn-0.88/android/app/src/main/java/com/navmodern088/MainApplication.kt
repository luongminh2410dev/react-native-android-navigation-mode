package com.navmodern088

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlagsDefaults

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    // Fixture-only: `-PdisableTurboModuleInterop=true` proves the library resolves as a real TurboModule,
    // because legacy modules are unreachable without the interop layer.
    if (BuildConfig.DISABLE_TURBO_MODULE_INTEROP) {
      ReactNativeFeatureFlags.dangerouslyForceOverride(
        object : ReactNativeNewArchitectureFeatureFlagsDefaults() {
          override fun useTurboModuleInterop(): Boolean = false
        },
      )
    }
    Log.i("NavigationModeExample", "useTurboModuleInterop=${ReactNativeFeatureFlags.useTurboModuleInterop()}")
  }
}
