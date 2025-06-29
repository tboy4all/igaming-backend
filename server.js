const mongoose = require('mongoose')
const dotenv = require('dotenv')
const logger = require('./utils/logger')

dotenv.config({ path: './config.env' })

const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB).then(() => logger.info('✅ DB connection successful!'))

// Start session manager
require('./utils/sessionManager')

const port = process.env.PORT || 5000
// Start the server
app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}...`)
})
