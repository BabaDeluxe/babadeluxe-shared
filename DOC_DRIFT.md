# Documentation Drift Report

**Run Date/Time:** 2026-06-15 07:48 UTC
**Branch Analyzed:** `master`

## Files Reviewed

- `README.md`
- `package.json`
- `src/chat.ts`
- `src/utils/index.ts`
- `src/utils/dag-prompt-builder.ts`
- `src/generated-socket-types/socket-types.ts`

## Regressions & Gaps Found

1.  **Missing Utility Documentation:** `README.md` was missing documentation and usage examples for `DagPromptBuilder` and `BaseError`, which are key parts of the `utils` sub-module.
2.  **Stale Contributor Comments:** `src/chat.ts` contained a stale `NOTE` about implementing `chat:reasoningChunk` in `socket-types.ts`. This task has already been completed.

## Files Changed

- `README.md`
- `src/chat.ts`
- `DOC_DRIFT.md`

## Fixes Applied

- **README Improvements:** Added `DAG prompt builder` and `BaseError` to the `utils` entry point table and provided a practical usage example for `DagPromptBuilder`.
- **Source Comment Cleanup:** Removed the stale implementation note from `src/chat.ts` to prevent contributor confusion.
