import process from 'node:process'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { inngest } from './client'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const demoGenerate = inngest.createFunction(
  { id: 'demo-generate' },
  { event: 'demo/generate' },
  async ({ step }) => {
    await step.run('generate-text', async () => {
      return await generateText({
        model: openrouter('minimax/minimax-m2.5'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
      })
    })
  },
)
