# Compatibility matrix

Peer requirements: React Native 0.71+, React 18+. The Android build uses Java/Kotlin target 17 (JDK 17).

Verified on 2026-10-29 with the [example fixtures](../example/README.md) (0.76, 0.81, and 0.82 generated with `example/scripts/create-fixture.sh`): release build, then on an Android 16 (API 36) emulator — gesture, 2-button, and 3-button detection, foreground refresh, and navigation bar insets in portrait and landscape. On React Native 0.88 the insets were also checked with the bar hidden (immersive), with the keyboard open (insets unchanged), and next to an app-owned insets listener (still receives every update).

| React Native | Legacy Architecture | New Architecture |
| --- | --- | --- |
| 0.71.19 | Build and runtime verified | Not verified |
| 0.76.9 | Build and runtime verified | Build and runtime verified |
| 0.81.6 | Build and runtime verified | Build and runtime verified |
| 0.82.1 | Not available (React Native 0.82+ always uses the New Architecture) | Build and runtime verified |
| 0.88.1 | Not available | Build and runtime verified, including with the TurboModule interop layer disabled |
| Expo SDK 58 (0.88.1) | Not available | Build and runtime verified (development build path, `expo prebuild`) |

Versions between the rows are expected to work but were not tested individually. Not yet verified on real devices or OEM navigation implementations, or on Android 9 and earlier.
