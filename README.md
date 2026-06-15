<p align="center">
  <img src="./banner.svg" alt="@babadeluxe/shared banner" width="100%">
</p>

# @babadeluxe/shared

<p align="left">
  <img src="https://img.shields.io/badge/license-EUPL%201.2-6a5acd?style=flat-rounded" alt="license">
  <img src="https://img.shields.io/badge/code_style-XO-8a2be2?style=flat-rounded" alt="code style: xo">
  <img src="https://img.shields.io/badge/node-%3E%3D20.19%20%3C24-b06ab3?style=flat-rounded" alt="node version">
</p>

> **The architectural bedrock of the BabaDeluxe AI ecosystem.** Providing the foundational types, schemas, and cognitive utilities that power the future of autonomous software engineering.

## Overview

### Why?

In a complex distributed system like BabaDeluxe, maintaining consistency between the VS Code extension, the Vue-based webview, and the high-performance backend is paramount. `@babadeluxe/shared` eliminates schema drift and duplication, ensuring a unified "shared consciousness" across all components of the AI assistant.

## Entry Points

| Import                                      | Contents                                                           |
| :------------------------------------------ | :----------------------------------------------------------------- |
| `@babadeluxe/shared`                        | Unified entry point — re-exports all cognitive sub-modules         |
| `@babadeluxe/shared/battle`                 | Payloads for Battle Mode model comparisons                         |
| `@babadeluxe/shared/chat`                   | Core message and conversation types (including reasoning chunks)   |
| `@babadeluxe/shared/cost`                   | Token usage and pricing models for AI inference                    |
| `@babadeluxe/shared/sharing`                | Collaborative link and conversation forking logic                  |
| `@babadeluxe/shared/space-context`          | Vector-ready context blocks and embedding structures               |
| `@babadeluxe/shared/tts`                    | Text-to-speech provider interfaces and options                     |
| `@babadeluxe/shared/generated-socket-types` | Auto-generated TypeScript interfaces for Socket.io events          |
| `@babadeluxe/shared/settings`               | User configuration schema, validation, and metadata                                      |
| `@babadeluxe/shared/settings/schema`        | Low-level Zod schemas for settings validation                                            |
| `@babadeluxe/shared/utils`                  | General utilities: DAG prompt builder, Damerau-Levenshtein, safe JSON parsing, BaseError |

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

### Damerau-Levenshtein Similarity

```typescript
import { damerauLevenshteinSimilarity } from '@babadeluxe/shared/utils'

const score = damerauLevenshteinSimilarity('typing', 'tpying')
console.log(score) // 0.833... (high similarity due to transposition)
```

### DAG Prompt Builder

```typescript
import { DagPromptBuilder } from '@babadeluxe/shared/utils'

const builder = new DagPromptBuilder()

builder.addNode({
  id: 'system',
  render: () => 'You are a helpful assistant.'
})

builder.addNode({
  id: 'context',
  dependsOn: ['system'],
  render: (deps) => `${deps.system}\n\nContext: { "some": "data" }`
})

builder.addNode({
  id: 'user',
  dependsOn: ['context'],
  render: (deps) => `${deps.context}\n\nUser: Hello!\nAssistant:`
})

const prompt = builder.build()
console.log(prompt)
```

## Contributor Setup

This package uses a custom npm registry hosted on Cloudflare Workers. To set up your local development environment:

1.  **Copy the environment template:**
    ```bash
    cp .env.local.example .env.local
    ```
2.  **Configure environment variables** in `.env.local`:
    - `NPM_TOKEN`: Your private registry authentication token.
    - `NPM_PACKAGE_SCOPE`: The `@babadeluxe` scope.
    - `NPM_REGISTRY`: The hostname of the registry.
    - `NPM_REGISTRY_URL`: The full protocol-prefixed URL of the registry.
3.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    The `pnpm:devPreinstall` hook will automatically run `setup-npmrc.ts` to generate your local `.npmrc` and configure `publishConfig` in `package.json`.

## Development

| Script                  | Description                                                |
| :---------------------- | :--------------------------------------------------------- |
| `pnpm build`            | Produces ESM, CJS, and `.d.ts` declarations via `unbuild`  |
| `pnpm test`             | Runs the test suite via Vitest                             |
| `pnpm type-check`       | Performs static type checking via `tsc`                    |
| `pnpm format`           | Lints and formats with XO + Prettier                       |
| `pnpm generate-barrels` | Regenerates barrel exports via `barrelsby`                 |
| `pnpm test-package`     | Builds and performs a dry-run pack to verify integrity     |
| `pnpm publish-patch`    | Bumps version (patch) and publishes to the custom registry |
| `pnpm publish-minor`    | Bumps version (minor) and publishes to the custom registry |
| `pnpm publish-major`    | Bumps version (major) and publishes to the custom registry |
| `pnpm prepare`          | Installs Husky git hooks                                   |

## License

This project is licensed under the **European Union Public License 1.2 (EUPL-1.2)**. See [LICENSE](./LICENSE.md) for the full text.

---

**BabaDeluxe** — _Redefining the Future of Software Development._
