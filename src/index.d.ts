export type AndroidNavigationMode = 'gesture' | '2-button' | '3-button';

export declare const NAVIGATION_MODE: {
  GESTURE: 'gesture';
  TWO_BUTTON: '2-button';
  THREE_BUTTON: '3-button';
};

/**
 * Detailed navigation mode result. New `source` values may be added in minor releases;
 * handle unrecognized values with a default branch.
 */
export type AndroidNavigationModeInfo = {
  /** `'unknown'` when Android 10+ exposes no valid value, or outside Android. */
  mode: AndroidNavigationMode | 'unknown';
  /** Android interaction mode: `0` 3-button, `1` 2-button, `2` gesture; `null` when `mode` is `'unknown'`. */
  interactionMode: 0 | 1 | 2 | null;
  /**
   * - `resource`: system resource `config_navBarInteractionMode`
   * - `secure-settings`: secure setting `navigation_mode`
   * - `swipe-up-setting`: Android 9 secure setting `swipe_up_to_switch_apps_enabled`
   * - `sdk-default`: Android 9 and earlier without a readable setting, which have no gesture navigation
   * - `unavailable`: Android 10+ without a valid value
   * - `unsupported`: not running on Android
   */
  source:
    | 'resource'
    | 'secure-settings'
    | 'swipe-up-setting'
    | 'sdk-default'
    | 'unavailable'
    | 'unsupported';
};

/** On Android, returns `'3-button'` when the mode cannot be determined; returns `'gesture'` elsewhere. */
export declare function getAndroidNavigationMode(): AndroidNavigationMode;

export declare function useAndroidNavigationMode(): AndroidNavigationMode;

/** Throws when the native module is not linked or the installed native code predates this method. */
export declare function getAndroidNavigationModeInfo(): AndroidNavigationModeInfo;

/** Getter errors are returned in `error` with `info: null` instead of being thrown. */
export declare function useAndroidNavigationModeInfo(): {
  info: AndroidNavigationModeInfo | null;
  error: Error | null;
};
