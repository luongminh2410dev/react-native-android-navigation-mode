---
name: post-task-finishing-pass
description: Use only when the user explicitly requests a finishing pass, cleanup, or review of the just-completed task. Ordinary task completion does not trigger this skill.
---

# Post-Task Finishing Pass

Adapted from the jupi-app workflow for this React Native library. Execute only on explicit request after the task works. Routine verification remains required without a finishing request.

## Establish scope

Read `git status --short`, `git diff --stat HEAD`, staged/unstaged diffs, and relevant untracked files. Scope is task-owned files and hunks, not every working-tree change. Preserve preexisting user edits. Ask for scope if ambiguous hunks cannot be attributed. An empty diff or mechanical one-line fix needs no ceremonial pass.

## 1. Optimize

Preserve behavior and public API. Check repeated native calls, work on the JS thread inside the synchronous bridge method, extra `setState` calls, leaking `AppState` subscriptions, and missing effect cleanup. Do not add `useMemo`/`useCallback` without a measured reason. Recheck reuse through `react-native-library-architecture`; public surface edits use `public-api-change-safety`.

## 2. Cleanup and docs

Remove unused task-created code, constants, debug logs (`console.log`, `Log.d`), completed TODOs, and redundant comments. Keep concise reasons for OEM fallbacks and workarounds. Follow surrounding formatting (2-space indent, single quotes in JS).

Use `docs-follow-code` for JSDoc, `src/index.d.ts`, and README.

## 3. Self-test

Read `package.json` `scripts` first. When `test`, `lint`, or `typecheck` scripts exist and dev dependencies are installed, run the ones relevant to the change (`npm test -- --runInBand`, `npm run lint`, `npm run typecheck`). Always run the checks that need no install:

```sh
node --check <changed-js-files>
npm pack --dry-run --ignore-scripts
git diff --check
```

`node --check` on ES module syntax in `.js` files needs Node 22+. `--ignore-scripts` keeps `prepare`/codegen lifecycle scripts out of the package check. The dry run confirms every needed file ships and nothing local (`.agents/`, `.claude/`, docs, tests, configs, `example/`, logs) leaks. Verify by reading that each JS export has a matching declaration in the types and that mode strings match the Kotlin constants.

Installing dependencies, downloading tools via `npx`, compiling Kotlin or running Kotlin/Gradle tests, and running a host/example app require user authorization per `AGENTS.md`. Report whether device verification actually happened. Do not create permanent tests solely mirroring trivial edits; report preexisting failures separately.

## 4. Self-review and report

Review requested behavior, fallbacks on every platform, linking errors, OEM settings variants, type/README drift, semver impact, and leftovers in the task diff. Fix in-scope findings; list unrelated findings without editing them. No version bump, publish, commit, push, or branch integration is implied.

Report scope, optimization, cleanup/docs, actual commands/results, findings fixed, public API impact, and unresolved/out-of-scope issues. Never report checks passing without execution evidence.
