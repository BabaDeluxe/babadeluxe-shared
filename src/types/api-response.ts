import { type SuccessResponse } from './success-response.js'
import { type ErrorResponse } from './error-response.js'

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
