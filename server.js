const dotenv = require('dotenv')
const http = require('http')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

const app = require('./app')
const logger = require('./utils/logger')
const sessionManager = require('./utils/sessionManager')

dotenv.config({ path: './config.env' })

const port = process.env.PORT || 5000
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // ✅ local dev
      process.env.FRONTEND_URL, // ✅ production frontend
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Pass io instance to sessionManager
sessionManager.setIO(io)

mongoose
  .connect(DB)
  .then(() => {
    logger.info('✅ DB connection successful!')
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}...`)
    })

    sessionManager.startNewGameSession()
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err))

io.on('connection', (socket) => {
  logger.info(`🔌 WebSocket connected: ${socket.id}`)
})
