# Documentation Drift Report

**Run Date/Time:** 2026-06-06 03:03 UTC
**Branch Analyzed:** `master`

## Files Reviewed

- `README.md`
- `package.json`
- `src/index.ts`
- `src/battle.ts`
- `src/chat.ts`
- `src/cost.ts`
- `src/sharing.ts`
- `src/space-context.ts`
- `src/tts.ts`
- `src/settings/index.ts`
- `src/settings/settings-socket-schema.ts`
- `src/utils/index.ts`
- `setup-npmrc.ts`

## Regressions & Gaps Found

1.  **Incomplete Entry Points:** `README.md` was missing several sub-module exports documented in `package.json` (`./battle`, `./chat`, `./cost`, `./sharing`, `./space-context`, `./tts`, `./settings/schema`).
2.  **Missing Development Scripts:** The `test` and `type-check` scripts were not listed in the Development section of `README.md`.
3.  **Vague Setup Instructions:** Contributor setup instructions did not specify which environment variables were required in `.env.local`, despite `setup-npmrc.ts` strictly requiring `NPM_TOKEN`, `NPM_PACKAGE_SCOPE`, `NPM_REGISTRY`, and `NPM_REGISTRY_URL`.
4.  **Tone Alignment:** The `README.md` introduction was professional but lacked the visionary, "light" Benjamin Goertzel tone preferred for the project.

## Files Changed

- `README.md`
- `DOC_DRIFT.md`

## Fixes Applied

- **Entry Points:** Expanded the "Entry Points" table to include all currently exported sub-paths.
- **Script Visibility:** Added `pnpm test` and `pnpm type-check` to the Development scripts table.
- **Setup Clarity:** Detailed the required environment variables in the Contributor Setup section to match `setup-npmrc.ts` logic.
- **Visionary Tone:** Refined the introduction and overview to use more visionary language while maintaining professional structure.
