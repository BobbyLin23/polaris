import z from 'zod'
import { inngest } from '~~/inngest'
import { db } from '../db'
import { message } from '../db/schema'

const requestSchema = z.object({
  conversationId: z.string(),
  message: z.string(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    })

    if (!session) {
      return createError({
        message: 'Unauthorized',
        statusCode: 400,
      })
    }

    const result = await readValidatedBody(event, body => requestSchema.safeParse(body))

    if (!result.success) {
      return createError({
        message: result.error.issues.map(issue => issue.message).join(', '),
        statusCode: 400,
      })
    }

    const { conversationId, message: newMessage } = result.data

    const conversation = await db.query.conversation.findFirst({
      where: {
        id: conversationId,
      },
    })

    if (!conversation) {
      return createError({
        message: 'Conversation not found',
        statusCode: 404,
      })
    }

    const projectId = conversation.projectId

    await db.insert(message).values({
      conversationId,
      projectId,
      role: 'user',
      content: newMessage,
    })

    const [assistantMessage] = await db.insert(message).values({
      conversationId,
      projectId,
      role: 'assistant',
      content: '',
      status: 'processing',
    }).returning()

    if (!assistantMessage) {
      return createError({
        message: 'Failed to create assistant message',
        statusCode: 500,
      })
    }

    const inngestEvent = await inngest.send({
      name: 'message/sent',
      data: {
        messageId: assistantMessage.id,
      },
    })

    return {
      success: true,
      eventId: inngestEvent.ids[0],
      messageId: assistantMessage.id,
    }
  }
  catch (error) {
    console.error(error)
    return createError({
      message: 'Internal server error',
      statusCode: 500,
    })
  }
})
