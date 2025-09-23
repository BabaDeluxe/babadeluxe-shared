import type { StreamChunkData } from '../../validators/event-validators.js'
import type { CompletionParameters } from './completion-parameters.js'

export type ExtendedCompletionParameters = CompletionParameters & {
  signal?: AbortSignal
}

export type LlmProvider = {
  streamCompletion(
    parameters: ExtendedCompletionParameters
  ): Promise<AsyncIterable<StreamChunkData>>

  getModels(): string[]
}
