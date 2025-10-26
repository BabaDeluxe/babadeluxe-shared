/**
 * Settings Schema and Validation Module
 *
 * This module defines the structure, validation rules, and metadata for all user settings.
 * It serves as the single source of truth for settings across frontend and backend.
 *
 * Architecture:
 * - `constraints`: Raw validation rules (min/max lengths, required flags)
 * - `settingSchemas`: Zod schemas for individual setting validation (used by backend)
 * - `settingMetadata`: Runtime metadata (category, encryption, data type)
 * - `UserSettingWithValidation`: TypeScript type for frontend (with Date objects)
 * - `userSettingWithValidationSchema`: Zod schema for socket wire format (with ISO strings)
 *
 * @module settings-schemas
 */

import { z } from 'zod/v4'

/**
 * Validation constraints for each setting.
 *
 * Used by:
 * - `settingSchemas` - Applied via .min()/.max() methods
 * - `settingMetadata` - Spread into metadata objects
 */
const constraints = {
  apiKeyOpenai: { minLength: 23, required: false },
  apiKeyAnthropic: { minLength: 100, required: false },
  apiKeyGoogle: { minLength: 35, required: false },
} as const

/**
 * Zod validation schemas for individual settings.
 *
 * Used by:
 * - `validateSetting()` - Validates user input before saving to database
 * - Backend SettingsService - Validates before encryption/serialization
 *
 * Each schema defines:
 * - Type (string, number, boolean)
 * - Validation rules (min length, ranges, etc.)
 * - Description (for UI tooltips and error messages)
 */
export const settingSchemas = {
  apiKeyOpenai: z
    .string()
    .min(constraints.apiKeyOpenai.minLength)
    .describe('OpenAI API key for GPT models')
    .optional(),
  apiKeyAnthropic: z
    .string()
    .min(constraints.apiKeyAnthropic.minLength)
    .describe('Anthropic API key for Claude models')
    .optional(),
  apiKeyGoogle: z
    .string()
    .min(constraints.apiKeyGoogle.minLength)
    .describe('Google Gemini API key')
    .optional(),
} as const

/**
 * Union type of all valid setting keys.
 *
 * Used by:
 * - TypeScript for type-safe setting key access
 * - Runtime validation in `getSettingDefinition()` and `validateSetting()`
 */
export type SettingKey = keyof typeof settingSchemas

/**
 * Runtime metadata for each setting.
 *
 * Used by:
 * - Backend SettingsService - Determines if setting should be encrypted
 * - Backend SettingsInitializer - Provides default values on user creation
 * - Frontend Settings UI - Groups settings by category, shows descriptions
 * - `getSettingDefinition()` - Builds complete setting definition
 *
 * Fields:
 * - `category`: Groups related settings (e.g., 'apiKey', 'chat', 'appearance')
 * - `encrypted`: If true, value is encrypted before storage in Supabase
 * - `dataType`: Database column type and serialization format
 * - `required`: If true, setting must have a value
 * - `minLength/maxLength`: String validation bounds
 * - `minValue/maxValue`: Number validation bounds
 */
export const settingMetadata = {
  apiKeyOpenai: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyOpenai,
  },
  apiKeyAnthropic: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyAnthropic,
  },
  apiKeyGoogle: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyGoogle,
  },
} as const

/**
 * TypeScript type for user settings with validation metadata.
 *
 * Used by:
 * - Frontend composables (`use-settings-socket.ts`) - Type for reactive state
 * - Frontend components - Type-safe access to setting properties
 * - Backend SettingsService.getAllSettings() - Return type
 *
 * Note: `updatedAt` is a Date object for frontend convenience.
 * When transmitted over socket.io, it's serialized to ISO string automatically.
 */
