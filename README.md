# react-native-android-navigation-mode

Lightweight React Native native module to detect the current Android system navigation mode.

## What this library detects

- `gesture`
- `2-button`
- `3-button`

## Why use this

- Adjust UI/UX based on Android navigation style
- Handle edge gestures more safely on gesture devices
- Keep a consistent experience across OEMs

## Installation

```bash
npm install react-native-android-navigation-mode
```

If your project includes iOS, run:

```bash
npx pod-install
```

## Expo

This package includes **custom native Android code**. It does **not** run inside **Expo Go**. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or a production build from EAS (`expo prebuild` / EAS Build).

1. Install the package (same as above).

2. Register the config plugin in `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["react-native-android-navigation-mode"]
  }
}
```

3. Rebuild native Android (e.g. `npx expo prebuild --clean` then run the dev client, or trigger a new EAS Android build).

Autolinking still applies; the plugin entry is the supported way to declare the dependency in Expo-managed projects and leaves room for future native tweaks if needed.

## Quick usage

### Function API

```ts
import {
  getAndroidNavigationMode,
  NAVIGATION_MODE,
} from "react-native-android-navigation-mode";

const mode = getAndroidNavigationMode();

if (mode === NAVIGATION_MODE.GESTURE) {
  // Example: add more bottom safe area / avoid gesture conflicts
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

## API

### `getAndroidNavigationMode(): 'gesture' | '2-button' | '3-button'`

Returns the current Android navigation mode.

- On Android: returns actual system mode
- On non-Android platforms: returns `'gesture'` (safe fallback)

### `NAVIGATION_MODE`

Constants for stable comparisons:

- `NAVIGATION_MODE.GESTURE`
- `NAVIGATION_MODE.TWO_BUTTON`
- `NAVIGATION_MODE.THREE_BUTTON`

### `useAndroidNavigationMode(): 'gesture' | '2-button' | '3-button'`

Same values as `getAndroidNavigationMode`, as React state. On Android, updates again when `AppState` becomes `active` so changes made in system settings are reflected after the user returns to the app.

On non-Android platforms, always returns `'gesture'`.

## Platform behavior

- Android: reads system config `config_navBarInteractionMode`
- Some OEM devices: uses fallback secure setting `navigation_mode`
- iOS / other platforms: fallback to `'gesture'`
