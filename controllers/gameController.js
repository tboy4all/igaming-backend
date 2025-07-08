const GameSession = require('../models/GameSession')
const Participation = require('../models/Participation')
const User = require('../models/User')

// Get current active session
exports.getActiveSession = async (req, res) => {
  const session = await GameSession.findOne({ isActive: true })
  res.json(session)
}

exports.joinSession = async (req, res) => {
  const { pickedNumber } = req.body
  const userId = req.user.id

  const session = await GameSession.findOne({ isActive: true })
  if (!session) return res.status(400).json({ msg: 'No active session' })

  const existing = await Participation.findOne({
    sessionId: session._id,
    userId,
  })

  if (existing) {
    if (existing.pickedNumber !== null) {
      return res.status(400).json({ msg: 'You already joined this session' })
    }

    // ✅ Update the existing participation with the picked number
    existing.pickedNumber = pickedNumber
    await existing.save()

    return res.json({ msg: 'Picked number updated successfully' })
  }

  // ✅ No existing record — create one
  const participation = await Participation.create({
    userId,
    sessionId: session._id,
    pickedNumber,
    isWinner: false,
  })

  res.status(201).json({ msg: 'Joined successfully', participation })
}

// End session & pick winner
exports.endSession = async (req, res) => {
  const session = await GameSession.findOne({ isActive: true })
  if (!session) return res.status(400).json({ msg: 'No active session' })

  const winningNumber = Math.floor(Math.random() * 10) + 1
  session.isActive = false
  session.winningNumber = winningNumber
  await session.save()

  const participants = await Participation.find({ sessionId: session._id })

  for (const player of participants) {
    if (player.pickedNumber === winningNumber) {
      player.isWinner = true
      await player.save()
      await User.findByIdAndUpdate(player.userId, { $inc: { wins: 1 } })
    }
  }

  res.json({ msg: 'Session ended', winningNumber })
}

// Start new session
exports.startSession = async (req, res) => {
  const now = new Date()
  const end = new Date(now.getTime() + 20000) // 20 seconds

  const newSession = await GameSession.create({
    startTime: now,
    endTime: end,
    isActive: true,
  })

  res.json({ msg: 'New session started', session: newSession })
}

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id

    const wins = await Participation.countDocuments({ userId, isWinner: true })
    const total = await Participation.countDocuments({ userId })

    const loses = total - wins

    res.json({ wins, loses })
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching stats' })
  }
}

exports.getActiveSessionStatus = async (req, res) => {
  const session = await GameSession.findOne({ isActive: true })
  if (!session) return res.status(404).json({ msg: 'No active session' })

  const totalUsers = await Participation.countDocuments({
    sessionId: session._id,
  })

  const now = Date.now()
  const timeLeft = Math.max(
    0,
    Math.floor((new Date(session.endTime) - now) / 1000)
  )

  res.json({ timeLeft, totalUsers })
}

exports.markUserEnteredSession = async (req, res) => {
  const userId = req.user.id
  const session = await GameSession.findOne({ isActive: true })
  if (!session) return res.status(400).json({ msg: 'No active session' })

  const existing = await Participation.findOne({
    userId,
    sessionId: session._id,
  })

  if (!existing) {
    await Participation.create({
      userId,
      sessionId: session._id,
      pickedNumber: null, // number not yet picked
      isWinner: false,
    })
  }

  res.json({ msg: 'User entered session' })
}

// Top 10 players
exports.getTopPlayers = async (req, res) => {
  const players = await User.find().sort({ wins: -1 }).limit(10)
  res.json(players)
}
