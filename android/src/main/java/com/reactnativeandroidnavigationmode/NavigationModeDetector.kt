package com.reactnativeandroidnavigationmode

/** Raw system values used for detection. Each read returns `null` when the value is missing or unreadable. */
internal interface NavigationModeReader {
  fun readInteractionModeResource(): Int?

  fun readNavigationModeSetting(): Int?

  fun readSwipeUpSetting(): Int?
}

internal data class NavigationModeInfo(
  val mode: String,
  val interactionMode: Int?,
  val source: String,
) {
  /** Mode for the legacy API, which reports an undetermined mode as 3-button. */
  val legacyMode: String
    get() = if (mode == NavigationModeDetector.MODE_UNKNOWN) NavigationModeDetector.MODE_THREE_BUTTON else mode
}

/** Decides the navigation mode from the system values exposed by [reader]. Free of Android APIs for JVM tests. */
internal class NavigationModeDetector(
  private val reader: NavigationModeReader,
  private val sdkInt: Int,
) {

  companion object {
    const val MODE_GESTURE = "gesture"
    const val MODE_TWO_BUTTON = "2-button"
    const val MODE_THREE_BUTTON = "3-button"
    const val MODE_UNKNOWN = "unknown"

    const val SOURCE_RESOURCE = "resource"
    const val SOURCE_SECURE_SETTINGS = "secure-settings"
    const val SOURCE_SWIPE_UP_SETTING = "swipe-up-setting"
    const val SOURCE_SDK_DEFAULT = "sdk-default"
    const val SOURCE_UNAVAILABLE = "unavailable"

    private const val INTERACTION_THREE_BUTTON = 0
    private const val INTERACTION_TWO_BUTTON = 1
    private const val INTERACTION_GESTURE = 2

    // Android 10 (Q) introduced gesture navigation; Android 9 (P) has the optional swipe-up 2-button mode.
    private const val SDK_ANDROID_9 = 28
    private const val SDK_ANDROID_10 = 29
  }

  fun detect(): NavigationModeInfo {
    reader.readInteractionModeResource()?.let { validInteractionMode(it) }?.let { return info(it, SOURCE_RESOURCE) }
    reader.readNavigationModeSetting()?.let { validInteractionMode(it) }?.let { return info(it, SOURCE_SECURE_SETTINGS) }

    if (sdkInt >= SDK_ANDROID_10) {
      return NavigationModeInfo(MODE_UNKNOWN, null, SOURCE_UNAVAILABLE)
    }

    if (sdkInt == SDK_ANDROID_9) {
      when (reader.readSwipeUpSetting()) {
        1 -> return info(INTERACTION_TWO_BUTTON, SOURCE_SWIPE_UP_SETTING)
        0 -> return info(INTERACTION_THREE_BUTTON, SOURCE_SWIPE_UP_SETTING)
      }
    }

    return info(INTERACTION_THREE_BUTTON, SOURCE_SDK_DEFAULT)
  }

  private fun validInteractionMode(interactionMode: Int): Int? =
    interactionMode.takeIf {
      it == INTERACTION_THREE_BUTTON || it == INTERACTION_TWO_BUTTON || it == INTERACTION_GESTURE
    }

  private fun info(interactionMode: Int, source: String): NavigationModeInfo {
    val mode = when (interactionMode) {
      INTERACTION_GESTURE -> MODE_GESTURE
      INTERACTION_TWO_BUTTON -> MODE_TWO_BUTTON
      else -> MODE_THREE_BUTTON
    }
    return NavigationModeInfo(mode, interactionMode, source)
  }
}
