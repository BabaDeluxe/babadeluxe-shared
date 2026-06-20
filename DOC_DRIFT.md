# Documentation Drift Report

**Run Date/Time:** 2026-06-20 03:03 UTC
**Branch Analyzed:** `master` (as `dev` was not found)

## Files Reviewed

- `README.md`
- `src/chat.ts`
- `src/utils/dag-prompt-builder.ts`
- `src/settings/settings-socket-schema.ts`
- `src/generated-socket-types/socket-types.ts`

## Regressions & Gaps Found

1.  **Missing BaseError Documentation:** `README.md` was missing a usage example for `BaseError`, which is a core utility for structured error handling.
2.  **Stale Contributor Comment (src/chat.ts):** The file contains a note describing `ReasoningChunkPayload` as a "shared contract until `socket-types.ts` is regenerated." However, `socket-types.ts` already includes the `chat:reasoningChunk` event.
3.  **Contradictory Comment (src/utils/dag-prompt-builder.ts):** A comment describes `ResolvedDeps` as a "Named interface (not `Record<string, string>`)", but it is implemented as a type alias for `Record<string, string>`.
4.  **Schema Drift (Socket Types):** The `SettingDataType` union in `src/generated-socket-types/socket-types.ts` (used in `settings:getAll` and `settings:upsert`) only supports `"string" | "number" | "boolean"`. It is missing `"json-object"` and `"json-array"`, which are defined in `src/settings/settings-socket-schema.ts`.

## Files Changed

- `README.md`
- `DOC_DRIFT.md`

## Fixes Applied

- **README Improvements:** Added a "Structured Error Handling" section to `README.md` with a practical example of extending and using `BaseError`.
- **Drift Reporting:** Documented stale comments and schema drift in `DOC_DRIFT.md` for future remediation (source code changes were out of scope for this pass).
