import { createSelectSchema } from 'drizzle-orm/zod'
import { conversation, file, message, project } from '~~/server/db/schema'

export const projectSelectSchema = createSelectSchema(project)

export const fileSelectSchema = createSelectSchema(file)

export const conversationSelectSchema = createSelectSchema(conversation)

export const messageSelectSchema = createSelectSchema(message)
