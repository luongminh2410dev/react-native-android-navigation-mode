package com.reactnativeandroidnavigationmode

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap

/** Legacy Architecture base class mirroring the Codegen spec, which is not generated in this configuration. */
abstract class AndroidNavigationModeSpec internal constructor(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  abstract fun getNavigationMode(): String

  abstract fun getNavigationModeInfo(): WritableMap

  abstract fun getNavigationBarInsets(promise: Promise)

  abstract fun addListener(eventName: String)

  abstract fun removeListeners(count: Double)
}
