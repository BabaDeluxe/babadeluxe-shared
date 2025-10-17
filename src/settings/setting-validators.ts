import * as yup from 'yup'
import { type InferType } from 'yup'
import { settingDefinitions, type SettingKey, type SettingDataType } from './setting-definitions.js'

export const settingDataTypeSchema = yup.string().oneOf(['string', 'number', 'boolean']).required()

export const updateSettingPayloadSchema = yup
  .object({
    settingKey: yup.string().required().min(1),
    settingValue: yup.mixed().required(),
    dataType: settingDataTypeSchema,
  })
  .required()

export const deleteSettingPayloadSchema = yup
  .object({
    settingKey: yup.string().required(),
  })
  .required()

export type UpdateSettingPayload = InferType<typeof updateSettingPayloadSchema>
export type DeleteSettingPayload = InferType<typeof deleteSettingPayloadSchema>

export const validateSettingValue = (
  key: string,
  value: unknown,
  dataType: SettingDataType
): { success: true; data: unknown } | { success: false; error: string } => {
  const definition = settingDefinitions[key as SettingKey]

  if (!definition) {
    return { success: false, error: `Unknown setting key: ${key}` }
  }

  if (definition.dataType !== dataType) {
    return {
      success: false,
      error: `Invalid dataType for ${key}: expected ${definition.dataType}, got ${dataType}`,
    }
  }

  try {
    let schema: yup.Schema

    switch (dataType) {
      case 'string': {
        let s = yup.string()
        if ('minLength' in definition && typeof definition.minLength === 'number') {
          s = s.min(definition.minLength)
        }

        if ('maxLength' in definition && typeof definition.maxLength === 'number') {
          s = s.max(definition.maxLength)
        }

        schema = definition.required ? s.required() : s
        break
      }

      case 'number': {
        let n = yup.number()
        if ('minValue' in definition && typeof definition.minValue === 'number') {
          n = n.min(definition.minValue)
        }

        if ('maxValue' in definition && typeof definition.maxValue === 'number') {
          n = n.max(definition.maxValue)
        }

        schema = definition.required ? n.required() : n
        break
      }

      case 'boolean': {
        schema = definition.required ? yup.boolean().required() : yup.boolean()
        break
      }
    }

    const validated: unknown = schema.validateSync(value, { stripUnknown: true })
    return { success: true, data: validated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    return { success: false, error: message }
  }
}
