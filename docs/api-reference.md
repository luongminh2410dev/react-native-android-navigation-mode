# API reference

All exports are typed in [`src/index.d.ts`](../src/index.d.ts).

| Export | Returns | Sync |
| --- | --- | --- |
| [`getAndroidNavigationMode()`](#getandroidnavigationmode) | `'gesture' \| '2-button' \| '3-button'` | Yes |
| [`useAndroidNavigationMode()`](#useandroidnavigationmode) | same, as React state | Yes |
| [`NAVIGATION_MODE`](#navigation_mode) | mode constants | — |
| [`getAndroidNavigationModeInfo()`](#getandroidnavigationmodeinfo) | `AndroidNavigationModeInfo` | Yes |
| [`useAndroidNavigationModeInfo()`](#useandroidnavigationmodeinfo) | `{ info, error }` | Yes |
| [`getAndroidNavigationBarInsets()`](#getandroidnavigationbarinsets) | `Promise<AndroidNavigationBarInsets \| null>` | No |
| [`getAndroidNavigationBarHeight()`](#getandroidnavigationbarheight) | `Promise<number \| null>` | No |
| [`useAndroidNavigationBarInsets()`](#useandroidnavigationbarinsets) | `{ insets, error }` | No |

## Navigation mode

### `getAndroidNavigationMode()`

```ts
getAndroidNavigationMode(): 'gesture' | '2-button' | '3-button'
```

- Android: the detected system mode, or `'3-button'` when it cannot be determined.
- Other platforms: `'gesture'`.
- Throws when the native module is not linked.

### `useAndroidNavigationMode()`

Same values as `getAndroidNavigationMode()`, as React state. On Android it reads again when `AppState` becomes `active`, so a navigation style changed in system settings shows up when the user returns. On other platforms it always returns `'gesture'`.

### `NAVIGATION_MODE`

Constants for comparisons: `NAVIGATION_MODE.GESTURE`, `NAVIGATION_MODE.TWO_BUTTON`, `NAVIGATION_MODE.THREE_BUTTON`.

### `getAndroidNavigationModeInfo()`

```ts
type AndroidNavigationModeInfo = {
  mode: 'gesture' | '2-button' | '3-button' | 'unknown';
  interactionMode: 0 | 1 | 2 | null; // 0 = 3-button, 1 = 2-button, 2 = gesture
  source: 'resource' | 'secure-settings' | 'swipe-up-setting' | 'sdk-default' | 'unavailable' | 'unsupported';
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

New `source` values may be added in minor releases; keep a default branch when switching on it. See [detection and platform behavior](detection-and-platform-behavior.md) for the order in which sources are read.

Throws when the native module is not linked, or when the installed native code does not provide this method (rebuild the app after upgrading).

```ts
const info = getAndroidNavigationModeInfo();
const mode = info.mode === 'unknown' ? NAVIGATION_MODE.THREE_BUTTON : info.mode; // your own fallback
```

### `useAndroidNavigationModeInfo()`

```ts
useAndroidNavigationModeInfo(): { info: AndroidNavigationModeInfo | null; error: Error | null }
```

Reads synchronously on the first render and again when `AppState` becomes `active`. Getter errors are returned as `{ info: null, error }` instead of being thrown; a later successful read clears the error.

## Navigation bar insets

See [navigation bar insets and safe area](navigation-bar-insets-and-safe-area.md) for when to use these.

### `getAndroidNavigationBarInsets()`

```ts
type AndroidNavigationBarInsets = { top: number; right: number; bottom: number; left: number }; // dp

getAndroidNavigationBarInsets(): Promise<AndroidNavigationBarInsets | null>
```

Visible navigation bar insets of the current window.

- Every edge is `0` while the bar is hidden (for example in immersive mode).
- Resolves `null` when there is no activity or window insets yet, and outside Android. `null` is not an error.
- Excludes the status bar, the keyboard, and system gesture areas.
- Rejects when the native module is not linked, or when the installed native code does not provide this method.

### `getAndroidNavigationBarHeight()`

```ts
getAndroidNavigationBarHeight(): Promise<number | null>
```

The thickness of the navigation bar: the largest edge of `getAndroidNavigationBarInsets()`, or `null` when the insets are unavailable. In landscape the bar can be on the left or right, so do not use it as a bottom padding by default.

### `useAndroidNavigationBarInsets()`

```ts
useAndroidNavigationBarInsets(): { insets: AndroidNavigationBarInsets | null; error: Error | null }
```

Starts as `{ insets: null, error: null }`, reads after mount, and updates when the bar is shown or hidden, on rotation, when the activity changes, and when the app returns to the foreground. It observes the window without replacing or consuming your own insets listeners. Read errors are returned in `error`; a later successful read clears it.
