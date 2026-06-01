/**
 * Zod schemas for user settings and their metadata.
 *
 * This module defines:
 * 1. `settingSchema`: The master schema for all user-configurable settings.
 * 2. `settingMetadata`: Runtime metadata (encryption, categories) for each setting.
 * 3. Validation and retrieval helpers.
 *
 * Note on Dates: Dates are expected to be ISO strings on the wire, but are
 * treated as Date objects in the backend and frontend state where possible.
 * The `UserSettingWire` type explicitly represents the socket wire format (ISO strings)
 *
 * @module settings-schemas
 */


import { z } from 'zod/v4'


/**
 * Zod validation schema for all settings.
 *
 * Used by:
 * - `validateSetting()` - Validates user input on both frontend and backend
 * - Backend SettingsService - Validates before encryption/storage
 * - Frontend forms - Client-side validation before submission
 */
export const settingSchema = /* @__PURE__ */ z.object({
  apiKeyOpenai: z.string().min(23).describe('OpenAI API key for GPT models').optional(),
  apiKeyAnthropic: z.string().min(100).describe('Anthropic API key for Claude models').optional(),
  apiKeyGoogle: z.string().min(35).describe('Google Gemini API key').optional(),

  /**
   * OpenRouter API key (starts with `sk-or-v1-`).
   * Min length 20 — shorter than other keys since format varies slightly.
   */
  apiKeyOpenrouter: z
    .string()
    .min(20)
    .describe('OpenRouter API key')
    .optional(),

  /**
   * Custom base URL for the OpenRouter API (or any OpenAI-compatible endpoint
   * routed through OpenRouter). Defaults to `https://openrouter.ai/api/v1`
   * when absent.
   */
  openrouterBaseUrl: z
    .string()
    .url()
    .describe('Custom base URL for the OpenRouter API endpoint')
    .optional(),

  theme: z.enum(['dark', 'light']).describe('UI theme').optional(),


  /**
   * Determines when the system prompt is appended during a conversation.
   *
   * - `always`            – Prepend the prompt to every message sent.
   * - `first-message`     – Inject once at the start of each new conversation.
   * - `every-x-messages`  – Re-inject after every N messages (see `promptInjectionInterval`).
   * - `on-prompt-change`  – Re-inject automatically when the active prompt is switched.
   * - `manual`            – Never auto-inject; user triggers it explicitly.
   */
  promptInjectionMode: z
    .enum(['always', 'first-message', 'every-x-messages', 'on-prompt-change', 'manual'])
    .describe('When to append the system prompt during a conversation')
    .optional(),


  /**
   * Number of messages between automatic re-injections.
   * Only used when `promptInjectionMode` is `every-x-messages`.
   * Range: 1–20.
   */
  promptInjectionInterval: z
    .number()
    .int()
    .min(1)
    .max(20)
    .describe('Message interval for every-x-messages injection mode')
    .optional(),


  /**
   * Where the prompt is injected in the message array.
   *
   * - `system`      – Sent as a dedicated `role: "system"` message.
   * - `user-prefix` – Prepended inline to the first user message.
   * - `user-suffix` – Appended inline to the last user message before send.
   */
  promptInjectionPosition: z
    .enum(['system', 'user-prefix', 'user-suffix'])
    .describe('Where to inject the prompt relative to the message array')
    .optional(),


  /**
   * Whether to re-include prior conversation history when re-injecting the prompt
   * mid-conversation (relevant for `every-x-messages` and `on-prompt-change` modes).
   */
  promptIncludeHistory: z
    .boolean()
    .describe('Re-include conversation history when re-injecting the prompt')
    .optional(),


  /**
   * Per-model temperature overrides stored as a JSON object.
   *
   * Keys are model value strings (e.g. `"gpt-4o"`, `"claude-sonnet-4-5"`).
   * Values are floats in the range [0, 2].
   *
   * Example:
   * ```json
   * { "gpt-4o": 0.7, "claude-sonnet-4-5": 0.3 }
   * ```
   *
   * Stored as a JSON string on the wire; parsed on read.
   * When a model key is absent the provider default (usually 1.0) is used.
   */
  modelTemperatures: z
    .record(z.string(), z.number().min(0).max(2))
    .describe('Per-model temperature overrides (model value → 0–2 float)')
    .optional(),


  // ─── Reasoning ──────────────────────────────────────────────────────────────


  /**
   * Reasoning effort level passed to supported models.
   *
   * - `off`     – Disable reasoning/thinking mode entirely.
   * - `minimal` – Shortest possible reasoning trace (lowest token cost).
   * - `low`     – Light reasoning; good balance for most tasks.
   * - `medium`  – Standard reasoning; default when reasoning is enabled.
   * - `high`    – Maximum reasoning depth; highest token cost.
   *
   * Mapping per provider:
   * - OpenAI o-series  → `reasoning_effort: "low" | "medium" | "high"`
   * - Anthropic Claude → `thinking: { type: "enabled", budget_tokens: N }`
   * - OpenRouter       → `extra_body.reasoning.effort`
   * - DeepSeek R1      → passed via system prompt convention
   *
   * Only applied when the model's `ReasoningConfig` is non-null.
   */
  reasoningEffort: z
    .enum(['off', 'minimal', 'low', 'medium', 'high'])
    .describe('Reasoning effort level for models that support extended thinking')
    .optional(),


  /**
   * When `true`, inject Anthropic `cache_control` breakpoints on system
   * and long user messages to enable prompt caching.
   *
   * Only has effect for Anthropic Claude models. Ignored for all other providers.
   */
  promptCachingEnabled: z
    .boolean()
    .describe('Enable Anthropic prompt caching via cache_control breakpoints')
    .optional(),


  /**
   * When `true`, enable the provider's web search tool/plugin for supported models.
   *
   * Provider-specific behaviour:
   * - OpenAI          → adds `{ type: "web_search_preview" }` to `tools[]`
   * - Anthropic        → adds `{ type: "web_search_20250305", ... }` to `tools[]`
   * - Gemini           → enables `google_search` grounding tool
   * - OpenRouter       → passes `plugins: [{ id: "web" }]` in `extra_body`
   */
  webSearchEnabled: z
    .boolean()
    .describe('Enable web search tool for supported models')
    .optional(),


  /**
   * When `true`, the `UserChoiceRouter` (backend#22) is allowed to fall back
   * to the next available provider/key when the primary selection fails.
   *
   * Used by: `StreamOrchestrator` → `IProviderRouter.fallback()`
   */
  fallbackEnabled: z
    .boolean()
    .describe('Allow automatic provider fallback when the primary selection fails')
    .optional(),


  // ─── Ollama ────────────────────────────────────────────────────────────────


  /**
   * Base URL of the local Ollama instance (e.g. `"http://localhost:11434"`).
   * User-scoped: one Ollama server serves all workspaces on the same machine.
   */
  ollamaUrl: z
    .string()
    .url()
    .describe('Base URL of the local Ollama instance')
    .optional(),


  /**
   * When `true`, the UI polls `models:listOllamaModels` to discover available
   * models from the running Ollama instance.
   */
  ollamaModelDiscovery: z
    .boolean()
    .describe('Enable automatic discovery of models from the Ollama instance')
    .optional(),


  /**
   * Allowlist of Ollama model names that should appear in the model selector.
   *
   * An empty array means all discovered models are shown.
   * Stored as a JSON string on the wire; parsed on read.
   *
   * Example: `["llama3", "mistral", "codellama"]`
   */
  ollamaEnabledModels: z
    .array(z.string())
    .describe('Allowlist of Ollama model names shown in the model selector')
    .optional(),
})


