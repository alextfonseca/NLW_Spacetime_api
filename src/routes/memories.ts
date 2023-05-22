import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // verify if the user is authenticated
  app.addHook('preHandler', async request => {
    await request.jwtVerify()
  })

  app.get('/memories', async request => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return memories.map(memory => ({
      id: memory.id,
      coverUrl: memory.coverUrl,
      excerpt: memory.content.substring(0, 100).concat('...'),
      createdAt: memory.createdAt
    }))
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string()
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id
      }
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      reply.status(403).send({
        message: 'You are not allowed to access this memory'
      })
    }

    return memory
  })

  app.post('/memories', async request => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { isPublic, coverUrl, content } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        userId: request.user.sub,
        isPublic,
        coverUrl,
        content
      }
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string()
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { isPublic, coverUrl, content } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUnique({
      where: {
        id
      }
    })

    if (memory?.userId !== request.user.sub) {
      reply.status(403).send({
        message: 'You are not allowed to access this memory'
      })
    }

    memory = await prisma.memory.update({
      where: {
        id
      },
      data: {
        isPublic,
        coverUrl,
        content
      }
    })

    return memory
  })
}
