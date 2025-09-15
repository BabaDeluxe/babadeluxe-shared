import type { Schema } from 'yup'

// Usage Example:
// Import { Server } from 'socket.io'
// Import {
//   LlmEvents,
//   StartStreamSchema,
//   CancelStreamSchema,
//   ValidateEventData,
//   Type ClientToServerEvents,
//   Type ServerToClientEvents
// } from './llm-events.js'

// Const io = new Server<ClientToServerEvents, ServerToClientEvents>()

// Io.on('connection', (socket) => {
//   Socket.on(LlmEvents.START_STREAM, async (data, callback) => {
//     Const validation = await validateEventData(startStreamSchema, data)

//     If (!validation.success) {
//       Callback({ success: false, error: validation.error })
//       Return
//     }

//     Const { streamId, prompt, model, temperature, maxTokens } = validation.data

//     Try {
//       Await startLlmStream({ streamId, prompt, model, temperature, maxTokens })
//       Callback({ success: true })
//     } catch (error) {
//       Const message = error instanceof Error ? error.message : 'Stream failed'
//       Callback({ success: false, error: message })
//     }
//   })

//   Socket.on(LlmEvents.CANCEL_STREAM, async (data, callback) => {
//     Const validation = await validateEventData(cancelStreamSchema, data)

//     If (!validation.success) {
//       Callback({ success: false, error: validation.error })
//       Return
//     }

//     Await cancelStream(validation.data.streamId)
//     Callback({ success: true })
//   })
// })

export const validateEventData = async <T>(
  schema: Schema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  try {
    const validatedData = await schema.validate(data, { stripUnknown: true })
    return { success: true, data: validatedData }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    return { success: false, error: message }
  }
}

export const createEventValidator =
  <T>(schema: Schema<T>) =>
  async (data: unknown) =>
    validateEventData(schema, data)
