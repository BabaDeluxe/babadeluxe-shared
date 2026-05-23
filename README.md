<p align="center">
  <img src="./banner.svg" alt="@babadeluxe/shared banner" width="100%">
</p>

# @babadeluxe/shared

<p align="left">
  <img src="https://img.shields.io/badge/license-EUPL%201.2-6a5acd?style=flat-rounded" alt="license">
  <img src="https://img.shields.io/badge/code_style-XO-8a2be2?style=flat-rounded" alt="code style: xo">
  <img src="https://img.shields.io/badge/node-%3E%3D20-b06ab3?style=flat-rounded" alt="node version">
</p>

> **Shared types, Zod schemas, and utilities used across the BabaDeluxe ecosystem.** If it needs to be consistent between the extension, webview, and backend — it lives here.

## Overview

This package is the single source of truth for cross-cutting concerns in BabaDeluxe. It provides end-to-end type safety between the VS Code extension, the Vue webview, and the backend — no duplicated type definitions, no schema drift.

## Entry Points

| Import | Contents |
| :--- | :--- |
| `@babadeluxe/shared` | Main entry point — re-exports all sub-modules |
| `@babadeluxe/shared/generated-socket-types` | Auto-generated Zod-based Socket.io event definitions |
| `@babadeluxe/shared/settings` | User configuration schema, validation, and metadata |
| `@babadeluxe/shared/utils` | General utilities: Damerau-Levenshtein distance, safe JSON parsing |

## Installation

```bash
pnpm install @babadeluxe/shared
```

## Usage

### Settings validation

```typescript
import { validateSetting } from '@babadeluxe/shared/settings'

const result = validateSetting('theme', 'dark')
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

### Type-safe socket events

```typescript
import type { Root } from '@babadeluxe/shared/generated-socket-types'

// Type your socket.io-client instance for strict event handling
// const socket: Root.Socket = io(Root.path)
```

### Safe JSON Parsing

```typescript
import { safeJsonParse } from '@babadeluxe/shared/utils'

const result = safeJsonParse('{"foo": "bar"}')

if (result.isOk()) {
  console.log(result.value) // Typed as Record<string, unknown>
} else {
  console.error(result.error.message) // BaseError instance
}
```

## Contributor Setup

This package uses a custom npm registry. To set up your local development environment:

1.  **Copy the environment template:**
    ```bash
    cp .env.local.example .env.local
    ```
2.  **Fill in your credentials** in `.env.local`. You will need a valid `NPM_TOKEN`.
3.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    The `pnpm:devPreinstall` hook will automatically run `setup-npmrc.ts` to generate your local `.npmrc` and configure `publishConfig` in `package.json`.

## Development

| Script | Description |
| :--- | :--- |
| `pnpm build` | Produces ESM, CJS, and `.d.ts` declarations via `unbuild` |
| `pnpm format` | Lints and formats with XO + Prettier |
| `pnpm generate-barrels` | Regenerates barrel exports via `barrelsby` |
| `pnpm test-package` | Builds and performs a dry-run pack to verify integrity |
| `pnpm publish-patch` | Bumps version (patch) and publishes to the custom registry |
| `pnpm publish-minor` | Bumps version (minor) and publishes to the custom registry |
| `pnpm publish-major` | Bumps version (major) and publishes to the custom registry |

## License

This project is licensed under the **European Union Public License 1.2 (EUPL-1.2)**. See [LICENSE](./LICENSE.md) for the full text.

---

**BabaDeluxe** — _Redefining the Future of Software Development._
