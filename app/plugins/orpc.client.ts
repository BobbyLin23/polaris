import type { RouterClient } from '@orpc/server'
import type { routers } from '~~/server/routers'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

export default defineNuxtPlugin(() => {
  const link = new RPCLink({
    url: `${window.location.origin}/rpc`,
    headers: () => ({}),
    plugins: [
      new BatchLinkPlugin({
        exclude: ({ path }) => path[0] === 'sse',
        groups: [{
          condition: () => true,
          context: {},
        }],
      }),
    ],
  })

  const client: RouterClient<typeof routers> = createORPCClient(link)

  const orpc = createTanstackQueryUtils(client)

  return {
    provide: {
      orpc,
    },
  }
})
