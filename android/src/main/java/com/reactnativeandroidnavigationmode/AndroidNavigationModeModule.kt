package com.reactnativeandroidnavigationmode

import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AndroidNavigationModeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val MODE_GESTURE = "gesture"
    private const val MODE_TWO_BUTTON = "2-button"
    private const val MODE_THREE_BUTTON = "3-button"
  }

  override fun getName(): String = "AndroidNavigationMode"

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getNavigationMode(): String {
    val resources = reactApplicationContext.resources
    val resourceId = resources.getIdentifier("config_navBarInteractionMode", "integer", "android")

    if (resourceId > 0) {
      return when (resources.getInteger(resourceId)) {
        2 -> MODE_GESTURE
        1 -> MODE_TWO_BUTTON
        else -> MODE_THREE_BUTTON
      }
    }

    return try {
      when (Settings.Secure.getInt(reactApplicationContext.contentResolver, "navigation_mode")) {
        2 -> MODE_GESTURE
        1 -> MODE_TWO_BUTTON
        else -> MODE_THREE_BUTTON
      }
    } catch (_: Exception) {
      MODE_THREE_BUTTON
    }
  }
}
