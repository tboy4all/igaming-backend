const GameSession = require('../models/GameSession')
const Participation = require('../models/Participation')
const User = require('../models/User')
const logger = require('./logger')

let currentSession = null
let countdownInterval = null

let io = null // Set externally so we can access inside the module

const setIO = (ioInstance) => {
  io = ioInstance
}

const getCurrentSession = () => currentSession

const broadcastSessionUpdate = async () => {
  if (!currentSession) return

  const now = Date.now()
  const timeLeft = Math.max(
    0,
    Math.floor((new Date(currentSession.endTime) - now) / 1000)
  )
  const isJoinable = timeLeft > 0

  let totalUsers = 0
  if (currentSession._id) {
    totalUsers = await Participation.countDocuments({
      sessionId: currentSession._id,
    })
  }

  io.emit('sessionUpdate', { timeLeft, isJoinable, totalUsers })

  if (timeLeft <= 0) {
    clearInterval(countdownInterval)
    await endCurrentSession()
  }
}

const endCurrentSession = async () => {
  if (!currentSession) return

  const winningNumber = Math.floor(Math.random() * 10) + 1
  currentSession.isActive = false
  currentSession.winningNumber = winningNumber
  await currentSession.save()

  logger.info(
    `🏁 Session ${currentSession._id} ended. Winning number: ${winningNumber}`
  )

  const participants = await Participation.find({
    sessionId: currentSession._id,
  })

  const winners = []
  let totalWins = 0

  for (const player of participants) {
    if (player.pickedNumber === winningNumber) {
      player.isWinner = true
      await player.save()
      await User.findByIdAndUpdate(player.userId, { $inc: { wins: 1 } })
      winners.push(player.userId)
      totalWins++
    }
  }

  const userDetails = await User.find({ _id: { $in: winners } }).select(
    'username'
  )

  io.emit('sessionResult', {
    winningNumber,
    totalPlayers: participants.length,
    totalWins,
    winners: userDetails.map((u) => u.username),
  })

  setTimeout(() => {
    startNewGameSession()
  }, 10000) // wait 10s before restarting

  currentSession = null
}

const startNewGameSession = async () => {
  clearInterval(countdownInterval)
  currentSession = null

  const now = new Date()
  const end = new Date(now.getTime() + 20000)

  await GameSession.updateMany({ isActive: true }, { isActive: false })

  currentSession = await GameSession.create({
    startTime: now,
    endTime: end,
    isActive: true,
  })

  logger.info(`✅ New session started: ${currentSession._id}`)

  countdownInterval = setInterval(broadcastSessionUpdate, 1000)
}

module.exports = {
  setIO,
  getCurrentSession,
  startNewGameSession,
}
