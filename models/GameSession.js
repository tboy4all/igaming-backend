const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema(
  {
    startTime: Date,
    endTime: Date,
    active: { type: Boolean, default: true },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guess: Number,
        isWinner: Boolean,
      },
    ],
    winningNumber: Number,
  },
  { timestamps: true }
)

module.exports = mongoose.model('GameSession', sessionSchema)
