export type BaseResponse<T = unknown> = {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
}
