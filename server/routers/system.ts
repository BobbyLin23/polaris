import { ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db'
import { conversation, message } from '../db/schema'
import { authed } from '../utils/orpc'

export const getConversationById = authed.route({
  method: 'GET',
  path: '/conversation/:conversationId',
  summary: 'Get Conversation By Id',
  tags: ['Conversations'],
}).input(
  z.object({
    id: z.string(),
  }),
).output(conversationSelectSchema).handler(async ({ input }) => {
  const res = await db.query.conversation.findFirst({
    where: {
      id: input.id,
    },
  })

  if (!res) {
    throw new ORPCError('NOT_FOUND')
  }

  return res
})

export const createMessage = authed.route({
  method: 'POST',
  path: '/messages',
  summary: 'Create Message',
  tags: ['Messages'],
}).input(z.object({
  conversationId: z.string(),
  projectId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  status: z.enum(['processing', 'completed', 'cancelled']).optional(),
})).output(
  z.object({
    id: z.string(),
  }),
).handler(async ({ input }) => {
  const [newMessage] = await db.insert(message).values({
    conversationId: input.conversationId,
    projectId: input.projectId,
    role: input.role,
    content: input.content,
    status: input.status,
  }).returning()

  if (!newMessage) {
    throw new ORPCError('INTERNAL_SERVER_ERROR')
  }

  await db.update(conversation).set({
    updatedAt: new Date(),
  }).where(eq(conversation.id, input.conversationId))

  return {
    id: newMessage.id,
  }
})

export const updateMessageContent = authed.route({
  method: 'POST',
  path: '/messages/update-content',
  summary: 'Update Message Content',
  tags: ['Messages'],
}).input(z.object({
  id: z.string(),
  content: z.string(),
})).handler(async ({ input }) => {
  await db.update(message).set({
    content: input.content,
  }).where(eq(message.id, input.id))
})
