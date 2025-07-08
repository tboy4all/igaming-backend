const mongoose = require('mongoose')

const gameSessionSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  winningNumber: Number,
  isActive: Boolean,
})

module.exports = mongoose.model('GameSession', gameSessionSchema)
