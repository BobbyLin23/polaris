import { ORPCError } from '@orpc/server'
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
