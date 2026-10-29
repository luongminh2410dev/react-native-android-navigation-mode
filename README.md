<div align="center">

# 📱 react-native-android-navigation-mode

**Know whether the user navigates Android with gestures, 2 buttons, or 3 buttons — synchronously — and measure the navigation bar of the current window.**

[![npm version](https://img.shields.io/npm/v/react-native-android-navigation-mode?color=cb3837&logo=npm)](https://www.npmjs.com/package/react-native-android-navigation-mode)
[![npm downloads](https://img.shields.io/npm/dm/react-native-android-navigation-mode?color=cb3837)](https://www.npmjs.com/package/react-native-android-navigation-mode)
[![CI](https://img.shields.io/github/actions/workflow/status/luongminh2410dev/react-native-android-navigation-mode/ci.yml?branch=main&label=CI&logo=github)](https://github.com/luongminh2410dev/react-native-android-navigation-mode/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-android-navigation-mode)](LICENSE)
<br />
[![platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)](docs/detection-and-platform-behavior.md)
[![New Architecture](https://img.shields.io/badge/New%20Architecture-TurboModule-61DAFB?logo=react&logoColor=black)](docs/compatibility-matrix.md)
[![Expo](https://img.shields.io/badge/Expo-dev%20build-000020?logo=expo&logoColor=white)](#installation)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white)](src/index.d.ts)

</div>

## Why

| | |
| --- | --- |
| 👆 **Edge gestures** | On gesture navigation, edge swipes go back. Keep carousels, drawers, and swipe actions away from the edges. |
| 📐 **Bottom UI** | A thin gesture handle and a full button bar call for different bottom sheets and bars. |
| 🖼️ **Edge-to-edge** | Android 15 enforces it for apps targeting SDK 35. Read real insets instead of guessing from the mode. |

## Features

- **Synchronous** detection — no `await`, no loading state, usable outside components
- `gesture` · `2-button` · `3-button`, plus a detailed result with `unknown` and the data source
- Hooks that refresh when the app returns to the foreground
- Navigation bar insets per edge (dp), updated on rotation and when the bar hides or shows
- Legacy and New Architecture (real TurboModule, works with interop disabled) · React Native 0.71+
- Android native code only, **zero runtime dependencies**

## Installation

```bash
npm install react-native-android-navigation-mode
```

> ⚠️ **Rebuild the Android app** after installing or upgrading — the JS API needs the matching native methods.

- **iOS:** nothing to install; the API returns [documented fallbacks](docs/detection-and-platform-behavior.md).
- **Expo:** works in development and production builds, not in Expo Go. Autolinking is enough; the `react-native-android-navigation-mode` config plugin entry is optional and makes no changes.

## Usage

```tsx
import {
  getAndroidNavigationMode,
  useAndroidNavigationMode,
  NAVIGATION_MODE,
} from "react-native-android-navigation-mode";

// Anywhere, no await
if (getAndroidNavigationMode() === NAVIGATION_MODE.GESTURE) {
  // keep swipe targets away from the screen edges
}

// In components: refreshes when the app returns to the foreground
function Screen() {
  const mode = useAndroidNavigationMode();
  return null;
}
```

Need to know when the mode could not be read? Use the detailed result and pick your own fallback:

```ts
import { getAndroidNavigationModeInfo } from "react-native-android-navigation-mode";

const { mode, interactionMode, source } = getAndroidNavigationModeInfo();
// { mode: 'gesture', interactionMode: 2, source: 'resource' } — mode can be 'unknown'
```

Navigation bar size, per edge in dp:

```tsx
import { useAndroidNavigationBarInsets } from "react-native-android-navigation-mode";

const { insets } = useAndroidNavigationBarInsets(); // { top, right, bottom, left } | null
```

> 💡 **Using `react-native-safe-area-context`?** Its insets already include the navigation bar — see [insets and safe area](docs/navigation-bar-insets-and-safe-area.md) to avoid double padding.

## API

| Export | Returns |
| --- | --- |
| `getAndroidNavigationMode()` / `useAndroidNavigationMode()` | `'gesture' \| '2-button' \| '3-button'` (`'3-button'` when unknown on Android, `'gesture'` elsewhere) |
| `getAndroidNavigationModeInfo()` / `useAndroidNavigationModeInfo()` | `{ mode, interactionMode, source }`, with `'unknown'` when undetermined |
| `getAndroidNavigationBarInsets()` / `useAndroidNavigationBarInsets()` | `{ top, right, bottom, left }` in dp, or `null` |
| `getAndroidNavigationBarHeight()` | Bar thickness in dp, or `null` |
| `NAVIGATION_MODE` | Mode constants |

Full details, errors, and types: [API reference](docs/api-reference.md).

## Documentation

| | |
| --- | --- |
| [API reference](docs/api-reference.md) | Every export, its results and errors |
| [Detection and platform behavior](docs/detection-and-platform-behavior.md) | Data sources, Android versions, OEM limits |
| [Navigation bar insets and safe area](docs/navigation-bar-insets-and-safe-area.md) | Layout without double padding |
| [Compatibility matrix](docs/compatibility-matrix.md) | Verified React Native versions and architectures |
| [Testing with Jest](docs/testing-with-jest.md) | Transform or mock the package |
| [Example apps](example/README.md) | RN 0.71, RN 0.88, Expo SDK 58 |
| [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) | |

## Acknowledgments

Development assisted by Codex and Claude.

## License

MIT
