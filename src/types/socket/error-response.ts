import { type BaseResponse } from './base-response.js'

export type ErrorResponse = {
  readonly success: false
  readonly error: string
} & BaseResponse
