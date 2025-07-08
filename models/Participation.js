const mongoose = require('mongoose')

const participationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession' },
  pickedNumber: Number,
  isWinner: Boolean,
})

module.exports = mongoose.model('Participation', participationSchema)
