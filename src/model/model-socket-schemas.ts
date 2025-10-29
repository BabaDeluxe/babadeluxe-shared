import { z } from 'zod/v4'
import { createSimpleConfig } from 'zod-sockets'

/**
 * Model socket configuration - server→client emissions only
 *
 * WHY: Client-to-server actions (like listAllModels) are defined
 * in the actions array, not in the config. Config is only for
 * server-initiated broadcasts/emissions.
 *
 * Currently empty because we don't need to broadcast model updates.
 * If you later want to notify all clients when models change, add it here.
 */
export const modelSocketConfig = createSimpleConfig({
  emission: {
    // Add server→client events here if needed, e.g.:
    // ModelsUpdated: {
    //   Schema: z.tuple([z.object({ provider: z.string() })]),
    // },
  },
})
