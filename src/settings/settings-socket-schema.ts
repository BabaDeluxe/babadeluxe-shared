/**
 * Settings Schema and Validation Module
 *
 * Single source of truth for settings validation across frontend and backend.
 *
 * Architecture:
 * - `settingSchema`: Zod object for all settings (per-key schemas via `.shape`)
 * - `settingSchemas`: Record of per-key Zod schemas (alias of `settingSchema.shape`)
 * - `settingMetadata`: Runtime metadata (category, encryption, dataType)
 * - `UserSettingWithValidation`: TypeScript type for runtime (Date objects)
 * - `userSettingWithValidationSchema`: Zod schema for socket wire format (ISO strings)
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
export const settingSchema = z.object({
  apiKeyOpenai: z.string().min(23).describe('OpenAI API key for GPT models').optional(),
  apiKeyAnthropic: z.string().min(100).describe('Anthropic API key for Claude models').optional(),
  apiKeyGoogle: z.string().min(35).describe('Google Gemini API key').optional(),
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
})

/**
 * Record of per-key schemas (for the "map of schemas" philosophy).
 */
export const settingSchemas = settingSchema.shape

/**
 * Union type of all valid setting keys.
 */
type SettingKey = keyof typeof settingSchemas

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
export const userSettingWithValidationSchema = z.object({
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
