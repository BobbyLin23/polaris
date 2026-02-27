import process from 'node:process'
import { anthropic, createAgent, createNetwork } from '@inngest/agent-kit'
import { eq } from 'drizzle-orm'
import { NonRetriableError } from 'inngest'
import { db } from '../server/db'
import { conversation, message } from '../server/db/schema'
import { inngest } from './client'
import { createCreateFilesTool } from './tools/create-files'
import { createCreateFolderTool } from './tools/create-folder'
import { createDeleteFilesTool } from './tools/delete-file'
import { createListFilesTool } from './tools/list-files'
import { createReadFilesTool } from './tools/read-file'
import { createRenameFileTool } from './tools/rename-file'
import { createScrapeUrlsTool } from './tools/scrape-url'
import { createUpdateFileTool } from './tools/update-file'

interface MessageEvent {
  messageId: string
  conversationId: string
  projectId: string
  message: string
}

export const processMessage = inngest.createFunction(
  {
    id: 'process-message',
    cancelOn: [
      {
        event: 'message/cancel',
        if: 'event.data.messageId == async.data.messageId',
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent

      // Update the message with error content
      await step.run('update-message-on-failure', async () => {
        await db.update(message).set({
          status: 'cancelled',
          content:
              'My apologies, I encountered an error while processing your request. Let me know if you need anything else!',
        }).where(eq(message.id, messageId))
      })
    },
  },
  {
    event: 'message/sent',
  },
  async ({ event, step }) => {
    const { messageId, conversationId, projectId, message: userMessage } = event.data as MessageEvent

    await step.sleep('wait-for-ai-processing', '1s')

    const currentConversation = await step.run('get-conversation', async () => {
      return await db.query.conversation.findFirst({
        where: {
          id: conversationId,
        },
      })
    })

    if (!currentConversation) {
      throw new NonRetriableError('Conversation not found')
    }

    const recentMessages = await step.run('get-recent-messages', async () => {
      return await db.query.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        limit: 10,
      })
    })

    // Build system prompt with conversation history (exclude the current processing message)
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT

    // Filter out the current processing message and empty messages
    const contextMessages = recentMessages.filter(
      msg => msg.id !== messageId && msg.content.trim() !== '',
    )

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n')

      systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`
    }

    const shouldGenerateTitle
      = currentConversation.title === DEFAULT_CONVERSATION_TITLE

    if (shouldGenerateTitle) {
      const titleAgent = createAgent({
        name: 'title-generator',
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model: anthropic({
          model: 'claude-sonnet-4-20250514',
          defaultParameters: { temperature: 0, max_tokens: 50 },
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
        }),
      })

      const { output } = await titleAgent.run(userMessage, { step })

      const textMessage = output.find(
        m => m.type === 'text' && m.role === 'assistant',
      )

      if (textMessage?.type === 'text') {
        const title
          = typeof textMessage.content === 'string'
            ? textMessage.content.trim()
            : textMessage.content
                .map(c => c.text)
                .join('')
                .trim()

        if (title) {
          await step.run('update-conversation-title', async () => {
            await db.update(conversation).set({
              title,
            }).where(eq(conversation.id, conversationId))
          })
        }
      }
    }

    const codingAgent = createAgent({
      name: 'polaris',
      description: 'An expert AI coding assistant',
      system: systemPrompt,
      model: anthropic({
        model: 'claude-opus-4-20250514',
        defaultParameters: { temperature: 0.3, max_tokens: 16000 },
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      }),
      tools: [
        createListFilesTool({ projectId }),
        createReadFilesTool(),
        createUpdateFileTool(),
        createCreateFilesTool({ projectId }),
        createCreateFolderTool({ projectId }),
        createRenameFileTool(),
        createDeleteFilesTool(),
        createScrapeUrlsTool(),
      ],
    })

    // Create network with single agent
    const network = createNetwork({
      name: 'polaris-network',
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1)
        const hasTextResponse = lastResult?.output.some(
          m => m.type === 'text' && m.role === 'assistant',
        )
        const hasToolCalls = lastResult?.output.some(
          m => m.type === 'tool_call',
        )

        // Anthropic outputs text AND tool calls together
        // Only stop if there's text WITHOUT tool calls (final response)
        if (hasTextResponse && !hasToolCalls) {
          return undefined
        }
        return codingAgent
      },
    })

    // Run the agent
    const result = await network.run(userMessage)

    // Extract the assistant's text response from the last agent result
    const lastResult = result.state.results.at(-1)
    const textMessage = lastResult?.output.find(
      m => m.type === 'text' && m.role === 'assistant',
    )

    let assistantResponse
      = 'I processed your request. Let me know if you need anything else!'

    if (textMessage?.type === 'text') {
      assistantResponse
        = typeof textMessage.content === 'string'
          ? textMessage.content
          : textMessage.content.map(c => c.text).join('')
    }

    await step.run('update-assistant-message', async () => {
      await db.update(message).set({
        status: 'completed',
        content: assistantResponse,
      }).where(eq(message.id, messageId))
    })

    return {
      success: true,
      messageId,
      conversationId,
    }
  },
)
