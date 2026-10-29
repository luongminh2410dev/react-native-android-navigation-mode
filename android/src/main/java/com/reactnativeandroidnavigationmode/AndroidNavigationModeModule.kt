package com.reactnativeandroidnavigationmode

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap

class AndroidNavigationModeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  private val detector by lazy {
    NavigationModeDetector(SystemNavigationModeReader(reactApplicationContext), Build.VERSION.SDK_INT)
  }

  override fun getName(): String = "AndroidNavigationMode"

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getNavigationMode(): String = detector.detect().legacyMode

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getNavigationModeInfo(): WritableMap {
    val info = detector.detect()
    return Arguments.createMap().apply {
      putString("mode", info.mode)
      val interactionMode = info.interactionMode
      if (interactionMode == null) {
        putNull("interactionMode")
      } else {
        putInt("interactionMode", interactionMode)
      }
      putString("source", info.source)
    }
  }
}
