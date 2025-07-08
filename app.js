const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { swaggerUi, swaggerSpec } = require('./swagger')

const authRouter = require('./routes/authRoutes')
const gameRouter = require('./routes/gameRoutes')

const app = express()

// GLOBAL MIDDLEWARE
// Implement CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://igaming-frontend-rosy.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(express.static(path.join(__dirname, 'public')))
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/game', gameRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal Server Error' })
})

app.get('/', (req, res) => {
  res.send('🎮 iGaming API is running')
})

module.exports = app
