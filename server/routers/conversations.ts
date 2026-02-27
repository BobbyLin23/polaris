import { ORPCError } from '@orpc/server'
import z from 'zod'
import { db } from '../db'
import { conversation } from '../db/schema'
import { authed } from '../utils/orpc'

export const createConversation = authed.route({
  method: 'POST',
  path: '/conversations',
  summary: 'Create a conversation',
  tags: ['Conversations'],
}).input(z.object({
  projectId: z.string(),
  title: z.string(),
})).output(
  z.object({
    id: z.string(),
  }),
).handler(async ({ input, context }) => {
  const project = await db.query.project.findFirst({
    where: {
      id: input.projectId,
    },
  })

  if (!project) {
    throw new ORPCError('NOT_FOUND')
  }

  if (project.ownerId !== context.session.userId) {
    throw new ORPCError('FORBIDDEN')
  }

  const [newConversation] = await db.insert(conversation).values({
    projectId: input.projectId,
    title: input.title,
  }).returning()

  if (!newConversation) {
    throw new ORPCError('INTERNAL_SERVER_ERROR')
  }

  return {
    id: newConversation.id,
  }
})

export const getConversationById = authed.route({
  method: 'GET',
  path: '/conversations/:conversationId',
  summary: 'Get Conversation By Id',
  tags: ['Conversations'],
}).input(z.object({
  id: z.string(),
})).output(conversationSelectSchema).handler(async ({ input, context }) => {
  const conversation = await db.query.conversation.findFirst({
    where: {
      id: input.id,
    },
  })

  if (!conversation) {
    throw new ORPCError('NOT_FOUND')
  }

  const project = await db.query.project.findFirst({
    where: {
      id: conversation.projectId,
    },
  })

  if (!project) {
    throw new ORPCError('NOT_FOUND')
  }

  if (project.ownerId !== context.session.userId) {
    throw new ORPCError('FORBIDDEN')
  }

  return conversation
})

export const getConversationsByProject = authed.route({
  method: 'GET',
  path: '/conversations/project/:projectId',
  summary: 'Get Conversations By Project',
  tags: ['Conversations'],
}).input(z.object({
  projectId: z.string(),
})).output(z.array(conversationSelectSchema)).handler(async ({ input, context }) => {
  const project = await db.query.project.findFirst({
    where: {
      id: input.projectId,
    },
  })

  if (!project) {
    throw new ORPCError('NOT_FOUND')
  }

  if (project.ownerId !== context.session.userId) {
    throw new ORPCError('FORBIDDEN')
  }

  const conversations = await db.query.conversation.findMany({
    where: {
      projectId: input.projectId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!conversations) {
    throw new ORPCError('NOT_FOUND')
  }

  return conversations
})

export const getMessages = authed.route({
  method: 'GET',
  path: '/conversations/:conversationId/messages',
  summary: 'Get Messages',
  tags: ['Messages'],
}).input(z.object({
  conversationId: z.string(),
})).output(z.array(messageSelectSchema)).handler(async ({ input, context }) => {
  const conversation = await db.query.conversation.findFirst({
    where: {
      id: input.conversationId,
    },
  })

  if (!conversation) {
    throw new ORPCError('NOT_FOUND')
  }

  const project = await db.query.project.findFirst({
    where: {
      id: conversation.projectId,
    },
  })

  if (!project) {
    throw new ORPCError('NOT_FOUND')
  }

  if (project.ownerId !== context.session.userId) {
    throw new ORPCError('FORBIDDEN')
  }

  const messages = await db.query.message.findMany({
    where: {
      conversationId: input.conversationId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (!messages) {
    throw new ORPCError('NOT_FOUND')
  }

  return messages
})
