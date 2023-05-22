import 'dotenv/config'
import fastify from 'fastify'

// plugins
import multipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'

// routes
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'node:path'

const app = fastify()

app.register(cors, {
  origin: true
})

app.register(multipart)
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads/'
})

app.register(fastifyJwt, {
  secret: '/bzp+VjRE+CCy9YL2crKhx70h5cDXrk1v3Cud6EflM4='
})

// routes
app.register(memoriesRoutes)
app.register(authRoutes)
app.register(uploadRoutes)

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
