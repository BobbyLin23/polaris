import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    projects: r.many.project(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  project: {
    owner: r.one.user({
      from: r.project.ownerId,
      to: r.user.id,
    }),
    files: r.many.file(),
  },
  file: {
    project: r.one.project({
      from: r.file.projectId,
      to: r.project.id,
    }),
  },
}))
