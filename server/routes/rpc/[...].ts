import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { BatchHandlerPlugin } from '@orpc/server/plugins'
import { routers } from '~~/server/routers'

const rpcHandler = new RPCHandler(routers, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
  plugins: [
    new BatchHandlerPlugin(),
  ],
})

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event)

  const session = await auth.api.getSession({
    headers: event.headers,
  })

  const { response } = await rpcHandler.handle(request, {
    prefix: '/rpc',
    context: {
      session: session?.session ?? null,
    },
  })

  if (response) {
    return response
  }

  setResponseStatus(event, 404, 'Not Found')
  return 'Not Found'
})
