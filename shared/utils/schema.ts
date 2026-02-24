import { createSelectSchema } from 'drizzle-orm/zod'
import { project } from '~~/server/db/schema'

export const projectSelectSchema = createSelectSchema(project)
