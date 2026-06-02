export type SpaceAnswerEmbedding = {
  answerId: string
  spaceId: string
  query: string
  timestamp: string
  modelId: string // embedding model used, needed for invalidation
  embedding: number[]
}

export type SpaceContextBlock = {
  answers: Array<{ query: string; answer: string }>
}
