# Changelog

## Unreleased

### Added

- `getAndroidNavigationModeInfo()` and `useAndroidNavigationModeInfo()`: detailed result with `mode` (including `'unknown'`), `interactionMode` and `source`.
- Android 9 detection of the swipe-up 2-button mode via `swipe_up_to_switch_apps_enabled`.

### Fixed

- A system resource value outside `0/1/2`, or a failed resource read, now falls back to the `navigation_mode` secure setting instead of reporting `3-button` or throwing. This can change the value returned by `getAndroidNavigationMode()` on affected devices.
- Android 9 devices using the swipe-up gesture now report `2-button` from `getAndroidNavigationMode()` instead of `3-button`.

### Changed

- The native module is resolved when a getter runs on Android instead of at import time.

### Upgrade notes

- Rebuild the Android app after upgrading: the new JS API needs the new native methods. Calling `getAndroidNavigationModeInfo()` against an old binary throws an error asking for a rebuild.
