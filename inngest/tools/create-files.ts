import { createTool } from '@inngest/agent-kit'
import { z } from 'zod'
import { db } from '../../server/db'
import { file } from '../../server/db/schema'

interface CreateFilesToolOptions {
  projectId: string
}

const paramsSchema = z.object({
  parentId: z.string(),
  files: z
    .array(
      z.object({
        name: z.string().min(1, 'File name cannot be empty'),
        content: z.string(),
      }),
    )
    .min(1, 'Provide at least one file to create'),
})

export function createCreateFilesTool({
  projectId,
}: CreateFilesToolOptions) {
  return createTool({
    name: 'createFiles',
    description:
      'Create multiple files at once in the same folder. Use this to batch create files that share the same parent folder. More efficient than creating files one by one.',
    parameters: z.object({
      parentId: z
        .string()
        .describe(
          'The ID of the parent folder. Use empty string for root level. Must be a valid folder ID from listFiles.',
        ),
      files: z
        .array(
          z.object({
            name: z.string().describe('The file name including extension'),
            content: z.string().describe('The file content'),
          }),
        )
        .describe('Array of files to create'),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params)
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`
      }

      const { parentId, files } = parsed.data

      try {
        return await toolStep?.run('create-files', async () => {
          let resolvedParentId: string | undefined

          if (parentId && parentId !== '') {
            try {
              resolvedParentId = parentId
              const parentFolder = await db.query.file.findFirst({
                where: {
                  id: resolvedParentId,
                },
              })
              if (!parentFolder) {
                return `Error: Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs.`
              }
              if (parentFolder.type !== 'folder') {
                return `Error: The ID "${parentId}" is a file, not a folder. Use a folder ID as parentId.`
              }
            }
            catch {
              return `Error: Invalid parentId "${parentId}". Use listFiles to get valid folder IDs, or use empty string for root level.`
            }
          }

          const results = await Promise.all(files.map(async (f) => {
            const [res] = await db.insert(file).values({
              projectId,
              parentId: resolvedParentId,
              name: f.name,
              content: f.content,
              type: 'file',
            }).returning()

            return res
          }))

          const created = results.filter(r => !r)
          const failed = results.filter(r => r)

          let response = `Created ${created.length} file(s)`
          if (created.length > 0) {
            response += `: ${created.map(r => r.name).join(', ')}`
          }
          if (failed.length > 0) {
            response += `. Failed: ${failed.map(r => `${r.name}`).join(', ')}`
          }

          return response
        })
      }
      catch (error) {
        return `Error creating files: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    },
  })
}
