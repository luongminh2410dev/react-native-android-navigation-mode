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

Keep the public API in `src/index.js`, `src/index.d.ts`, the README API table, and `docs/api-reference.md` in sync, and add a line to `CHANGELOG.md` under `Unreleased`.

## Releasing

1. Update `version` in `package.json` and rename the `Unreleased` heading in `CHANGELOG.md` to that version and date.
2. Merge to `main`.
3. Tag the release commit on `main` and push the tag:

   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

The [Release workflow](.github/workflows/release.yml) checks that the tag matches `package.json` and is on `main`, runs the tests, and publishes to npm with provenance. Versions with a prerelease suffix (`1.2.0-beta.1`) go to the `next` dist-tag; others go to `latest`. Publishing uses npm Trusted Publishing: the package's npm settings list this repository's `release.yml` as a trusted publisher, so no npm token is stored in GitHub.
