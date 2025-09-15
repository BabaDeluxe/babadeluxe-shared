export type LlmConfig = {
  readonly defaultTemperature: number
  readonly minTemperature: number
  readonly maxTemperature: number
  readonly circuitBreakerFailureThreshold: number
  readonly circuitBreakerTimeout: number
  readonly circuitBreakerRetryDelay: number
}