/**
 * Record of per-key schemas (for the "map of schemas" philosophy).
 */
export const settingSchemas = settingSchema.shape


/**
 * Union type of all valid setting keys.
 */
export type SettingKey = keyof typeof settingSchemas


/**
 * Runtime metadata for each setting.
 *
 * Used by:
 * - Backend SettingsService - Determines encryption and defaults
 * - `getSettingDefinition()` - Builds complete setting definition for both sides
 */
export const settingMetadata: Record<
  SettingKey,
  {
    readonly category: string
    readonly encrypted: boolean
    readonly dataType: 'string' | 'number' | 'boolean'
    readonly required: boolean
    readonly minLength?: number
    readonly maxLength?: number
    readonly minValue?: number
    readonly maxValue?: number
  }
> = {
  apiKeyOpenai: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string',
    minLength: 23,
    required: false,
  },
  apiKeyAnthropic: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string',
    minLength: 100,
    required: false,
  },
  apiKeyGoogle: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string',
    minLength: 35,
    required: false,
  },
  apiKeyOpenrouter: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string',
    minLength: 20,
    required: false,
  },
  openrouterBaseUrl: {
    category: 'openrouter',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  theme: {
    category: 'ui',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  promptInjectionMode: {
    category: 'prompt',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  promptInjectionInterval: {
    category: 'prompt',
    encrypted: false,
    dataType: 'number',
    required: false,
    minValue: 1,
    maxValue: 20,
  },
  promptInjectionPosition: {
    category: 'prompt',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  promptIncludeHistory: {
    category: 'prompt',
    encrypted: false,
    dataType: 'boolean',
    required: false,
  },
  modelTemperatures: {
    category: 'model',
    encrypted: false,
    dataType: 'string', // serialised JSON object on the wire
    required: false,
  },

  // ─── Reasoning ──────────────────────────────────────────────────────────────

  reasoningEffort: {
    category: 'reasoning',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  promptCachingEnabled: {
    category: 'reasoning',
    encrypted: false,
    dataType: 'boolean',
    required: false,
  },
  webSearchEnabled: {
    category: 'reasoning',
    encrypted: false,
    dataType: 'boolean',
    required: false,
  },
  fallbackEnabled: {
    category: 'model',
    encrypted: false,
    dataType: 'boolean',
    required: false,
  },

  // ─── Ollama ────────────────────────────────────────────────────────────────

  ollamaUrl: {
    category: 'ollama',
    encrypted: false,
    dataType: 'string',
    required: false,
  },
  ollamaModelDiscovery: {
    category: 'ollama',
    encrypted: false,
    dataType: 'boolean',
    required: false,
  },
  ollamaEnabledModels: {
    category: 'ollama',
    encrypted: false,
    dataType: 'string', // serialised JSON array on the wire
    required: false,
  },
} as const


/**
 * TypeScript type for user settings with validation metadata.
 *
 * Used by:
 * - Frontend composables - Type for reactive state
 * - Backend SettingsService.getAllSettings() - Return type
 */
export type UserSettingWithValidation = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: 'string' | 'number' | 'boolean'
  readonly updatedAt: Date
  readonly category: string
  readonly encrypted: boolean
  readonly required: boolean
  readonly description: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly minValue?: number
  readonly maxValue?: number
}


/**
 * Zod schema for socket.io wire format validation.
 *
 * Used by:
 * - Backend socket actions - Validates output before transmission
 */
export const userSettingWithValidationSchema = /* @__PURE__ */ z.object({
  settingKey: z.string(),
  settingValue: z.unknown(),
  dataType: z.enum(['string', 'number', 'boolean']),
  updatedAt: z.iso.datetime(),
  required: z.boolean(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  description: z.string(),
  category: z.string(),
  encrypted: z.boolean(),
})


/**
 * Get complete definition for a setting by key.
 *
 * Used by:
 * - Backend SettingsService - Enriches DB records with metadata
 * - Frontend - Displays validation rules and descriptions
 */
/* @__NO_SIDE_EFFECTS__ */
export function getSettingDefinition(
  key: string
): Omit<UserSettingWithValidation, 'settingKey' | 'settingValue' | 'updatedAt'> | undefined {
  const schema = settingSchemas[key as SettingKey]
  const metadata = settingMetadata[key as SettingKey]

  if (!schema || !metadata) return undefined

  return {
    category: metadata.category,
    encrypted: metadata.encrypted,
    dataType: metadata.dataType,
    required: metadata.required,
    description: (schema as { description?: string }).description ?? '',
    minLength: metadata.minLength,
    maxLength: metadata.maxLength,
    minValue: metadata.minValue,
    maxValue: metadata.maxValue,
  }
}


/**
 * Validate a setting value against its schema.
 *
 * Used by:
 * - Backend SettingsService - Validates before database save
 * - Frontend forms - Client-side validation before submission
 */
/* @__NO_SIDE_EFFECTS__ */
export function validateSetting(key: string, value: unknown) {
  const schema = settingSchemas[key as SettingKey]
  if (!schema) {
    return { success: false as const, error: `Unknown setting: ${key}` }
  }

  const result = schema.safeParse(value)
  return result.success
    ? { success: true as const, data: result.data }
    : {
        success: false as const,
        error: result.error.issues[0]?.message ?? 'Validation failed',
      }
}


/**
 * Wire-safe type for socket transmission (Date → ISO string)
 */
export type UserSettingWire = Omit<UserSettingWithValidation, 'updatedAt'> & {
  readonly updatedAt: string
}


// ─── Prompt injection helpers ────────────────────────────────────────────────


/** Typed alias for all valid injection modes. */
export type PromptInjectionMode = z.infer<typeof settingSchema.shape.promptInjectionMode>


/** Typed alias for all valid injection positions. */
export type PromptInjectionPosition = z.infer<typeof settingSchema.shape.promptInjectionPosition>


/** Default values used when a setting is absent. */
export const promptInjectionDefaults = {
  mode: 'always' as NonNullable<PromptInjectionMode>,
  interval: 5,
  position: 'system' as NonNullable<PromptInjectionPosition>,
  includeHistory: true,
} as const


// ─── Reasoning helpers ───────────────────────────────────────────────────────


/** Typed alias for all valid reasoning effort levels. */
export type ReasoningEffort = z.infer<typeof settingSchema.shape.reasoningEffort>


/** Default reasoning effort when the setting is absent but reasoning is enabled. */
export const defaultReasoningEffort: NonNullable<ReasoningEffort> = 'medium'


// ─── Model temperature helpers ────────────────────────────────────────────────


/** Shape of the modelTemperatures setting value. */
export type ModelTemperatures = Record<string, number>


/** Provider default temperature used when no override exists. */
export const defaultTemperature = 1


/**
 * Get the temperature for a specific model, falling back to the provider default.
 *
 * @example
 * const temp = getModelTemperature({ 'gpt-4o': 0.7 }, 'claude-sonnet-4-5') // 1.0
 * const temp2 = getModelTemperature({ 'gpt-4o': 0.7 }, 'gpt-4o')           // 0.7
 */
/* @__NO_SIDE_EFFECTS__ */
export function getModelTemperature(
  temperatures: ModelTemperatures | undefined,
  modelValue: string
): number {
  return temperatures?.[modelValue] ?? defaultTemperature
}


/**
 * Set the temperature for a specific model, returning a new object (immutable).
 */
/* @__NO_SIDE_EFFECTS__ */
export function setModelTemperature(
  temperatures: ModelTemperatures | undefined,
  modelValue: string,
  value: number
): ModelTemperatures {
  return { ...temperatures, [modelValue]: value }
}


/**
 * Remove the temperature override for a specific model (reset to default).
 */
/* @__NO_SIDE_EFFECTS__ */
export function resetModelTemperature(
  temperatures: ModelTemperatures | undefined,
  modelValue: string
): ModelTemperatures {
  const { [modelValue]: _, ...rest } = temperatures ?? {}
  return rest
}


// ─── Ollama helpers ──────────────────────────────────────────────────────────


/** Typed alias for the ollamaEnabledModels setting value. */
export type OllamaEnabledModels = string[]
