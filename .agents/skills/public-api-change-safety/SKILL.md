---
name: public-api-change-safety
description: Use when changing an existing export, return value, fallback, type, native module name, package/autolinking config, Expo plugin, peerDependencies, SDK minimums, or published files of this library.
---

# Public API Change Safety

Adapted from the jupi-app `shared-layer-change-safety` skill. In a published library every consumer is outside the repository, so the public surface is the shared layer.

## Public surface

- JS exports in `src/index.js` and their declarations in `src/index.d.ts`.
- Returned values and fallbacks: legacy non-Android `gesture`, legacy undetermined/unknown value `3-button`, missing module throws; detailed API `mode`/`interactionMode`/`source` values, `unknown` + `unavailable`/`unsupported`, rebuild error for an outdated binary.
- Native detection order and its per-SDK results (resource, `navigation_mode`, Android 9 swipe-up, `sdk-default`); changing them changes what both APIs return.
- Hook behavior: initial value, `AppState` refresh, cleanup; detailed hook error/recovery contract.
- Insets API: dp units, per-edge values, `0` when hidden vs `null` when unavailable, height = largest edge, event name `androidNavigationBarInsetsDidChange`.
- Codegen spec (`src/NativeAndroidNavigationMode.ts`), `codegenConfig`, and the architecture selection in `android/build.gradle`.
- Native module name `AndroidNavigationMode`, Kotlin package/class names used by `react-native.config.js`.
- `package.json`: `name`, `main`, `types`, `files`, `expo.plugin`, `peerDependencies`.
- `android/build.gradle` defaults: `compileSdkVersion`, `minSdkVersion`, Java/Kotlin targets.
- Expo plugin entry `app.plugin.js`.

Pure additions (a new export, a new constant) need no separate approval but still need types, docs (README API table and `docs/api-reference.md`), and a minor version bump at release.

## For existing surface

1. Use graph impact/caller queries first, then read the implementation. Supplement with targeted `rg` across JS, Kotlin, Gradle, `react-native.config.js`, `package.json`, `README.md`, and `docs/`; the graph does not model autolinking or string-based native lookup.
2. List what a consumer observes before and after: values, thrown errors, render count, timing (sync vs async), build requirements.
3. "Optional parameter", "internal refactor", and "same type signature" are not compatibility evidence. Check defaults and fallback paths.
4. If behavior is proven unchanged for consumers and the task authorizes the edit, proceed. Report evidence.
5. If observable behavior changes, or impact is uncertain, present the diff, consumer impact, required semver bump (patch / minor / major), and the lowest-risk option. Wait for approval. Prior approval for the same concrete impact remains valid.

Do not bump `version`, publish, tag, or push as part of an API change unless the user asks.

Report: surface changed; files and lookups investigated; behavior preserved or approved; semver impact; checks actually run; remaining uncertainty.
