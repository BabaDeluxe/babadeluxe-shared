/**
 * Settings Schema and Validation Module
 *
 * Single source of truth for settings validation across frontend and backend.
 *
 * Architecture:
 * - `settingSchemas`: Zod schemas for validation (used by both sides via `validateSetting()`)
 * - `settingMetadata`: Runtime metadata (category, encryption, dataType)
 * - `UserSettingWithValidation`: TypeScript type for runtime (Date objects)
 * - `userSettingWithValidationSchema`: Zod schema for socket wire format (ISO strings)
 *
 * @module settings-schemas
 */

import { z } from 'zod/v4'

/**
 * Zod validation schemas for individual settings.
 *
 * Used by:
 * - `validateSetting()` - Validates user input on both frontend and backend
 * - Backend SettingsService - Validates before encryption/storage
 * - Frontend forms - Client-side validation before submission
 */
export const settingSchemas = {
  apiKeyOpenai: z.string().min(23).describe('OpenAI API key for GPT models').optional(),
  apiKeyAnthropic: z.string().min(100).describe('Anthropic API key for Claude models').optional(),
  apiKeyGoogle: z.string().min(35).describe('Google Gemini API key').optional(),
} as const

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
export const settingMetadata = {
  apiKeyOpenai: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    minLength: 23,
    required: false,
  },
  apiKeyAnthropic: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    minLength: 100,
    required: false,
  },
  apiKeyGoogle: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    minLength: 35,
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
    description: schema.description ?? '',
    minLength: metadata.minLength,
    maxLength: ('maxLength' in metadata ? metadata.maxLength : undefined) as number | undefined,
    minValue: ('minValue' in metadata ? metadata.minValue : undefined) as number | undefined,
    maxValue: ('maxValue' in metadata ? metadata.maxValue : undefined) as number | undefined,
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
  if (!schema) return { success: false as const, error: `Unknown setting: ${key}` }

  const result = schema.safeParse(value)
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, error: result.error.issues[0]?.message ?? 'Validation failed' }
}

/**
 * Wire-safe type for socket transmission (Date → ISO string)
 */
export type UserSettingWire = Omit<UserSettingWithValidation, 'updatedAt'> & {
  readonly updatedAt: string
}
