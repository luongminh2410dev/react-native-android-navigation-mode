package com.reactnativeandroidnavigationmode

import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/** Navigation bar insets of a window, in dp. Edges are `0` while the bar is hidden. */
internal data class NavigationBarInsets(
  val top: Double,
  val right: Double,
  val bottom: Double,
  val left: Double,
) {

  companion object {
    fun fromPixels(top: Int, right: Int, bottom: Int, left: Int, density: Float): NavigationBarInsets {
      fun toDp(pixels: Int): Double = if (pixels <= 0 || density <= 0f) 0.0 else pixels / density.toDouble()
      return NavigationBarInsets(toDp(top), toDp(right), toDp(bottom), toDp(left))
    }

    /**
     * Reads the visible navigation bar insets of the window holding [view]. Returns `null` before the window has insets.
     * Only the navigation bar type is read, so status bar, IME, and system gesture insets are excluded.
     */
    fun read(view: View?): NavigationBarInsets? {
      val windowInsets = view?.let { ViewCompat.getRootWindowInsets(it) } ?: return null
      val insets = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars())
      return fromPixels(insets.top, insets.right, insets.bottom, insets.left, view.resources.displayMetrics.density)
    }
  }
}
