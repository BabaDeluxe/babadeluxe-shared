# Documentation Drift Report

**Run Date/Time:** 2026-09-12 03:29 UTC
**Branch Analyzed:** `master` (as `dev` was not found)

## Files Reviewed

- `README.md`
- `src/chat.ts`
- `src/utils/dag-prompt-builder.ts`
- `src/settings/settings-socket-schema.ts`
- `src/generated-socket-types/socket-types.ts`

## Regressions & Gaps Found

1. **DagPromptBuilder Example Parameter Naming (README.md):** `README.md` used `deps` as the parameter name in the `DagPromptBuilder` usage example, whereas the codebase type definition is `ResolvedDeps`.
2. **Markdown Formatting Issues (README.md & DOC_DRIFT.md):** List marker spacing (MD030), missing blank lines around fenced code blocks (MD031), and emphasis style (MD049) violations were present in `README.md` and `DOC_DRIFT.md`.
3. **Stale Contributor Comment (src/chat.ts):** The file contains a note describing `ReasoningChunkPayload` as a "shared contract until `socket-types.ts` is regenerated." However, `socket-types.ts` already includes the `chat:reasoningChunk` event.
4. **Contradictory Comment (src/utils/dag-prompt-builder.ts):** A comment describes `ResolvedDeps` as a "Named interface (not `Record<string, string>`)", but it is implemented as a type alias for `Record<string, string>`.
5. **Schema Drift (Socket Types):** The `SettingDataType` union in `src/generated-socket-types/socket-types.ts` (used in `settings:getAll` and `settings:upsert`) only supports `"string" | "number" | "boolean"`. It is missing `"json-object"` and `"json-array"`, which are defined in `src/settings/settings-socket-schema.ts`.

## Files Changed

- `README.md`
- `DOC_DRIFT.md`

## Fixes Applied

- **README Parameter Naming:** Updated `DagPromptBuilder` callback parameter from `deps` to `resolvedDeps` in `README.md` for consistency with `ResolvedDeps` type.
- **Markdown Linting Fixes:** Fixed list marker spacing (MD030), added blank lines around fenced code blocks (MD031), and fixed emphasis style (MD049) in `README.md` and `DOC_DRIFT.md`.
- **Drift Reporting:** Documented code-level comment drift and schema drift in `DOC_DRIFT.md` for future remediation (source code modifications are out of scope for documentation passes).