export type UserSettingWithValidation = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: 'string' | 'number' | 'boolean'
  readonly updatedAt: Date // ← Date object for frontend
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
 * Zod schema for validating complete user settings in socket.io transmissions.
 *
 * Used by:
 * - Backend socket actions (`settings-actions-impl.ts`) - Validates output data shape
 * - Zod-sockets library - Type-safe socket event validation
 *
 * Key difference from `UserSettingWithValidation`:
 * - `updatedAt` is a string (ISO datetime format) because socket.io serializes Date objects
 * - Frontend converts ISO string back to Date using `new Date(isoString)`
 *
 * This separation ensures:
 * - Frontend works with convenient Date objects
 * - Socket validation matches actual wire format (strings)
 * - Type safety across the full stack
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
 * - Backend SettingsService.getAllSettings() - Enriches DB records with metadata
 * - Frontend settings UI - Displays validation rules and descriptions
 *
 * @param key - Setting key to lookup
 * @returns Setting definition without value/key/timestamp, or undefined if not found
 *
 * Example:
 * ```
 * const def = getSettingDefinition('apiKeyOpenai')
 * // Returns: { category: 'apiKey', encrypted: true, required: false, ... }
 * ```
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
    minLength: ('minLength' in metadata ? metadata.minLength : undefined) as number | undefined,
    maxLength: ('maxLength' in metadata ? metadata.maxLength : undefined) as number | undefined,
    minValue: ('minValue' in metadata ? metadata.minValue : undefined) as number | undefined,
    maxValue: ('maxValue' in metadata ? metadata.maxValue : undefined) as number | undefined,
  }
}

/**
 * Validate a setting value against its schema.
 *
 * Used by:
 * - Backend SettingsService._updateSetting() - Validates before saving to database
 * - Frontend forms - Client-side validation before submission
 *
 * @param key - Setting key to validate against
 * @param value - Value to validate
 * @returns Success result with parsed data, or error result with message
 *
 * Example:
 * ```
 * const result = validateSetting('apiKeyOpenai', 'sk-proj-abc123...')
 * if (result.success) {
 *   console.log('Valid:', result.data)
 * } else {
 *   console.error('Invalid:', result.error)
 * }
 * ```
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
 * Get all setting keys in a specific category.
 *
 * Used by:
 * - Frontend settings UI - Group settings by category in tabs/sections
 * - `getApiProviders()` - Filter API key settings
 *
 * @param category - Category to filter by (e.g., 'apiKey', 'chat', 'appearance')
 * @returns Array of setting keys in that category
 *
 * Example:
 * ```
 * const apiKeys = getSettingsByCategory('apiKey')
 * // Returns: ['apiKeyOpenai', 'apiKeyAnthropic', 'apiKeyGoogle']
 * ```
 */
export function getSettingsByCategory(category: string): SettingKey[] {
  return Object.entries(settingMetadata)
    .filter(([_, meta]) => meta.category === category)
    .map(([key]) => key as SettingKey)
}

/**
 * Get formatted list of all API providers with their metadata.
 *
 * Used by:
 * - Frontend API key management UI - Display available providers
 * - Settings initialization - Show which providers can be configured
 *
 * @returns Array of provider objects with key, name, required flag, and description
 *
 * Example:
 * ```
 * const providers = getApiProviders()
 * // Returns: [
 * //   { key: 'apiKeyOpenai', name: 'Openai', required: false, description: '...' },
 * //   { key: 'apiKeyAnthropic', name: 'Anthropic', required: false, description: '...' },
 * //   ...
 * // ]
 * ```
 */
export function getApiProviders() {
  return getSettingsByCategory('apiKey').map((key) => {
    const meta = settingMetadata[key]
    const schema = settingSchemas[key]
    return {
      key,
      name: key.replace('apiKey', ''),
      required: meta.required,
      description: schema.description,
    }
  })
}

/**
 * Wire-safe type for socket transmission (Date → ISO string)
 */
export type UserSettingWire = Omit<UserSettingWithValidation, 'updatedAt'> & {
  readonly updatedAt: string
}

/**
 * Transform runtime type to wire-safe format
 */
export const toWire = (setting: UserSettingWithValidation): UserSettingWire => ({
  ...setting,
  updatedAt: setting.updatedAt.toISOString(),
})

/**
 * Transform wire format back to runtime type
 */
export const fromWire = (setting: UserSettingWire): UserSettingWithValidation => ({
  ...setting,
  updatedAt: new Date(setting.updatedAt),
})
