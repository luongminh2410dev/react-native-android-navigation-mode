package com.reactnativeandroidnavigationmode

import org.junit.Assert.assertEquals
import org.junit.Test

class NavigationBarInsetsTest {

  @Test
  fun convertsPixelsToDpForEachDensity() {
    assertEquals(NavigationBarInsets(0.0, 0.0, 48.0, 0.0), NavigationBarInsets.fromPixels(0, 0, 48, 0, 1f))
    assertEquals(NavigationBarInsets(0.0, 0.0, 48.0, 0.0), NavigationBarInsets.fromPixels(0, 0, 126, 0, 2.625f))
    assertEquals(NavigationBarInsets(0.0, 42.0, 0.0, 0.0), NavigationBarInsets.fromPixels(0, 147, 0, 0, 3.5f))
  }

  @Test
  fun keepsEachEdgeSeparateInLandscape() {
    assertEquals(NavigationBarInsets(0.0, 0.0, 0.0, 24.0), NavigationBarInsets.fromPixels(0, 0, 0, 72, 3f))
  }

  @Test
  fun clampsNegativeValuesAndInvalidDensityToZero() {
    assertEquals(NavigationBarInsets(0.0, 0.0, 0.0, 0.0), NavigationBarInsets.fromPixels(-5, -1, 0, -9, 2f))
    assertEquals(NavigationBarInsets(0.0, 0.0, 0.0, 0.0), NavigationBarInsets.fromPixels(0, 0, 96, 0, 0f))
  }
}
