import process from 'node:process'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { firecrawl } from '~~/server/utils/firecrawl'
import { inngest } from './client'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const URL_REGEX = /https?:\/\/\S+/g

export const demoGenerate = inngest.createFunction(
  { id: 'demo-generate' },
  { event: 'demo/generate' },
  async ({ step, event }) => {
    const { prompt } = event.data

    const urls = await step.run('exctract-urls', async () => {
      return prompt.match(URL_REGEX) ?? []
    }) as string[]

    const scrapedContent = await step.run('scrape-urls', async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrape(
            url,
            { formats: ['markdown'] },
          )
          return result.markdown ?? null
        }),
      )
      return results.filter(Boolean).join('\n\n')
    })

    const finalPrompt = scrapedContent
      ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
      : prompt

    await step.run('generate-text', async () => {
      return await generateText({
        model: openrouter('minimax/minimax-m2.5'),
        prompt: finalPrompt,
      })
    })
  },
)
