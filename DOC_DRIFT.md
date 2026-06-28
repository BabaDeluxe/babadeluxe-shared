# Documentation Drift Report

**Run Date/Time:** 2026-06-28 20:45 UTC
**Branch Analyzed:** `master`

## Files Reviewed

- `README.md`
- `package.json`
- `src/chat.ts`
- `src/utils/dag-prompt-builder.ts`
- `src/settings/settings-socket-schema.ts`
- `src/generated-socket-types/socket-types.ts`

## Regressions & Gaps Found

1. - **Incomplete `pnpm prepare` Documentation:** `README.md` only mentioned Husky for the `pnpm prepare` script, missing the `git submodule update` part.
2. - **Inconsistent Parameter Names:** `README.md` usage example for `DagPromptBuilder` used `deps`, while the source code documentation and type definition use `resolvedDeps`.
3. - **Stale Contributor Comment (src/chat.ts):** The file contains a note describing `ReasoningChunkPayload` as a "shared contract until `socket-types.ts` is regenerated." However, `socket-types.ts` already includes the `chat:reasoningChunk` event.
4. - **Contradictory Comment (src/utils/dag-prompt-builder.ts):** A comment describes `ResolvedDeps` as a "Named interface (not `Record<string, string>`)", but it is implemented as a type alias for `Record<string, string>`.
5. - **Schema Drift (Socket Types):** The `dataType` union in `src/generated-socket-types/socket-types.ts` (used in `settings:getAll` and `settings:upsert`) only supports `"string" | "number" | "boolean"`. It is missing `"json-object"` and `"json-array"`, which are defined in `src/settings/settings-socket-schema.ts`.

## Files Changed

- `README.md`
- `DOC_DRIFT.md`

## Fixes Applied

- **README Corrections:**
  - Updated `pnpm prepare` description to include submodule initialization.
  - Standardized `DagPromptBuilder` example parameter names to `resolvedDeps`.
- **Drift Reporting:** Documented stale comments and schema drift in `DOC_DRIFT.md` for future remediation (source code changes are out of scope for this pass).
