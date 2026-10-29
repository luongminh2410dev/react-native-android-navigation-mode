# react-native-android-navigation-mode

Lightweight React Native native module to detect the current Android system navigation mode, synchronously.

## What this library detects

- `gesture`
- `2-button`
- `3-button`

The detailed API also reports `unknown` and where the result came from, so your app chooses its own fallback.

## Why use this

- Adjust UI/UX based on Android navigation style
- Handle edge gestures more safely on gesture devices
- Keep a consistent experience across OEMs

## Installation

```bash
npm install react-native-android-navigation-mode
```

Rebuild the Android app after installing or upgrading. The JS API calls native methods that must exist in the installed binary.

The package has native code for Android only. There is nothing to install for iOS; on other platforms the JS API returns the fallbacks described below.

## Expo

This package includes **custom native Android code**. It does **not** run inside **Expo Go**. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or a production build (`expo prebuild` / EAS Build).

Autolinking registers the native module. The package also ships a config plugin entry that currently makes no changes, so adding it to `plugins` is optional:

```json
{
  "expo": {
    "plugins": ["react-native-android-navigation-mode"]
  }
}
```

After installing, rebuild native Android (e.g. `npx expo prebuild --clean` then run the dev client, or trigger a new EAS Android build).

## Quick usage

### Function API

```ts
import {
  getAndroidNavigationMode,
  NAVIGATION_MODE,
} from "react-native-android-navigation-mode";

const mode = getAndroidNavigationMode();

if (mode === NAVIGATION_MODE.GESTURE) {
  // Example: avoid placing swipe targets on the screen edges
}
```

### Hook API

```tsx
import { useAndroidNavigationMode, NAVIGATION_MODE } from "react-native-android-navigation-mode";

function Screen() {
  const mode = useAndroidNavigationMode();

  if (mode === NAVIGATION_MODE.GESTURE) {
    // ...
  }

  return null;
}
```

The hook re-reads the mode when the app becomes **active** again (e.g. user changed navigation style in system settings and came back to your app).

### Detailed API with your own fallback

```ts
import {
  getAndroidNavigationModeInfo,
  NAVIGATION_MODE,
} from "react-native-android-navigation-mode";

const info = getAndroidNavigationModeInfo();
// { mode: 'gesture', interactionMode: 2, source: 'resource' }

const mode = info.mode === "unknown" ? NAVIGATION_MODE.THREE_BUTTON : info.mode;
```

```tsx
import { useAndroidNavigationModeInfo } from "react-native-android-navigation-mode";

function NavigationDebug() {
  const { info, error } = useAndroidNavigationModeInfo();

  if (error) {
    // e.g. native module not linked, or the app was not rebuilt after upgrading
    return null;
  }

  return null; // render info.mode / info.source
}
```

## API

### `getAndroidNavigationMode(): 'gesture' | '2-button' | '3-button'`

Returns the current Android navigation mode.

- On Android: returns the detected system mode, or `'3-button'` when it cannot be determined
- On non-Android platforms: returns `'gesture'`
- Throws when the native module is not linked

### `useAndroidNavigationMode(): 'gesture' | '2-button' | '3-button'`

Same values as `getAndroidNavigationMode`, as React state. On Android, updates again when `AppState` becomes `active` so changes made in system settings are reflected after the user returns to the app.

On non-Android platforms, always returns `'gesture'`.

### `NAVIGATION_MODE`

Constants for stable comparisons:

- `NAVIGATION_MODE.GESTURE`
- `NAVIGATION_MODE.TWO_BUTTON`
- `NAVIGATION_MODE.THREE_BUTTON`

### `getAndroidNavigationModeInfo(): AndroidNavigationModeInfo`

```ts
type AndroidNavigationModeInfo = {
  mode: 'gesture' | '2-button' | '3-button' | 'unknown';
  interactionMode: 0 | 1 | 2 | null; // 0 = 3-button, 1 = 2-button, 2 = gesture
  source:
    | 'resource'
    | 'secure-settings'
    | 'swipe-up-setting'
    | 'sdk-default'
    | 'unavailable'
    | 'unsupported';
};
```

| `source` | Meaning |
| --- | --- |
| `resource` | System resource `config_navBarInteractionMode` |
| `secure-settings` | Secure setting `navigation_mode`, used when the resource is missing or invalid |
| `swipe-up-setting` | Android 9 secure setting `swipe_up_to_switch_apps_enabled` (swipe-up 2-button mode) |
| `sdk-default` | Android 9 and earlier without a readable value; these versions have no gesture navigation, so `mode` is `'3-button'` |
| `unavailable` | Android 10+ without a valid value; `mode` is `'unknown'` |
| `unsupported` | Not running on Android; `mode` is `'unknown'`, native code is not called |

New `source` values may be added in minor releases. Keep a default branch when switching on it.

Throws when the native module is not linked, or when the installed native code does not provide this method (rebuild the app).

### `useAndroidNavigationModeInfo(): { info: AndroidNavigationModeInfo | null; error: Error | null }`

Reads synchronously on the first render and again when `AppState` becomes `active`. Getter errors are returned as `{ info: null, error }` instead of being thrown; a later successful read clears the error.

## Navigation mode is not a safe-area inset

The mode tells you how the user navigates, not how much space the system bars take. A gesture device can still show a navigation handle, the bar can be hidden, and in landscape it can sit on a side edge. Use window insets (for example `react-native-safe-area-context`) for padding, and do not derive bottom padding from the mode alone.

## Platform behavior and limits

- Android 10+: reads the system resource `config_navBarInteractionMode`, then the secure setting `navigation_mode` when the resource is missing or invalid.
- Android 9: additionally reads `swipe_up_to_switch_apps_enabled`; otherwise reports `3-button`.
- Android 8.1 and earlier: reports `3-button`.
- iOS / other platforms: the legacy API returns `'gesture'`; the detailed API returns `unknown` with `source: 'unsupported'`.

Detection relies on values the system exposes. Some OEM builds use their own navigation implementations that these values do not reflect, so treat the result as the system's reported mode rather than a guarantee.

## Testing in your app (Jest)

The package ships untranspiled ES modules. Jest setups based on the React Native preset do not transform `node_modules` packages outside their allow list, so either add the package to `transformIgnorePatterns`:

```js
transformIgnorePatterns: [
  "node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-android-navigation-mode)/)",
],
```

or mock it:

```js
jest.mock("react-native-android-navigation-mode", () => ({
  NAVIGATION_MODE: { GESTURE: "gesture", TWO_BUTTON: "2-button", THREE_BUTTON: "3-button" },
  getAndroidNavigationMode: () => "3-button",
  useAndroidNavigationMode: () => "3-button",
  getAndroidNavigationModeInfo: () => ({ mode: "3-button", interactionMode: 0, source: "resource" }),
  useAndroidNavigationModeInfo: () => ({ info: { mode: "3-button", interactionMode: 0, source: "resource" }, error: null }),
}));
```
