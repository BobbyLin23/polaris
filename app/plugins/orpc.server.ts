import { createRouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { routers } from '~~/server/routers'
import { auth } from '~~/server/utils/auth'

export default defineNuxtPlugin(async () => {
  const event = useRequestEvent()

  const session = event
    ? await auth.api.getSession({
        headers: event.headers,
      })
    : null

  const client = createRouterClient(routers, {
    context: {
      session: session?.session ?? null,
    },
  })

  const orpc = createTanstackQueryUtils(client)

  return {
    provide: {
      orpc,
    },
  }
})
