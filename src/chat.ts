// ─── Chat message types ────────────────────────────────────────────────────────────
//
// NOTE: This file is hand-written. The generated `socket-types.ts` contains the
// socket wire shapes.
//
// Linked to: babadeluxe-shared#10, babadeluxe-backend#32

export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * A single message in a conversation.
 *
 * `reasoning` accumulates all `chat:reasoningChunk` payloads (concatenated in
 * sequence order), mirroring how `content` accumulates `chat:messageChunk`.
 * Only populated for reasoning-capable models (e.g. DeepSeek R1, Claude thinking
 * mode, Gemini Flash Thinking).
 */
export type Message = {
  id: number
  role: MessageRole
  content: string
  /** Accumulated reasoning/thinking tokens — undefined for non-reasoning models. */
  reasoning?: string
  createdAt: string
  updatedAt: string
}

/**
 * Payload emitted by `chat:reasoningChunk` (server → client).
 * Mirrors `chat:messageChunk` shape exactly.
 *
 * This type is the shared contract until `socket-types.ts` is regenerated.
 */
export type ReasoningChunkPayload = {
  messageId: number
  chunk: string
  sequence: number
}
