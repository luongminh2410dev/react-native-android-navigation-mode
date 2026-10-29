---
name: react-native-library-architecture
description: Use when adding or changing features, native code, JS API, types, autolinking, or Expo integration in this React Native Android library.
---

# React Native Library Architecture

Adapted from the jupi-app `react-native-apply-architecture-best-practices` skill for a published npm native module. Repository source wins over this summary; read the files before assuming behavior.

For non-trivial changes, present approach, scope, and material decisions (public API, native minimums, new dependencies) before implementation. Existing user approval covers the agreed scope. A plan in `docs/superpowers/plans/` records approved decisions and execution limits for its tasks; read it when the task belongs to it.

The layer map below is the current structure. When an authorized change adds layers (Codegen spec, tests, configs, `example/`), update this skill and `AGENTS.md` in the same task.

## Layer map

| Layer | Source | Responsibility |
| --- | --- | --- |
| Native module | `android/src/main/java/com/reactnativeandroidnavigationmode/AndroidNavigationModeModule.kt` | Bridge methods `getNavigationMode()` (legacy string) and `getNavigationModeInfo()` (map with `mode`, `interactionMode`, `source`), both synchronous. |
| Detector | `.../NavigationModeDetector.kt` | Decision logic and mode/source constants, free of Android APIs: resource → `navigation_mode` → Android 9 swipe-up setting → `sdk-default` below Android 10, `unknown` on Android 10+. |
| System reader | `.../SystemNavigationModeReader.kt` | Reads the resource and secure settings; each read returns `null` when missing or rejected. |
| Native package | `.../AndroidNavigationModePackage.kt` | Registers the module; no view managers. |
| Gradle | `android/build.gradle` | `namespace`, SDK/Java/Kotlin targets via `safeExtGet` defaults from the host app. |
| Autolinking | `react-native.config.js` | `packageImportPath` / `packageInstance` for the package class. |
| JS API | `src/index.js` | `NAVIGATION_MODE`, `getAndroidNavigationMode()`, `useAndroidNavigationMode()`, `getAndroidNavigationModeInfo()`, `useAndroidNavigationModeInfo()`; shipped untranspiled. |
| Types | `src/index.d.ts` | Hand-written declarations for every JS export. |
| Expo | `app.plugin.js`, `package.json` `expo.plugin` | No-op config plugin; native code is autolinked. Not usable in Expo Go. |
| Publish | `package.json` `files`, `main`, `types`, `peerDependencies` | What npm ships and the supported React / React Native range. |
| Docs | `README.md`, `CHANGELOG.md` | Public API, platform behavior, Expo setup; release notes. |
| Tests and tooling | `__tests__/`, `type-tests/`, `android/src/test/`, `babel.config.js` (Jest only), `eslint.config.js`, `tsconfig.json`, `.npmrc` | Jest with mocked `react-native`, ESLint, consumer type checks, Kotlin detector tests; none ship in the tarball. |

## Contracts kept in sync

- Mode strings `gesture`, `2-button`, `3-button`, `unknown` and the `source` values exist in the `NavigationModeDetector` companion object, `src/index.js`, `src/index.d.ts`, and README. Change them together.
- Native module name `AndroidNavigationMode` (`getName()`) must match `NativeModules.AndroidNavigationMode`.
- Kotlin package `com.reactnativeandroidnavigationmode`, Gradle `namespace`, `AndroidManifest.xml`, and `react-native.config.js` import path must agree.
- Every JS export has a declaration in `src/index.d.ts` and a README entry.
- Files that must ship are listed in `package.json` `files`; `.agents/`, `.claude/`, docs, tests, tool configs, `example/`, and local config stay out of the tarball.

## JS behavior rules

- Non-Android platforms never touch `NativeModules`: the legacy API returns `NAVIGATION_MODE.GESTURE`, the detailed API returns `unknown` with `source: 'unsupported'`.
- Missing or unlinked native module throws `LINKING_ERROR`; unknown native values map to `THREE_BUTTON` in the legacy API. The detailed getter also throws a rebuild error when the binary lacks `getNavigationModeInfo`. Do not silently change these fallbacks.
- `getNavigationMode` and `getNavigationModeInfo` are blocking synchronous bridge methods sharing one detector. Keep native work cheap; adding async variants is a public API decision.
- Hooks re-read on `AppState` `active` and remove their subscription on unmount. The detailed hook also re-reads after subscribing, skips state updates when the info is unchanged, and returns getter errors instead of throwing. Keep effect cleanup and avoid extra renders or listeners.
- Keep `src/index.js` free of syntax that a host Metro/Babel setup for the supported React Native range cannot handle.

## Native rules

- The module uses the bridge API (`ReactContextBaseJavaModule`, `@ReactMethod`) and relies on the New Architecture interop layer. A TurboModule/Codegen path follows an approved plan and keeps Legacy Architecture support, the module name, and synchronous detection.
- Use `safeExtGet` for SDK values so host apps control versions. Raising `minSdkVersion`, Java/Kotlin targets, or `peerDependencies` is a breaking change.
- Catch OEM-specific failures (missing resource, missing setting) and return a defined mode; never crash the host app on read.
- Do not add runtime dependencies, Gradle plugins, or iOS code without approval. The library has no iOS native code.

## Search before creation

Before adding a helper, constant, or file, check `src/index.js`, the Kotlin companion object, and existing exports for an equivalent. Keep the library small: no new folders or abstractions for a single function.

## Verification

Run `npm test -- --runInBand`, `npm run lint`, and `npm run typecheck`, plus the no-install checks listed in `post-task-finishing-pass`. Installing dependencies, compiling Kotlin, or running in a host/example app requires user authorization per `AGENTS.md`. Report what was actually run; native behavior is unverified until it runs on a device.
