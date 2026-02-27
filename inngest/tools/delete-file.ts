import { createTool } from '@inngest/agent-kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../server/db'
import { file } from '../../server/db/schema'

const paramsSchema = z.object({
  fileIds: z
    .array(z.string().min(1, 'File ID cannot be empty'))
    .min(1, 'Provide at least one file ID'),
})

export function createDeleteFilesTool() {
  return createTool({
    name: 'deleteFiles',
    description:
      'Delete files or folders from the project. If deleting a folder, all contents will be deleted recursively.',
    parameters: z.object({
      fileIds: z
        .array(z.string())
        .describe('Array of file or folder IDs to delete'),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params)
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`
      }

      const { fileIds } = parsed.data

      // Validate all files exist before running the step
      const filesToDelete: {
        id: string
        name: string
        type: string
      }[] = []

      for (const fileId of fileIds) {
        const file = await db.query.file.findFirst({
          where: {
            id: fileId,
          },
        })

        if (!file) {
          return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`
        }

        filesToDelete.push({
          id: file.id,
          name: file.name,
          type: file.type,
        })
      }

      try {
        return await toolStep?.run('delete-files', async () => {
          const results: string[] = []

          for (const f of filesToDelete) {
            await db.delete(file).where(eq(file.id, f.id))

            results.push(`Deleted ${f.type} "${f.name}" successfully`)
          }

          return results.join('\n')
        })
      }
      catch (error) {
        return `Error deleting files: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    },
  })
}
