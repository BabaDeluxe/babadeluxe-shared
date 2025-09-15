import { type CompletionParameters } from './completion-parameters.js'

export type StreamCompletionParameters = {
  signal?: AbortSignal
} & CompletionParameters
