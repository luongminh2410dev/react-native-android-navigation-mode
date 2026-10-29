package com.reactnativeandroidnavigationmode

import android.content.Context
import android.provider.Settings

/**
 * Reads navigation values from system resources and secure settings.
 * Each read is guarded on its own: OEM builds may omit a value or reject the read, and detection must not crash the host app.
 */
internal class SystemNavigationModeReader(private val context: Context) : NavigationModeReader {

  override fun readInteractionModeResource(): Int? {
    val resources = context.resources
    val resourceId = resources.getIdentifier("config_navBarInteractionMode", "integer", "android")
    if (resourceId <= 0) {
      return null
    }

    return try {
      resources.getInteger(resourceId)
    } catch (error: Exception) {
      null
    }
  }

  override fun readNavigationModeSetting(): Int? = readSecureInt("navigation_mode")

  override fun readSwipeUpSetting(): Int? = readSecureInt("swipe_up_to_switch_apps_enabled")

  private fun readSecureInt(name: String): Int? =
    try {
      Settings.Secure.getInt(context.contentResolver, name)
    } catch (error: Exception) {
      // SettingNotFoundException, or SecurityException when Android 12+ hides the key from apps.
      null
    }
}
