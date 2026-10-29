# Distribution metadata (draft for review)

Prepared content for listings outside this repository. Nothing here has been submitted or changed on GitHub or React Native Directory.

## GitHub repository

**Description**

> Detect the Android navigation mode (gesture, 2-button, 3-button) synchronously and read navigation bar insets in React Native. TurboModule, Legacy Architecture, Expo dev builds.

**Topics**

`react-native`, `android`, `navigation-bar`, `gesture-navigation`, `navigation-mode`, `window-insets`, `edge-to-edge`, `turbo-module`, `new-architecture`, `expo`

## React Native Directory

Entry for `react-native-libraries.json` in [react-native-community/directory](https://github.com/react-native-community/directory). Submit only after the New Architecture release gate is met and the compatibility matrix in the README reflects verified results.

```json
{
  "githubUrl": "https://github.com/luongminh2410dev/react-native-android-navigation-mode",
  "npmPkg": "react-native-android-navigation-mode",
  "examples": [
    "https://github.com/luongminh2410dev/react-native-android-navigation-mode/tree/main/example"
  ],
  "android": true,
  "ios": false,
  "expoGo": false,
  "newArchitecture": true
}
```

- `ios: false`: the package has no iOS native code; its JS API only returns fallbacks on iOS.
- `expoGo: false`: requires a development or production build.

## Release notes reminder

The release must state that the new JS API needs the matching native methods: consumers rebuild the Android app after upgrading.
