import process from 'node:process'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, Output } from 'ai'
import z from 'zod'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe(
      'The code to insert at cursor, or empty string if no completion needed',
    ),
})

const SUGGESTION_PROMPT = `You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:

1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
</instructions>`

const schema = z.object({
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
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

    const { fileName, code, currentLine, previousLines, textBeforeCursor, textAfterCursor, nextLines, lineNumber } = result.data

    const prompt = SUGGESTION_PROMPT
      .replace('{fileName}', fileName)
      .replace('{code}', code)
      .replace('{currentLine}', currentLine)
      .replace('{previousLines}', previousLines || '')
      .replace('{textBeforeCursor}', textBeforeCursor)
      .replace('{textAfterCursor}', textAfterCursor)
      .replace('{nextLines}', nextLines || '')
      .replace('{lineNumber}', lineNumber.toString())

    const { output } = await generateText({
      model: openrouter('minimax/minimax-m2.5'),
      output: Output.object({ schema: suggestionSchema }),
      prompt,
    })

    return {
      suggestion: output.suggestion,
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
