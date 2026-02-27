import process from 'node:process'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, Output } from 'ai'
import z from 'zod'

const quickEditSchema = z.object({
  editedCode: z
    .string()
    .describe(
      'The edited version of the selected code based on the instruction',
    ),
})

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`

const schema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
})

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    })

    if (!session) {
      return createError({
        message: 'Unauthorized',
        statusCode: 400,
      })
    }

    const result = await readValidatedBody(event, body => schema.safeParse(body))

    if (!result.success) {
      return createError({
        message: result.error.issues.map(issue => issue.message).join(', '),
        statusCode: 400,
      })
    }

    const { selectedCode, fullCode, instruction } = result.data

    const urls: string[] = instruction.match(URL_REGEX) || []
    let documentationContext = ''

    if (urls.length > 0) {
      const scrapedResults = await Promise.all(
        urls.map(async (url) => {
          try {
            const result = await firecrawl.scrape(url, {
              formats: ['markdown'],
            })

            if (result.markdown) {
              return `<doc url="${url}">\n${result.markdown}\n</doc>`
            }

            return null
          }
          catch {
            return null
          }
        }),
      )

      const validResults = scrapedResults.filter(Boolean)

      if (validResults.length > 0) {
        documentationContext = `<documentation>\n${validResults.join('\n\n')}\n</documentation>`
      }

      const prompt = QUICK_EDIT_PROMPT
        .replace('{selectedCode}', selectedCode)
        .replace('{fullCode}', fullCode || '')
        .replace('{instruction}', instruction)
        .replace('{documentation}', documentationContext)

      const { output } = await generateText({
        model: openrouter('minimax/minimax-m2.5'),
        output: Output.object({ schema: quickEditSchema }),
        prompt,
      })

      return {
        editedCode: output.editedCode,
      }
    }
  }
  catch (error) {
    console.error(error)
    return createError({
      message: 'Internal server error',
      statusCode: 500,
    })
  }
})
