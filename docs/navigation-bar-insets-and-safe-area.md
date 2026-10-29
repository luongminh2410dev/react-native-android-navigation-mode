# Navigation bar insets and safe area

Navigation mode tells you how the user navigates, not how much space the bar takes: a gesture device still shows a handle, the bar can be hidden, and in landscape it can sit on a side edge. For layout, use insets, not the mode.

## With react-native-safe-area-context

If your app already uses [`react-native-safe-area-context`](https://github.com/AppAndFlow/react-native-safe-area-context), its bottom inset **already includes** the navigation bar. Take padding from the safe area only; do not add the navigation bar inset on top of it.

```tsx
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAndroidNavigationBarInsets } from 'react-native-android-navigation-mode';

function BottomBar({ children }) {
  const safeArea = useSafeAreaInsets();
  const { insets: navigationBar } = useAndroidNavigationBarInsets();

  // The navigation bar inset only decides how to style the area behind the bar.
  const barVisibleAtBottom = (navigationBar?.bottom ?? 0) > 0;

  return (
    <View style={{ paddingBottom: safeArea.bottom, backgroundColor: barVisibleAtBottom ? '#ffffff' : 'transparent' }}>
      {children}
    </View>
  );
}
```

## What the insets report

- Values are in dp, per edge, for the navigation bar only: no status bar, keyboard, or system gesture areas.
- A hidden bar reports `0` on every edge; `null` means the window has no insets yet (or not Android).
- In landscape with button navigation the bar usually moves to a side edge, so `right` or `left` is non-zero and `bottom` is `0`.
- `getAndroidNavigationBarHeight()` is the bar's thickness (largest edge). Use it for sizing, not as a bottom padding.
