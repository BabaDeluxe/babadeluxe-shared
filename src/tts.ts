export interface TtsOptions {
  speed?: number
}

export interface TtsProvider {
  speak(text: string, options?: TtsOptions): Promise<void>
  stop(): void
  isReady(): boolean
}

