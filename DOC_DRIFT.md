# Documentation Drift Report

**Run Date/Time:** 2026-09-26 03:03 UTC
**Branch Analyzed:** `master` (as `dev` was not found)

## Files Reviewed

- `README.md`
- `src/chat.ts`
- `src/utils/dag-prompt-builder.ts`
- `src/settings/settings-socket-schema.ts`
- `src/generated-socket-types/socket-types.ts`

## Regressions & Gaps Found

1. **Markdown Formatting Regressions in README:** `README.md` contained markdown lint issues including list marker spacing (MD030), missing blank lines around code fences (MD031), and underscore emphasis style (MD049).
2. **Stale Contributor Comment (src/chat.ts):** The file contains a note describing `ReasoningChunkPayload` as a "shared contract until `socket-types.ts` is regenerated." However, `socket-types.ts` already includes the `chat:reasoningChunk` event.
3. **Contradictory Comment (src/utils/dag-prompt-builder.ts):** A comment describes `ResolvedDeps` as a "Named interface (not `Record<string, string>`)", but it is implemented as a type alias for `Record<string, string>`.
4. **Schema Drift (Socket Types):** The `SettingDataType` union in `src/generated-socket-types/socket-types.ts` (used in `settings:getAll` and `settings:upsert`) only supports `"string" | "number" | "boolean"`. It is missing `"json-object"` and `"json-array"`, which are defined in `src/settings/settings-socket-schema.ts`.

## Files Changed

- `README.md`
- `DOC_DRIFT.md`

## Fixes Applied

- **README Formatting Fixes:** Resolved markdown linting violations in `README.md` for list spacing, fence blank lines, and emphasis style.
- **Drift Reporting:** Documented code-level comments and schema drift in `DOC_DRIFT.md` for future remediation (source code modifications are prohibited for documentation passes).
