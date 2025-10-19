import { z } from 'zod'

// Business validation (used when CALLING APIs, not for socket transport)
export const settingSchemas = {
  apiKeyOpenai: z.string().min(23).describe('OpenAI API key for GPT models'),
  apiKeyAnthropic: z.string().min(100).describe('Anthropic API key for Claude models'),
  apiKeyGoogle: z.string().min(35).describe('Google Gemini API key'),
} as const

export type SettingKey = keyof typeof settingSchemas

// UI metadata ONLY
export const settingMetadata = {
  apiKeyOpenai: { category: 'apiKey', encrypted: true, required: true },
  apiKeyAnthropic: { category: 'apiKey', encrypted: true, required: true },
  apiKeyGoogle: { category: 'apiKey', encrypted: true, required: true },
} as const

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

// Derive UI hints from schemas + metadata
export function getSettingDefinition(key: string) {
  const schema = settingSchemas[key as SettingKey]
  const metadata = settingMetadata[key as SettingKey]

  if (!schema || !metadata) return undefined

  return {
    required: metadata.required,
    description: schema.description ?? '',
    category: metadata.category,
    minLength: schema.minLength ?? undefined,
    maxLength: schema.maxLength ?? undefined,
    minValue: undefined,
    maxValue: undefined,
  }
}
