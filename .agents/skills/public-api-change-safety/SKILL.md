---
name: public-api-change-safety
description: Use when changing an existing export, return value, fallback, type, native module name, package/autolinking config, Expo plugin, peerDependencies, SDK minimums, or published files of this library.
---

# Public API Change Safety

Adapted from the jupi-app `shared-layer-change-safety` skill. In a published library every consumer is outside the repository, so the public surface is the shared layer.

## Public surface

- JS exports in `src/index.js` and their declarations in `src/index.d.ts`.
- Returned values and fallbacks: non-Android `gesture`, unknown native value `3-button`, missing module throws.
- Hook behavior: initial value, `AppState` refresh, cleanup.
- Native module name `AndroidNavigationMode`, Kotlin package/class names used by `react-native.config.js`.
- `package.json`: `name`, `main`, `types`, `files`, `expo.plugin`, `peerDependencies`.
- `android/build.gradle` defaults: `compileSdkVersion`, `minSdkVersion`, Java/Kotlin targets.
- Expo plugin entry `app.plugin.js`.

Pure additions (a new export, a new constant) need no separate approval but still need types, README, and a minor version bump at release.

## For existing surface

1. Use graph impact/caller queries first, then read the implementation. Supplement with targeted `rg` across JS, Kotlin, Gradle, `react-native.config.js`, `package.json`, and `README.md`; the graph does not model autolinking or string-based native lookup.
2. List what a consumer observes before and after: values, thrown errors, render count, timing (sync vs async), build requirements.
3. "Optional parameter", "internal refactor", and "same type signature" are not compatibility evidence. Check defaults and fallback paths.
4. If behavior is proven unchanged for consumers and the task authorizes the edit, proceed. Report evidence.
5. If observable behavior changes, or impact is uncertain, present the diff, consumer impact, required semver bump (patch / minor / major), and the lowest-risk option. Wait for approval. Prior approval for the same concrete impact remains valid.

Do not bump `version`, publish, tag, or push as part of an API change unless the user asks.

Report: surface changed; files and lookups investigated; behavior preserved or approved; semver impact; checks actually run; remaining uncertainty.
