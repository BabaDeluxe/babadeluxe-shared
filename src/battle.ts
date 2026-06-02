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
  models: [string, string]
  content: string
  context: ContextItem[]
}

// Server → Client

export type BattleChunkPayload = {
  messageId: string
  modelId: string
  chunk: string
}

export type BattleDonePayload = {
  messageId: string
  modelId: string
}

export type BattleErrorPayload = {
  messageId: string
  modelId: string
  error: string
}
