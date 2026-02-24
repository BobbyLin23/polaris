import { ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { project } from '../db/schema'
import { authed } from '../utils/orpc'

export const getProjects = authed.route({
  method: 'GET',
  path: '/projects',
  summary: 'List projects',
  tags: ['Projects'],
})
  .output(z.array(projectSelectSchema))
  .handler(async ({ context }) => {
    const res = await db.query.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        ownerId: context.session.userId,
      },
    })

    return res
  })

export const createProject = authed.route({
  method: 'POST',
  path: '/projects',
  summary: 'Create a project',
  tags: ['Projects'],
})
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .output(z.object({
    id: z.string(),
  }))
  .handler(async ({ input, context }) => {
    const [createdProject] = await db.insert(project).values({
      name: input.name,
      ownerId: context.session.userId,
    }).returning()

    if (!createdProject) {
      throw new ORPCError('INTERNAL_SERVER_ERROR')
    }

    return {
      id: createdProject?.id,
    }
  })

export const getProjectsPartial = authed.route({
  method: 'GET',
  path: '/projects/partial',
  summary: 'List partial projects',
  tags: ['Projects'],
})
  .input(z.object({
    limit: z.number(),
  }))
  .output(z.array(projectSelectSchema))
  .handler(async ({ input, context }) => {
    const res = await db.query.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        ownerId: context.session.userId,
      },
      limit: input.limit,
    })

    return res
  })

export const getProjectById = authed.route({
  method: 'GET',
  path: '/projects/:projectId',
  summary: 'Get project by id',
  tags: ['Projects'],
})
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output(projectSelectSchema)
  .handler(async ({ context, input }) => {
    const res = await db.query.project.findFirst({
      where: {
        id: input.id,
        ownerId: context.session.userId,
      },
    })

    if (!res) {
      throw new ORPCError('NOT_FOUND')
    }

    return res
  })

export const renameProject = authed.route({
  method: 'PUT',
  path: '/projects/:projectId',
  summary: 'Rename project',
  tags: ['Projects'],
}).input(
  z.object({
    id: z.string(),
    name: z.string(),
  }),
).handler(async ({ input, context }) => {
  const currentProject = await db.query.project.findFirst({
    where: {
      id: input.id,
    },
  })

  if (!currentProject) {
    throw new ORPCError('NOT_FOUND')
  }

  if (currentProject.ownerId !== context.session.userId) {
    throw new ORPCError('FORBIDDEN')
  }

  await db.update(project).set({
    name: input.name,
  }).where(eq(project.id, input.id))
})
