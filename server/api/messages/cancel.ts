import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { inngest } from '~~/inngest'
import { db } from '~~/server/db'
import { message } from '~~/server/db/schema'

const requestSchema = z.object({
  projectId: z.string(),
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

    const { projectId } = result.data

    const processingMessages = await db.query.message.findMany({
      where: {
        projectId,
        status: 'processing',
      },
    })

    if (!processingMessages.length) {
      return {
        success: true,
        cancelled: false,
      }
    }

    const cancelledIds = await Promise.all(
      processingMessages.map(async (msg) => {
        await inngest.send({
          name: 'message/cancel',
          data: {
            messageId: msg.id,
          },
        })

        await db.update(message).set({
          status: 'cancelled',
        }).where(eq(message.id, msg.id))

        return msg.id
      }),
    )

    return {
      success: true,
      cancelled: cancelledIds.length > 0,
      cancelledIds,
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
