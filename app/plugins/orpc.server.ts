import { createRouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { routers } from '~~/server/routers'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()

  const client = createRouterClient(routers, {
    context: {
      headers: event?.headers,
    },
  })

  const orpc = createTanstackQueryUtils(client)

  return {
    provide: {
      orpc,
    },
  }
})
