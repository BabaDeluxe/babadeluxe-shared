import { type ApiResponse } from './api-response.js'

export type EventCallback<T = unknown> = (response: ApiResponse<T>) => void
