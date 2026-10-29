import { useEffect, useState } from 'react';
import { AppState, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";

export const NAVIGATION_MODE = {
  GESTURE: 'gesture',
  TWO_BUTTON: '2-button',
  THREE_BUTTON: '3-button'
};

const UNKNOWN_MODE = 'unknown';
const VALID_INTERACTION_MODES = [0, 1, 2];

function isNavigationMode(value) {
  return value === NAVIGATION_MODE.GESTURE || value === NAVIGATION_MODE.TWO_BUTTON || value === NAVIGATION_MODE.THREE_BUTTON;
}

/** Resolves the native module lazily so non-Android platforms never touch it. */
function getNativeModuleWithMethod(methodName) {
  const nativeModule = NativeModules.AndroidNavigationMode;
  if (!nativeModule) {
    throw new Error(LINKING_ERROR);
  }

  if (typeof nativeModule[methodName] !== 'function') {
    throw new Error(
      `The installed native code of 'react-native-android-navigation-mode' does not provide ${methodName}(). ` +
        'Rebuild the Android app after upgrading the package.'
    );
  }

  return nativeModule;
}

/**
 * Returns the current Android navigation mode.
 *
 * On Android, returns `'3-button'` when the mode cannot be determined.
 * On non-Android platforms, returns {@link NAVIGATION_MODE.GESTURE}.
 * Throws when the native module is not linked.
 */
export function getAndroidNavigationMode() {
  if (Platform.OS !== 'android') {
    return NAVIGATION_MODE.GESTURE;
  }

  const nativeModule = NativeModules.AndroidNavigationMode;
  if (!nativeModule || typeof nativeModule.getNavigationMode !== 'function') {
    throw new Error(LINKING_ERROR);
  }

  const value = nativeModule.getNavigationMode();
  if (isNavigationMode(value)) {
    return value;
  }

  return NAVIGATION_MODE.THREE_BUTTON;
}

/**
 * Returns the detected navigation mode together with the raw interaction mode and the data source.
 *
 * `mode` is `'unknown'` when Android 10+ exposes no valid value, and outside Android
 * (with `source: 'unsupported'`). New `source` values may be added in minor releases.
 * Throws when the native module is not linked or the installed native code predates this method.
 */
export function getAndroidNavigationModeInfo() {
  if (Platform.OS !== 'android') {
    return { mode: UNKNOWN_MODE, interactionMode: null, source: 'unsupported' };
  }

  const info = getNativeModuleWithMethod('getNavigationModeInfo').getNavigationModeInfo() || {};
  if (!isNavigationMode(info.mode)) {
    return { mode: UNKNOWN_MODE, interactionMode: null, source: 'unavailable' };
  }

  return {
    mode: info.mode,
    interactionMode: VALID_INTERACTION_MODES.includes(info.interactionMode) ? info.interactionMode : null,
    source: info.source
  };
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

function readNavigationModeInfoState() {
  try {
    return { info: getAndroidNavigationModeInfo(), error: null };
  } catch (error) {
    return { info: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

function isSameInfoState(previous, next) {
  if (previous.error || next.error || !previous.info || !next.info) {
    return false;
  }

  return (
    previous.info.mode === next.info.mode &&
    previous.info.interactionMode === next.info.interactionMode &&
    previous.info.source === next.info.source
  );
}

/**
 * React hook for {@link getAndroidNavigationModeInfo}. Reads synchronously on first render,
 * re-reads after subscribing and whenever the app becomes active.
 *
 * Errors from the getter are returned as `{ info: null, error }` instead of being thrown.
 */
export function useAndroidNavigationModeInfo() {
  const [state, setState] = useState(readNavigationModeInfoState);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const refresh = () => {
      const next = readNavigationModeInfoState();
      setState((previous) => (isSameInfoState(previous, next) ? previous : next));
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refresh();
      }
    });
    refresh();

    return () => subscription.remove();
  }, []);

  return state;
}
