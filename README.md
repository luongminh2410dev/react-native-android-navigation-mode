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

## Quick usage

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

## Full example (React Native component)

```tsx
import React from "react";
import { Platform, Text, View } from "react-native";
import {
  getAndroidNavigationMode,
  NAVIGATION_MODE,
} from "react-native-android-navigation-mode";

export default function NavigationModeExample() {
  const mode = getAndroidNavigationMode();

  const message =
    mode === NAVIGATION_MODE.GESTURE
      ? "Gesture navigation is enabled"
      : mode === NAVIGATION_MODE.TWO_BUTTON
        ? "2-button navigation is enabled"
        : "3-button navigation is enabled";

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Navigation Mode
      </Text>
      <Text>{message}</Text>
      <Text style={{ marginTop: 8, opacity: 0.7 }}>
        Platform: {Platform.OS} | Raw value: {mode}
      </Text>
    </View>
  );
}
```

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

## Platform behavior

- Android: reads system config `config_navBarInteractionMode`
- Some OEM devices: uses fallback secure setting `navigation_mode`
- iOS / other platforms: fallback to `'gesture'`

## Best practices

- Read mode at app start and when app returns to foreground if needed
- Use constants from `NAVIGATION_MODE` instead of hardcoded strings
- Treat the value as runtime-dependent (user can change system settings)
