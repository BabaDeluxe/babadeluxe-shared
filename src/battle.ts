import type { ModelId } from './generated-socket-types/socket-types'

// ─── Battle Mode payload types ───────────────────────────────────────────────
// Linked to: babadeluxe-webview#117, babadeluxe-backend#34

/** Context item passed alongside the battle message. */
export type ContextItem = {
  role: 'user' | 'assistant'
  content: string
}

// Client → Server

export type BattleStartPayload = {
  messageId: string
  models: [ModelId, ModelId]
  content: string
  context: ContextItem[]
}

// Server → Client

export type BattleChunkPayload = {
  messageId: string
  modelId: ModelId
  chunk: string
}

export type BattleDonePayload = {
  messageId: string
  modelId: ModelId
}

export type BattleErrorPayload = {
  messageId: string
  modelId: ModelId
  error: string
}
