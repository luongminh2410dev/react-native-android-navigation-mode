#!/usr/bin/env bash
# Generates a throwaway fixture for one React Native version (0.75+) to check compatibility beyond the committed
# fixtures. The app renders example/shared and installs the packed library, like the committed fixtures.
# Usage: example/scripts/create-fixture.sh <react-native-version>   (e.g. 0.81.6)
# Output: example/generated-rn-<version>/ (git-ignored). Re-running replaces it.
set -euo pipefail

version="${1:?Usage: create-fixture.sh <react-native-version>}"
if ! [[ "$version" =~ ^0\.([0-9]+)\.[0-9]+$ ]] || [ "${BASH_REMATCH[1]}" -lt 75 ]; then
  echo "Expected a React Native version 0.75.0 or later as x.y.z, got '$version'." >&2
  echo "Older versions need their own CLI; see the committed example/rn-0.71 fixture." >&2
  exit 1
fi
example_dir="$(cd "$(dirname "$0")/.." && pwd)"
fixture_dir="$example_dir/generated-rn-$version"
app_name="NavModeFixture$(echo "$version" | tr -d '.')"

rm -rf "$fixture_dir"
npx --yes @react-native-community/cli@latest init "$app_name" \
  --version "$version" \
  --directory "$fixture_dir" \
  --skip-install \
  --skip-git-init \
  --install-pods false

# Android only, rendering the shared screen.
rm -rf "$fixture_dir/ios" "$fixture_dir/Gemfile" "$fixture_dir/__tests__" "$fixture_dir/.bundle" \
  "$fixture_dir/jest.config.js" "$fixture_dir/README.md" "$fixture_dir/App.tsx"
printf "export { default } from 'navigation-mode-example-shared';\n" > "$fixture_dir/App.js"
printf 'install-links=true\n' > "$fixture_dir/.npmrc"

cat >> "$fixture_dir/android/settings.gradle" <<'EOF'

// Fixture-only: `-PuseLibrarySource=true` builds the library from the repository instead of the installed tarball,
// which excludes `android/src/test`. Use it to run `:react-native-android-navigation-mode:testDebugUnitTest`.
if (settings.providers.gradleProperty('useLibrarySource').getOrElse('false') == 'true') {
  project(':react-native-android-navigation-mode').projectDir = new File(rootDir, '../../../android')
}
EOF

"$example_dir/scripts/install-library-into-fixtures.sh" "$fixture_dir"

echo "Fixture ready: $fixture_dir"
echo "Build: cd $fixture_dir/android && ./gradlew -PnewArchEnabled=true assembleRelease"
