import type { InferType } from 'yup'
import type { updateSettingPayloadSchema, deleteSettingPayloadSchema } from './setting-validators'

export type UpdateSettingPayload = InferType<typeof updateSettingPayloadSchema>
export type DeleteSettingPayload = InferType<typeof deleteSettingPayloadSchema>
