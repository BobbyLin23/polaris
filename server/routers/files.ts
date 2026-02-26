import type { SelectFile } from '../../shared/types'
import { ORPCError } from '@orpc/server'
import { and, eq, isNull } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db'
import { file, project } from '../db/schema'
import { authed } from '../utils/orpc'

export const getFolderContent = authed.route({
  method: 'GET',
  path: '/files/folder/:folderId',
  summary: 'Get folder content',
  tags: ['Files'],
})
  .input(z.object({
    projectId: z.string(),
    parentId: z.string().optional(),
  }))
  .output(z.array(fileSelectSchema))
  .handler(async ({ context, input }) => {
    const project = await db.query.project.findFirst({
      where: {
        id: input.projectId,
      },
    })

    if (!project) {
      throw new ORPCError('NOT_FOUND')
    }

    if (project.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const files = await db.select().from(file).where(
      and(
        eq(file.projectId, input.projectId),
        input.parentId === undefined || input.parentId === null
          ? isNull(file.parentId)
          : eq(file.parentId, input.parentId),
      ),
    )

    return files.sort((a, b) => {
      // Folders come before files
      if (a.type === 'folder' && b.type === 'file')
        return -1
      if (a.type === 'file' && b.type === 'folder')
        return 1

      // Within same type, sort alphabetically by name
      return a.name.localeCompare(b.name)
    })
  })

export const getFiles = authed.route({
  method: 'GET',
  path: '/files',
  summary: 'Get files',
  tags: ['Files'],
})
  .input(z.object({
    projectId: z.string(),
  }))
  .output(z.array(fileSelectSchema))
  .handler(async ({ context, input }) => {
    const project = await db.query.project.findFirst({
      where: {
        id: input.projectId,
      },
    })

    if (!project) {
      throw new ORPCError('NOT_FOUND')
    }

    if (project.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const files = await db.query.file.findMany({
      where: {
        projectId: input.projectId,
      },
    })

    return files
  })

export const createFile = authed.route({
  method: 'POST',
  path: '/files/create',
  summary: 'Create file',
  tags: ['Files'],
})
  .input(z.object({
    projectId: z.string(),
    name: z.string(),
    content: z.string(),
    parentId: z.string().optional(),
  }))
  .handler(async ({ context, input }) => {
    const currentProject = await db.query.project.findFirst({
      where: {
        id: input.projectId,
      },
    })

    if (!currentProject) {
      throw new ORPCError('NOT_FOUND')
    }

    if (currentProject.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const files = await db.select().from(file).where(
      and(
        eq(file.projectId, input.projectId),
        input.parentId === undefined || input.parentId === null
          ? isNull(file.parentId)
          : eq(file.parentId, input.parentId),
      ),
    )

    const existing = files.find(f => f.name === input.name && f.type === 'file')
    if (existing) {
      throw new ORPCError('CONFLICT')
    }

    await db.insert(file).values({
      projectId: input.projectId,
      name: input.name,
      content: input.content,
      parentId: input.parentId ?? null,
      type: 'file',
    })

    await db.update(project).set({
      updatedAt: new Date(),
    }).where(eq(project.id, input.projectId))
  })

export const getFile = authed.route({
  method: 'GET',
  path: '/files/:fileId',
  summary: 'Get file',
  tags: ['Files'],
})
  .input(z.object({
    fileId: z.string(),
  }))
  .output(fileSelectSchema)
  .handler(async ({ context, input }) => {
    const file = await db.query.file.findFirst({
      where: {
        id: input.fileId,
      },
    })

    if (!file) {
      throw new ORPCError('NOT_FOUND')
    }

    const project = await db.query.project.findFirst({
      where: {
        id: file.projectId,
      },
    })

    if (!project) {
      throw new ORPCError('NOT_FOUND')
    }

    if (project.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    return file
  })

export const createFolder = authed.route({
  method: 'POST',
  path: '/files/create-folder',
  summary: 'Create folder',
  tags: ['Files'],
})
  .input(z.object({
    projectId: z.string(),
    name: z.string(),
    parentId: z.string().optional(),
  }))
  .handler(async ({ context, input }) => {
    const currentProject = await db.query.project.findFirst({
      where: {
        id: input.projectId,
      },
    })

    if (!currentProject) {
      throw new ORPCError('NOT_FOUND')
    }

    if (currentProject.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const files = await db.select().from(file).where(
      and(
        eq(file.projectId, input.projectId),
        input.parentId === undefined || input.parentId === null
          ? isNull(file.parentId)
          : eq(file.parentId, input.parentId),
      ),
    )

    const existing = files.find(f => f.name === input.name && f.type === 'folder')
    if (existing) {
      throw new ORPCError('CONFLICT')
    }

    await db.insert(file).values({
      projectId: input.projectId,
      name: input.name,
      parentId: input.parentId ?? null,
      type: 'folder',
    })

    await db.update(project).set({
      updatedAt: new Date(),
    }).where(eq(project.id, input.projectId))
  })

export const renameFile = authed.route({
  method: 'POST',
  path: '/files/rename',
  summary: 'Rename file',
  tags: ['Files'],
})
  .input(z.object({
    fileId: z.string(),
    name: z.string(),
  }))
  .handler(async ({ context, input }) => {
    const currentFile = await db.query.file.findFirst({
      where: {
        id: input.fileId,
      },
    })

    if (!currentFile) {
      throw new ORPCError('NOT_FOUND')
    }

    const currentProject = await db.query.project.findFirst({
      where: {
        id: currentFile.projectId,
      },
    })

    if (!currentProject) {
      throw new ORPCError('NOT_FOUND')
    }

    if (currentProject.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const siblings = await db.query.file.findMany({
      where: {
        projectId: currentFile.projectId,
        parentId: currentFile.parentId ?? undefined,
      },
    })

    const existing = siblings.find(
      sibling =>
        sibling.name === input.name
        && sibling.type === currentFile.type
        && sibling.id !== input.fileId,
    )
    if (existing) {
      throw new ORPCError('CONFLICT')
    }

    await db.update(file).set({
      name: input.name,
    }).where(eq(file.id, input.fileId))

    await db.update(project).set({
      updatedAt: new Date(),
    }).where(eq(project.id, currentFile.projectId))
  })

export const deleteFile = authed.route({
  method: 'POST',
  path: '/files/delete',
  summary: 'Delete file',
  tags: ['Files'],
})
  .input(z.object({
    fileId: z.string(),
  }))
  .handler(async ({ context, input }) => {
    const currentFile = await db.query.file.findFirst({
      where: {
        id: input.fileId,
      },
    })

    if (!currentFile) {
      throw new ORPCError('NOT_FOUND')
    }

    const currentProject = await db.query.project.findFirst({
      where: {
        id: currentFile.projectId,
      },
    })

    if (!currentProject) {
      throw new ORPCError('NOT_FOUND')
    }

    if (currentProject.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const deleteRecursive = async (fileId: string) => {
      const item = await db.query.file.findFirst({
        where: {
          id: fileId,
        },
      })

      if (!item) {
        return
      }

      if (item.type === 'folder') {
        const children = await db.query.file.findMany({
          where: {
            projectId: item.projectId,
            parentId: item.id,
          },
        })

        for (const child of children) {
          await deleteRecursive(child.id)
        }
      }

      await db.delete(file).where(eq(file.id, fileId))
    }

    await deleteRecursive(input.fileId)

    await db.update(project).set({
      updatedAt: new Date(),
    }).where(eq(project.id, currentFile.projectId))
  })

export const updateFile = authed.route({
  method: 'POST',
  path: '/files/update',
  summary: 'Update file',
  tags: ['Files'],
})
  .input(z.object({
    fileId: z.string(),
    content: z.string(),
  }))
  .handler(async ({ context, input }) => {
    const currentFile = await db.query.file.findFirst({
      where: {
        id: input.fileId,
      },
    })

    if (!currentFile) {
      throw new ORPCError('NOT_FOUND')
    }

    const currentProject = await db.query.project.findFirst({
      where: {
        id: currentFile.projectId,
      },
    })

    if (!currentProject) {
      throw new ORPCError('NOT_FOUND')
    }

    if (currentProject.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    await db.update(file).set({
      content: input.content,
    }).where(eq(file.id, input.fileId))

    await db.update(project).set({
      updatedAt: new Date(),
    }).where(eq(project.id, currentFile.projectId))
  })

export const getFilePath = authed.route({
  method: 'GET',
  path: '/files/path/:fileId',
  summary: 'Get file path',
  tags: ['Files'],
})
  .input(z.object({
    fileId: z.string(),
  }))
  .output(z.array(z.object({
    id: z.string(),
    name: z.string(),
  })))
  .handler(async ({ context, input }) => {
    const file = await db.query.file.findFirst({
      where: {
        id: input.fileId,
      },
    })

    if (!file) {
      throw new ORPCError('NOT_FOUND')
    }

    const project = await db.query.project.findFirst({
      where: {
        id: file.projectId,
      },
    })

    if (!project) {
      throw new ORPCError('NOT_FOUND')
    }

    if (project.ownerId !== context.session.userId) {
      throw new ORPCError('FORBIDDEN')
    }

    const path: {
      id: string
      name: string
    }[] = []

    let currentId: string | null = input.fileId

    while (currentId) {
      const currentFile: SelectFile | undefined = await db.query.file.findFirst({
        where: {
          id: currentId,
        },
      })

      if (!currentFile) {
        break
      }

      path.unshift({
        id: currentFile.id,
        name: currentFile.name,
      })

      currentId = currentFile.parentId
    }

    return path
  })
