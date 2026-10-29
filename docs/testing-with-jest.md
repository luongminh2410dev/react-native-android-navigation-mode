# Testing with Jest

The package ships untranspiled source. Jest setups based on the React Native preset do not transform `node_modules` packages outside their allow list, so either add the package to `transformIgnorePatterns`:

```js
transformIgnorePatterns: [
  'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-android-navigation-mode)/)',
],
```

or mock it:

```js
jest.mock('react-native-android-navigation-mode', () => ({
  NAVIGATION_MODE: { GESTURE: 'gesture', TWO_BUTTON: '2-button', THREE_BUTTON: '3-button' },
  getAndroidNavigationMode: () => '3-button',
  useAndroidNavigationMode: () => '3-button',
  getAndroidNavigationModeInfo: () => ({ mode: '3-button', interactionMode: 0, source: 'resource' }),
  useAndroidNavigationModeInfo: () => ({ info: { mode: '3-button', interactionMode: 0, source: 'resource' }, error: null }),
  getAndroidNavigationBarInsets: async () => ({ top: 0, right: 0, bottom: 48, left: 0 }),
  getAndroidNavigationBarHeight: async () => 48,
  useAndroidNavigationBarInsets: () => ({ insets: { top: 0, right: 0, bottom: 48, left: 0 }, error: null }),
}));
```
