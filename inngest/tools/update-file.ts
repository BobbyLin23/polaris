import { createTool } from '@inngest/agent-kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../server/db'
import { file } from '../../server/db/schema'

const paramsSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  content: z.string(),
})

export function createUpdateFileTool() {
  return createTool({
    name: 'updateFile',
    description: 'Update the content of an existing file',
    parameters: z.object({
      fileId: z.string().describe('The ID of the file to update'),
      content: z.string().describe('The new content for the file'),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params)
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`
      }

      const { fileId, content } = parsed.data

      // Validate file exists before running the step
      const currentFile = await db.query.file.findFirst({
        where: {
          id: fileId,
        },
      })

      if (!currentFile) {
        return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`
      }

      if (currentFile.type === 'folder') {
        return `Error: "${fileId}" is a folder, not a file. You can only update file contents.`
      }

      try {
        return await toolStep?.run('update-file', async () => {
          await db.update(file).set({
            content,
          }).where(eq(file.id, fileId))

          return `File "${file.name}" updated successfully`
        })
      }
      catch (error) {
        return `Error update file: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    },
  })
}
