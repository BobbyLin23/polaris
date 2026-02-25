import type { file, project } from '~~/server/db/schema'

export type SelectProject = typeof project.$inferSelect
export type SelectFile = typeof file.$inferSelect
