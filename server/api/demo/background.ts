import { inngest } from '~~/inngest'

export default defineEventHandler(async () => {
  await inngest.send({
    name: 'demo/generate',
    data: {},
  })

  return {
    status: 'started',
  }
})
