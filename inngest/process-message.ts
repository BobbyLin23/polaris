import { eq } from 'drizzle-orm'
import { db } from '../server/db'
import { message } from '../server/db/schema'
import { inngest } from './client'

interface MessageEvent {
  messageId: string
}

export const processMessage = inngest.createFunction(
  {
    id: 'process-message',
    cancelOn: [
      {
        event: 'message/cancel',
        if: 'event.data.messageId == async.data.messageId',
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent

      // Update the message with error content
      await step.run('update-message-on-failure', async () => {
        await db.update(message).set({
          status: 'cancelled',
        }).where(eq(message.id, messageId))
      })
    },
  },
  {
    event: 'message/sent',
  },
  async ({ event, step }) => {
    const { messageId } = event.data as MessageEvent

    await step.sleep('wait-for-ai-processing', '5s')

    await step.run('update-assistant-message', async () => {
      await db.update(message).set({
        status: 'completed',
        content: 'AI processed this message (TODO)',
      }).where(eq(message.id, messageId))
    })
  },
)
