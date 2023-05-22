import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
      }
    })

    if (!upload) {
      return reply.status(400).send({
        message: 'No file provided'
      })
    }

    const miniTypeRegexImageOrVideo = /^image\/.+|video\/.+$/i

    const isValidFileFormat = miniTypeRegexImageOrVideo.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.status(400).send({
        message: 'Invalid file type'
      })
    }

    const fileId = randomUUID()

    const extension = extname(upload.filename)

    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName)
    )

    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://', request.hostname)

    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return {
      url: fileUrl
    }
  })
}
