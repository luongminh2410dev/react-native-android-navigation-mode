import { useEffect, useState } from 'react';
import { AppState, NativeEventEmitter, Platform } from 'react-native';

const LINKING_ERROR =
  "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";

export const NAVIGATION_MODE = {
  GESTURE: 'gesture',
  TWO_BUTTON: '2-button',
  THREE_BUTTON: '3-button'
};

const UNKNOWN_MODE = 'unknown';
const VALID_INTERACTION_MODES = [0, 1, 2];
const INSETS_EVENT = 'androidNavigationBarInsetsDidChange';

function isNavigationMode(value) {
  return value === NAVIGATION_MODE.GESTURE || value === NAVIGATION_MODE.TWO_BUTTON || value === NAVIGATION_MODE.THREE_BUTTON;
}

/**
 * Resolves the native module through the Codegen spec. Required lazily so non-Android platforms never load it.
 * `TurboModuleRegistry.get` returns the TurboModule on the New Architecture and the bridge module on the legacy one.
 */
function getNativeModule() {
  return require('./NativeAndroidNavigationMode').default;
}

function getNativeModuleWithMethod(methodName) {
  const nativeModule = getNativeModule();
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

  const nativeModule = getNativeModule();
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

function toError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

function readNavigationModeInfoState() {
  try {
    return { info: getAndroidNavigationModeInfo(), error: null };
  } catch (error) {
    return { info: null, error: toError(error) };
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

function toInsetEdge(value) {
  return typeof value === 'number' && value > 0 ? value : 0;
}

function normalizeInsets(payload) {
  if (!payload) {
    return null;
  }

  return {
    top: toInsetEdge(payload.top),
    right: toInsetEdge(payload.right),
    bottom: toInsetEdge(payload.bottom),
    left: toInsetEdge(payload.left)
  };
}

function isSameInsets(previous, next) {
  if (!previous || !next) {
    return previous === next;
  }

  return (
    previous.top === next.top && previous.right === next.right && previous.bottom === next.bottom && previous.left === next.left
  );
}

/**
 * Reads the visible navigation bar insets of the current window, in dp, on each edge.
 *
 * Resolves `{ top: 0, right: 0, bottom: 0, left: 0 }` while the bar is hidden, and `null` when no window
 * insets are available yet (no activity or window) or outside Android. Excludes status bar, keyboard,
 * and system gesture insets. Rejects when the native module is not linked or predates this method.
 */
export async function getAndroidNavigationBarInsets() {
  if (Platform.OS !== 'android') {
    return null;
  }

  const nativeModule = getNativeModuleWithMethod('getNavigationBarInsets');
  return normalizeInsets(await nativeModule.getNavigationBarInsets());
}

/**
 * Resolves the thickness of the navigation bar: the largest edge of {@link getAndroidNavigationBarInsets}.
 * In landscape the bar can sit on a side edge, so this is not necessarily a bottom padding.
 * Resolves `null` when the insets are unavailable.
 */
export async function getAndroidNavigationBarHeight() {
  const insets = await getAndroidNavigationBarInsets();
  return insets ? Math.max(insets.top, insets.right, insets.bottom, insets.left) : null;
}

const INITIAL_INSETS_STATE = { insets: null, error: null };

/**
 * React hook for {@link getAndroidNavigationBarInsets}. Starts as `{ insets: null, error: null }`, reads after
 * mount, and updates when the insets change (bar shown or hidden, rotation, activity change) and when the app
 * becomes active. Results of reads superseded by a newer read or event are ignored.
 *
 * Errors are returned as `{ insets: null, error }` instead of being thrown.
 */
export function useAndroidNavigationBarInsets() {
  const [state, setState] = useState(INITIAL_INSETS_STATE);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    let mounted = true;
    let latestReadId = 0;
    // Only this effect updates the state, so it can skip updates that would not change the result.
    let current = INITIAL_INSETS_STATE;

    const apply = (next) => {
      if (!current.error && !next.error && isSameInsets(current.insets, next.insets)) {
        return;
      }
      current = next;
      setState(next);
    };

    let insetsSubscription;
    try {
      const emitter = new NativeEventEmitter(getNativeModuleWithMethod('addListener'));
      insetsSubscription = emitter.addListener(INSETS_EVENT, (payload) => {
        latestReadId += 1;
        apply({ insets: normalizeInsets(payload), error: null });
      });
    } catch (error) {
      apply({ insets: null, error: toError(error) });
      return undefined;
    }

    const read = () => {
      latestReadId += 1;
      const readId = latestReadId;
      getAndroidNavigationBarInsets().then(
        (insets) => {
          if (mounted && readId === latestReadId) {
            apply({ insets, error: null });
          }
        },
        (error) => {
          if (mounted && readId === latestReadId) {
            apply({ insets: null, error: toError(error) });
          }
        }
      );
    };

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        read();
      }
    });
    read();

    return () => {
      mounted = false;
      insetsSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  return state;
}
