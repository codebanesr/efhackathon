import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import morgan from 'morgan'
import { AuthenticationServer } from '~/core/authentication/server'
import { Server as SocketIOServer } from 'socket.io'
import path from 'path'
import { callReactAgent } from './reactAgent'

const app = express()

const httpServer = createServer(app)
// Initialize Socket.IO
const io = new SocketIOServer(httpServer)

const isProduction = process.env.NODE_ENV === 'production'

const viteDevServer = isProduction
  ? undefined
  : await import('vite').then(vite =>
      vite.createServer({
        server: {
          host: true,
          middlewareMode: true,
          hmr: {
            server: httpServer,
          },
        },
      }),
    )

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : // @ts-expect-error Build will appear after
      // eslint-disable-next-line import/no-unresolved
      await import('../build/server/remix.js'),
})

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
  )
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', { maxAge: '1h' }))

// Serve the test HTML file
app.get('/test-agent', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-agent.html'))
})

app.use(morgan('tiny'))

AuthenticationServer.expressSetup(app)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('runAgent', async (userMessage) => {
    try {
      console.log("Received some data:::")
      // Call the React agent with the user's message
      const response = await callReactAgent(userMessage)
      // Stream each chunk as it comes
      for await (let chunk of response.messages) {
        if(chunk.additional_kwargs.role == 'assistant') {
          socket.emit('agentResponse', chunk)
        }
      }
      
      // Signal completion
      socket.emit('agentComplete')
    } catch (error) {
      console.error('Error running agent:', error)
      socket.emit('agentError', { message: error.message || 'Unknown error occurred' })
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

app.all('*', remixHandler)

const port = process.env.PORT || 8099

httpServer.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`),
)
