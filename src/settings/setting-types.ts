export type Setting = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: 'string' | 'number' | 'boolean'
  readonly updatedAt: Date
}

export type SettingWithValidation = Setting & {
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly minValue?: number
  readonly maxValue?: number
  readonly description?: string
  readonly category: string
}
