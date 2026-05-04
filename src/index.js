import { useEffect, useState } from 'react';
import { AppState, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";

const AndroidNavigationModeModule = NativeModules.AndroidNavigationMode;

export const NAVIGATION_MODE = {
  GESTURE: 'gesture',
  TWO_BUTTON: '2-button',
  THREE_BUTTON: '3-button'
};

export function getAndroidNavigationMode() {
  if (Platform.OS !== 'android') {
    return NAVIGATION_MODE.GESTURE;
  }

  if (!AndroidNavigationModeModule || typeof AndroidNavigationModeModule.getNavigationMode !== 'function') {
    throw new Error(LINKING_ERROR);
  }

  const value = AndroidNavigationModeModule.getNavigationMode();
  if (value === NAVIGATION_MODE.GESTURE || value === NAVIGATION_MODE.TWO_BUTTON || value === NAVIGATION_MODE.THREE_BUTTON) {
    return value;
  }

  return NAVIGATION_MODE.THREE_BUTTON;
}

/**
 * React hook that returns the current Android navigation mode and refreshes
 * when the app returns to foreground (user may have changed system settings).
 *
 * On non-Android platforms, always returns {@link NAVIGATION_MODE.GESTURE}.
 */
export function useAndroidNavigationMode() {
  const [mode, setMode] = useState(() =>
    Platform.OS !== 'android' ? NAVIGATION_MODE.GESTURE : getAndroidNavigationMode()
  );

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const refresh = () => {
      setMode(getAndroidNavigationMode());
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  }, []);

  return mode;
}
