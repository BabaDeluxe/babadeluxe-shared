# DOC_DRIFT.md - Documentation Regression Report

- **Run Date/Time:** 2026-05-23
- **Branch Analyzed:** `master`
- **Files Reviewed:** `README.md`, `package.json`, `src/utils/`, `src/settings/`

## Regressions Found

1.  **Stale pnpm scripts:** `README.md` was missing several scripts present in `package.json` (`test-package`, `publish-patch`, `publish-minor`, `publish-major`).
2.  **Missing Contributor Setup:** Instructions for setting up the local environment with the custom registry and `.env.local` were absent.
3.  **Missing Utility Documentation:** The `safeJsonParse` utility (which uses the `neverthrow` Result pattern) was not documented.

## Fixes Applied

- **README.md:**
    - Added "Safe JSON Parsing" usage example.
    - Added "Contributor Setup" section with environment setup steps.
    - Updated "Development" script table with all available `pnpm` scripts.
