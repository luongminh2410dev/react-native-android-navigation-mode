package com.reactnativeandroidnavigationmode

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class AndroidNavigationModeModule(reactContext: ReactApplicationContext) :
    AndroidNavigationModeSpec(reactContext) {

  companion object {
    const val NAME = "AndroidNavigationMode"
    const val INSETS_EVENT = "androidNavigationBarInsetsDidChange"
  }

  private val detector by lazy {
    NavigationModeDetector(SystemNavigationModeReader(reactApplicationContext), Build.VERSION.SDK_INT)
  }

  // Created on the first insets subscription, so apps that never use insets never create it.
  @Volatile private var insetsObserver: NavigationBarInsetsObserver? = null

  override fun getName(): String = NAME

  @ReactMethod(isBlockingSynchronousMethod = true)
  override fun getNavigationMode(): String = detector.detect().legacyMode

  @ReactMethod(isBlockingSynchronousMethod = true)
  override fun getNavigationModeInfo(): WritableMap {
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

  @ReactMethod
  override fun getNavigationBarInsets(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      val decorView = reactApplicationContext.currentActivity?.window?.decorView
      promise.resolve(NavigationBarInsets.read(decorView)?.toWritableMap())
    }
  }

  @ReactMethod
  override fun addListener(eventName: String) {
    if (eventName == INSETS_EVENT) {
      val observer = insetsObserver
        ?: NavigationBarInsetsObserver(reactApplicationContext) { insets -> emitInsets(insets) }.also { insetsObserver = it }
      observer.addSubscriber()
    }
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    insetsObserver?.removeSubscribers(count.toInt())
  }

  override fun invalidate() {
    insetsObserver?.release()
    insetsObserver = null
    super.invalidate()
  }

  private fun emitInsets(insets: NavigationBarInsets?) {
    if (!reactApplicationContext.hasActiveReactInstance()) {
      return
    }
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(INSETS_EVENT, insets?.toWritableMap())
  }

  private fun NavigationBarInsets.toWritableMap(): WritableMap =
    Arguments.createMap().apply {
      putDouble("top", top)
      putDouble("right", right)
      putDouble("bottom", bottom)
      putDouble("left", left)
    }
}
