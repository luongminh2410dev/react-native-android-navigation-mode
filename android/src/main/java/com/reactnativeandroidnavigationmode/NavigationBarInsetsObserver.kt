package com.reactnativeandroidnavigationmode

import android.view.View
import android.view.ViewTreeObserver
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

/**
 * Reports navigation bar inset changes of the current activity window while JS has subscribers.
 *
 * Uses its own global layout listener on the decor view instead of an insets listener, so it never replaces
 * or consumes the host app's insets handling. Holds the decor view only while the activity is alive.
 */
internal class NavigationBarInsetsObserver(
  private val reactContext: ReactApplicationContext,
  private val onChange: (NavigationBarInsets?) -> Unit,
) : LifecycleEventListener {

  private var subscriberCount = 0
  private var observedView: View? = null
  private var hasReported = false
  private var lastReported: NavigationBarInsets? = null
  private val layoutListener = ViewTreeObserver.OnGlobalLayoutListener { report() }

  fun addSubscriber() = UiThreadUtil.runOnUiThread {
    subscriberCount += 1
    if (subscriberCount == 1) {
      reactContext.addLifecycleEventListener(this)
      observeCurrentActivity()
    }
  }

  fun removeSubscribers(count: Int) = UiThreadUtil.runOnUiThread {
    if (subscriberCount == 0) {
      return@runOnUiThread
    }
    subscriberCount = (subscriberCount - count).coerceAtLeast(0)
    if (subscriberCount == 0) {
      stop()
    }
  }

  fun release() = UiThreadUtil.runOnUiThread {
    subscriberCount = 0
    stop()
  }

  override fun onHostResume() {
    // A recreated or different activity may be current after resume.
    observeCurrentActivity()
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() {
    detach()
  }

  private fun observeCurrentActivity() {
    val decorView = reactContext.currentActivity?.window?.decorView
    if (decorView !== observedView) {
      detach()
      observedView = decorView
      decorView?.viewTreeObserver?.addOnGlobalLayoutListener(layoutListener)
    }
    report()
  }

  private fun report() {
    val insets = NavigationBarInsets.read(observedView)
    if (!hasReported || insets != lastReported) {
      hasReported = true
      lastReported = insets
      onChange(insets)
    }
  }

  private fun detach() {
    observedView?.viewTreeObserver?.takeIf { it.isAlive }?.removeOnGlobalLayoutListener(layoutListener)
    observedView = null
  }

  private fun stop() {
    reactContext.removeLifecycleEventListener(this)
    detach()
    hasReported = false
    lastReported = null
  }
}
