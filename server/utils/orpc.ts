import type { Session } from 'better-auth'
import { ORPCError, os } from '@orpc/server'

export interface ORPCContext {
  session: Session | null
}

export const pub = os
  .$context<ORPCContext>()

export const authed = pub.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: {
      session: context.session,
    },
  })
})
