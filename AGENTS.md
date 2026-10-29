# Agent Instructions — react-native-android-navigation-mode

Published npm library: a Kotlin React Native native module (TurboModule via Codegen on the New Architecture, bridge module on the Legacy Architecture) that detects the Android navigation mode (`gesture`, `2-button`, `3-button`) and reads navigation bar insets. It ships legacy and detailed (`unknown` + `source`) JS getters and hooks, insets getters and a hook, hand-written types, and a no-op Expo config plugin. No iOS native code. Jest, ESLint, and TypeScript checks are installed as devDependencies; Kotlin unit tests and native builds run through the fixtures in `example/`.

## Shared project skills

The canonical skill directory is [`.agents/skills/`](.agents/skills/). `.claude/skills/` is a relative symlink to the same directory. Read the relevant `SKILL.md` before working on its scope; do not maintain duplicate copies.

| Skill | When to read |
| --- | --- |
| [react-native-library-architecture](.agents/skills/react-native-library-architecture/SKILL.md) | New features, native/JS/type changes, autolinking, Expo, and reuse checks. |
| [public-api-change-safety](.agents/skills/public-api-change-safety/SKILL.md) | Changes to existing exports, return values, fallbacks, native names, `package.json`, SDK minimums, or published files. |
| [docs-follow-code](.agents/skills/docs-follow-code/SKILL.md) | Behavior or contract changes described by JSDoc, `src/index.d.ts`, or README. |
| [post-task-finishing-pass](.agents/skills/post-task-finishing-pass/SKILL.md) | Only an explicit request to finish, clean up, or review the just-completed task. |
| explore-codebase, review-changes, debug-issue, refactor-safely | Graph workflows for exploration, review, debugging, and refactoring. |

These skills adapt jupi-app guidance. App-only rules (Redux-Saga, networking, design guidelines, AdMob, env schemes) were not imported.

## Working conventions

- Follow the existing structure: plain JS in `src/index.js` shipped untranspiled, types in `src/index.d.ts`, Kotlin in `android/src/main/java/com/reactnativeandroidnavigationmode/`. Read the implementation before assuming behavior.
- Tests: JS tests in `__tests__/` (mocked `react-native`), consumer type checks in `type-tests/`, Codegen spec check via `tsconfig.codegen-spec.json`, Kotlin tests in `android/src/test/`. Detection logic lives in `NavigationModeDetector.kt` without Android APIs; system reads live in `SystemNavigationModeReader.kt`; insets in `NavigationBarInsets.kt` and `NavigationBarInsetsObserver.kt`.
- Architectures: `src/NativeAndroidNavigationMode.ts` is the Codegen spec (`codegenConfig` in `package.json`). `android/src/newarch/` extends the generated spec, `android/src/oldarch/` is its hand-written legacy mirror; keep signatures identical. `android/build.gradle` selects the source set (RN 0.82+ always New Architecture).
- Example: committed fixtures `example/rn-0.71/` (minimum, Legacy), `example/rn-0.88/` (latest, New Architecture), and `example/expo-sdk-58/` share `example/shared/`. Other versions are generated on demand with `example/scripts/create-fixture.sh <version>` into git-ignored `example/generated-rn-<version>/`. `example/scripts/install-library-into-fixtures.sh` packs the library and installs the tarball; see `example/README.md`.
- `.npmrc` sets `legacy-peer-deps=true` so `npm install` does not pull `react-native` as a peer dependency.
- Keep mode strings, the native module name, and the Kotlin package name consistent across Kotlin, JS, types, Gradle, and `react-native.config.js`.
- Every public export has a type declaration and a README entry. Keep JSDoc, types, and README aligned with behavior in the same task. State what was actually checked rather than marking written code as verified.
- Treat the public API as shared with unknown consumers. Before changing existing behavior, follow `public-api-change-safety`; present semver impact and ask when consumer-visible behavior changes or remains uncertain. Prior approval for that same impact remains valid.
- Do not add runtime dependencies, dev tooling, iOS code, or new example fixtures without user approval. Keep the library small; search for an existing equivalent before adding a helper or constant.
- Approved plans live in `docs/superpowers/plans/` (local only, git-ignored). A plan's decisions and execution limits are user approval for its tasks; read it before working on one. When a task changes structure, tooling, or scripts, update this file and the affected skills in the same task.
- A finishing pass runs only when requested. Routine targeted verification is still required. Never claim checks passed without running them.
- Preserve the user's preexisting changes. Commit, push, tag, version bump, and `npm publish` require user instruction.

## Execution authorization

Checks that need no install may run freely: `node --check` on JS files, `npm pack --dry-run --ignore-scripts`, `git diff --check`, and the installed scripts `npm test -- --runInBand`, `npm run lint`, `npm run typecheck` (none of them build or launch an app).

Do not install dependencies, download tools via `npx`, compile Kotlin or run Kotlin/Gradle tests, build or run an example fixture, start Metro, or build/install on a device solely to verify an edit. These need user authorization; reuse authorization already given in the session. For device verification, ask which host app, platform, and Android version/OEM to use. Stop background processes you started when done unless the user asked to keep them running; report any remaining process.

## Release

Only on user instruction: choose the semver bump from the public API impact, update `version` in `package.json`, run `npm pack --dry-run --ignore-scripts` to confirm the tarball contents, then publish. Never publish from a dirty tree or without stating the exact version.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**This project has a knowledge graph. Start with the code-review-graph
MCP tools to narrow scope, then read the source.** The graph is cheaper than scanning files and
gives you structural context (callers, dependents, test coverage) that file search cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

### Verify in the source

- Narrow scope with the graph, then read the source. Do not change code from graph output alone.
- For any non-trivial change, read the implementation and the relevant tests before concluding.
- Verify the exact source when touching behavior, database logic, migrations, retries, fallbacks,
  recovery, or compatibility code.
- When the graph and the source disagree, the source wins. The graph may be stale or may not
  model that relationship.
- An empty graph result can mean "not indexed" or "not statically visible", not "does not exist".

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. Check graph freshness for the current repository/branch; run `code-review-graph update --repo .` before review.
   Claude Edit/Write hooks refresh signatures with `--skip-flows`; other tools need an explicit update or watcher.
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
<!-- /code-review-graph MCP tools -->

### Repository setup and limits

- Setup, commands, and ignore rules: [docs/code-review-graph.md](docs/code-review-graph.md).
- Start with `get_minimal_context_tool`, request minimal output and expand only the relevant nodes.
- The repository is tiny; when the graph adds nothing, read the files directly.
- The graph does not model `NativeModules` string lookup, autolinking (`react-native.config.js`), Gradle, or the Expo plugin. Read them directly.
- When `tests_for` returns nothing, check test files directly; the repository may have none for that code.
- If graph tools are unavailable, use targeted `rg` and source reads; continue the task.
