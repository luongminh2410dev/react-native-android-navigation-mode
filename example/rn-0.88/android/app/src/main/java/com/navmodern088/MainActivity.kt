package com.navmodern088

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NavModeRn088"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    applyRuntimeCheckExtras(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    applyRuntimeCheckExtras(intent)
  }

  /**
   * Fixture-only switches for runtime checks, set with `adb shell am start ... --ez <extra> true|false`:
   * - `hostInsetsListener`: installs an app-owned insets listener that logs what the host app receives.
   * - `immersive`: hides (true) or shows (false) the navigation bar.
   */
  private fun applyRuntimeCheckExtras(intent: Intent?) {
    if (intent == null) {
      return
    }
    if (intent.getBooleanExtra("hostInsetsListener", false)) {
      installHostInsetsListener()
    }
    if (intent.hasExtra("immersive")) {
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      if (intent.getBooleanExtra("immersive", false)) {
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        controller.hide(WindowInsetsCompat.Type.navigationBars())
      } else {
        controller.show(WindowInsetsCompat.Type.navigationBars())
      }
    }
  }

  private fun installHostInsetsListener() {
    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val navigationBars = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
      val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
      Log.i(
        "NavigationModeExample",
        "hostInsetsListener navigationBarsPx=${navigationBars.left},${navigationBars.top},${navigationBars.right},${navigationBars.bottom} imeBottomPx=${ime.bottom}",
      )
      ViewCompat.onApplyWindowInsets(view, insets)
    }
    ViewCompat.requestApplyInsets(content)
  }
}
