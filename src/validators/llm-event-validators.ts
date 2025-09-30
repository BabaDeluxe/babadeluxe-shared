import * as yup from 'yup'
import type { InferType } from 'yup'

export enum LlmEvents {
  START_STREAM = 'llm:start-stream',
  CANCEL_STREAM = 'llm:cancel-stream',
  GET_MODELS = 'llm:get-models',
  STREAM_CHUNK = 'llm:stream-chunk',
  STREAM_START = 'llm:stream-start',
  STREAM_END = 'llm:stream-end',
  STREAM_CANCELLED = 'llm:stream-cancelled',
  STREAM_ERROR = 'llm:stream-error',
  QUOTA_EXCEEDED = 'llm:quota-exceeded',
}

export const startStreamSchema = yup
  .object({
    prompt: yup.string().required().min(1),
    model: yup.string().required(),
    temperature: yup.number().min(0).max(2).default(0.7),
    maxTokens: yup.number().integer().positive().default(1000),
    streamId: yup.string().required(),
  })
  .required()

export const cancelStreamSchema = yup
  .object({
    streamId: yup.string().required(),
    reason: yup.string().optional(),
  })
  .required()

export const callbackResponseSchema = yup
  .object({
    success: yup.boolean().required(),
    error: yup.string().optional(),
    data: yup.mixed().optional(),
  })
  .required()

export const streamChunkSchema = yup
  .object({
    streamId: yup.string().required(),
    chunk: yup.string().required(),
    index: yup.number().integer().min(0).required(),
  })
  .required()

export const streamEndSchema = yup
  .object({
    streamId: yup.string().required(),
    fullResponse: yup.string().required(),
    model: yup.string().required(),
    temperature: yup.number().required(),
  })
  .required()

export const streamCancelledSchema = yup
  .object({
    streamId: yup.string().required(),
    reason: yup.string().optional(),
  })
  .required()

export const quotaExceededSchema = yup
  .object({
    message: yup.string().required(),
    resetTime: yup.date().optional(),
  })
  .required()

export type StartStreamData = InferType<typeof startStreamSchema>
export type CancelStreamData = InferType<typeof cancelStreamSchema>
export type CallbackResponse<T = unknown> = InferType<typeof callbackResponseSchema> & { data?: T }
export type StreamChunkData = InferType<typeof streamChunkSchema>
export type StreamEndData = InferType<typeof streamEndSchema>
export type StreamCancelledData = InferType<typeof streamCancelledSchema>
export type QuotaExceededData = InferType<typeof quotaExceededSchema>

type Ack<T = unknown> = (response: CallbackResponse<T>) => void

// TODO: Check if I can use the socket types here
export type StartStreamAck = { success: true } | { success: false; error: string }
export type CancelStreamAck = { success: true } | { success: false; error: string }
export type GetModelsAck =
  | { success: true; data: Array<{ id: string; name: string; provider: string }> }
  | { success: false; error: string }

export type ClientToServerEvents = {
  [LlmEvents.START_STREAM]: (data: StartStreamData, ack: Ack<StartStreamAck>) => void
  [LlmEvents.CANCEL_STREAM]: (data: CancelStreamData, ack: Ack<CancelStreamAck>) => void
  [LlmEvents.GET_MODELS]: (ack: Ack<GetModelsAck>) => void
}

export type ServerToClientEvents = {
  [LlmEvents.STREAM_START]: (payload: { streamId: string }) => void
  [LlmEvents.STREAM_CHUNK]: (payload: { streamId: string; chunk: string; index: number }) => void
  [LlmEvents.STREAM_END]: (payload: {
    streamId: string
    fullResponse?: string
    model: string
    temperature: number
  }) => void
  [LlmEvents.STREAM_CANCELLED]: (payload: { streamId: string; reason: string }) => void
  [LlmEvents.STREAM_ERROR]: (payload: { streamId: string; error?: string }) => void
  [LlmEvents.QUOTA_EXCEEDED]: (payload: { streamId: string; limit: number }) => void
}
