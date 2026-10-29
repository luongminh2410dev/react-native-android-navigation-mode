package com.reactnativeandroidnavigationmode

import org.junit.Assert.assertEquals
import org.junit.Test

class NavigationModeDetectorTest {

  private class FakeReader(
    val resource: Int? = null,
    val navigationModeSetting: Int? = null,
    val swipeUpSetting: Int? = null,
  ) : NavigationModeReader {
    var swipeUpReads = 0

    override fun readInteractionModeResource(): Int? = resource

    override fun readNavigationModeSetting(): Int? = navigationModeSetting

    override fun readSwipeUpSetting(): Int? {
      swipeUpReads += 1
      return swipeUpSetting
    }
  }

  private fun detect(reader: FakeReader, sdkInt: Int = 34) = NavigationModeDetector(reader, sdkInt).detect()

  @Test
  fun mapsEachValidResourceValue() {
    assertEquals(NavigationModeInfo("3-button", 0, "resource"), detect(FakeReader(resource = 0)))
    assertEquals(NavigationModeInfo("2-button", 1, "resource"), detect(FakeReader(resource = 1)))
    assertEquals(NavigationModeInfo("gesture", 2, "resource"), detect(FakeReader(resource = 2)))
  }

  @Test
  fun mapsEachValidSettingValueWhenResourceIsMissing() {
    assertEquals(NavigationModeInfo("3-button", 0, "secure-settings"), detect(FakeReader(navigationModeSetting = 0)))
    assertEquals(NavigationModeInfo("2-button", 1, "secure-settings"), detect(FakeReader(navigationModeSetting = 1)))
    assertEquals(NavigationModeInfo("gesture", 2, "secure-settings"), detect(FakeReader(navigationModeSetting = 2)))
  }

  @Test
  fun prefersAValidResourceOverADifferentSetting() {
    assertEquals(
      NavigationModeInfo("gesture", 2, "resource"),
      detect(FakeReader(resource = 2, navigationModeSetting = 0)),
    )
  }

  @Test
  fun fallsBackToTheSettingWhenTheResourceIsOutOfRange() {
    assertEquals(
      NavigationModeInfo("gesture", 2, "secure-settings"),
      detect(FakeReader(resource = 5, navigationModeSetting = 2)),
    )
    assertEquals(
      NavigationModeInfo("2-button", 1, "secure-settings"),
      detect(FakeReader(resource = -1, navigationModeSetting = 1)),
    )
  }

  @Test
  fun reportsUnknownOnAndroid10AndLaterWhenNoSourceIsValid() {
    val unknown = NavigationModeInfo("unknown", null, "unavailable")
    assertEquals(unknown, detect(FakeReader(), sdkInt = 29))
    assertEquals(unknown, detect(FakeReader(resource = 3, navigationModeSetting = 9), sdkInt = 34))
  }

  @Test
  fun neverReadsTheSwipeUpSettingOnAndroid10AndLater() {
    val reader = FakeReader(swipeUpSetting = 1)
    detect(reader, sdkInt = 29)
    assertEquals(0, reader.swipeUpReads)
  }

  @Test
  fun usesTheSwipeUpSettingOnAndroid9() {
    assertEquals(NavigationModeInfo("2-button", 1, "swipe-up-setting"), detect(FakeReader(swipeUpSetting = 1), sdkInt = 28))
    assertEquals(NavigationModeInfo("3-button", 0, "swipe-up-setting"), detect(FakeReader(swipeUpSetting = 0), sdkInt = 28))
  }

  @Test
  fun defaultsTo3ButtonOnAndroid9WhenTheSwipeUpSettingIsMissingOrInvalid() {
    val sdkDefault = NavigationModeInfo("3-button", 0, "sdk-default")
    assertEquals(sdkDefault, detect(FakeReader(), sdkInt = 28))
    assertEquals(sdkDefault, detect(FakeReader(swipeUpSetting = 4), sdkInt = 28))
  }

  @Test
  fun defaultsTo3ButtonBeforeAndroid9WithoutReadingTheSwipeUpSetting() {
    val reader = FakeReader(swipeUpSetting = 1)
    assertEquals(NavigationModeInfo("3-button", 0, "sdk-default"), detect(reader, sdkInt = 27))
    assertEquals(0, reader.swipeUpReads)
  }

  @Test
  fun prefersAValidNavigationModeSettingOnOlderDevices() {
    assertEquals(
      NavigationModeInfo("gesture", 2, "secure-settings"),
      detect(FakeReader(navigationModeSetting = 2, swipeUpSetting = 0), sdkInt = 28),
    )
  }

  @Test
  fun legacyModeReportsUnknownAs3Button() {
    assertEquals("3-button", NavigationModeInfo("unknown", null, "unavailable").legacyMode)
    assertEquals("gesture", NavigationModeInfo("gesture", 2, "resource").legacyMode)
  }
}
