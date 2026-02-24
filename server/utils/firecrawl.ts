import process from 'node:process'
import Firecrawl from '@mendable/firecrawl-js'

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
})
