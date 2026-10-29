# Contributing

## Setup

```bash
npm install
```

`.npmrc` sets `legacy-peer-deps=true` so the install does not pull React Native as a peer dependency of the library itself.

## Checks

```bash
npm test -- --runInBand   # Jest, with react-native mocked
npm run lint
npm run typecheck         # consumer type checks and the Codegen spec
npm pack --dry-run --ignore-scripts
```

## Native code

- Detection logic: `android/src/main/java/com/reactnativeandroidnavigationmode/NavigationModeDetector.kt` (no Android APIs, covered by JVM tests in `android/src/test/`).
- System reads: `SystemNavigationModeReader.kt`.
- Architecture-specific base classes: `android/src/newarch/` extends the Codegen spec generated from `src/NativeAndroidNavigationMode.ts`; `android/src/oldarch/` is the hand-written legacy equivalent. Keep their method signatures identical.

Kotlin tests and native builds run inside an example fixture, because `android/` is not a standalone Gradle project. See [example/README.md](example/README.md).

## Pull requests

Keep the public API in `src/index.js`, `src/index.d.ts`, and `README.md` in sync, and add a line to `CHANGELOG.md` under `Unreleased`.
