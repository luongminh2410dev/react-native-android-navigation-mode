package com.reactnativeandroidnavigationmode

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Registers the module for both architectures. `TurboReactPackage` and the 7-argument `ReactModuleInfo`
 * constructor are deprecated in recent React Native but exist from 0.71 to the latest supported version.
 */
@Suppress("DEPRECATION")
class AndroidNavigationModePackage : TurboReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == AndroidNavigationModeModule.NAME) AndroidNavigationModeModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      AndroidNavigationModeModule.NAME to ReactModuleInfo(
        AndroidNavigationModeModule.NAME,
        AndroidNavigationModeModule.NAME,
        false,
        false,
        false,
        false,
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      ),
    )
  }
}
