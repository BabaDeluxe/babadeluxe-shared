import { type BaseResponse } from './base-response.js'

export type SuccessResponse<T> = {
  readonly success: true
  readonly data: T
} & BaseResponse<T>
