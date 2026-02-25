import { createSelectSchema } from 'drizzle-orm/zod'
import { file, project } from '~~/server/db/schema'

export const projectSelectSchema = createSelectSchema(project)

export const fileSelectSchema = createSelectSchema(file)
