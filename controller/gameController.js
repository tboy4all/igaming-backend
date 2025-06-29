const GameSession = require('../models/GameSession')
const User = require('../models/User')

exports.joinSession = async (req, res) => {
  try {
    const { guess } = req.body

    if (!guess || isNaN(guess) || guess < 1 || guess > 10) {
      return res
        .status(400)
        .json({ message: 'Guess must be a number between 1 and 10' })
    }

    const activeSession = await GameSession.findOne({ active: true })

    if (!activeSession) {
      console.log(' No active session found.')
      return res.status(400).json({ message: 'No active session available' })
    }

    const now = new Date()
    if (now > new Date(activeSession.endTime)) {
      console.log(
        ' Session expired. Now:',
        now,
        'EndTime:',
        activeSession.endTime
      )
      return res.status(400).json({ message: 'No active session available' })
    }

    const alreadyJoined = activeSession.players.find(
      (player) => player.userId.toString() === req.user._id.toString()
    )
    if (alreadyJoined) {
      return res
        .status(400)
        .json({ message: 'You have already joined this session' })
    }

    activeSession.players.push({
      userId: req.user._id,
      guess: parseInt(guess),
    })

    await activeSession.save()

    console.log(
      `[JOINED] User ${req.user.username} guessed ${guess} in session ${activeSession._id}`
    )

    res.status(200).json({
      message: 'Successfully joined the session',
      guess: parseInt(guess),
      sessionId: activeSession._id,
    })
  } catch (err) {
    console.error('[ERROR] Join session failed:', err)
    res
      .status(500)
      .json({ message: 'Error joining session', error: err.message })
  }
}

exports.getTopPlayers = async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select('username wins') // Only send relevant fields

    res.status(200).json({
      success: true,
      players: topPlayers,
    })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch leaderboard', error: err.message })
  }
}

exports.startNewSession = async (req, res) => {
  try {
    const { duration } = req.body // seconds

    const existingActive = await GameSession.findOne({ active: true })
    if (existingActive) {
      return res
        .status(400)
        .json({ message: 'An active session already exists' })
    }

    const now = Date.now()
    const newSession = new GameSession({
      startTime: now,
      endTime: now + duration * 1000,
      active: true,
      players: [],
    })

    await newSession.save()
    res.status(201).json({
      message: `New session started for ${duration} seconds`,
      session: newSession,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to start session', error: error.message })
  }
}

exports.resetGame = async (req, res) => {
  try {
    await GameSession.deleteMany({})
    await User.updateMany({}, { $set: { wins: 0 } })

    res.json({ message: 'All sessions cleared and user scores reset' })
  } catch (error) {
    res.status(500).json({ message: 'Reset failed', error: error.message })
  }
}

exports.getActiveSession = async (req, res) => {
  try {
    const session = await GameSession.findOne({ active: true }).populate(
      'players.userId'
    )

    if (!session) {
      return res.status(200).json({ active: false })
    }

    res.status(200).json({
      active: true,
      startTime: session.startTime,
      endTime: session.endTime,
      playersCount: session.players.length,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching session', error: error.message })
  }
}

exports.getLastSessionResult = async (req, res) => {
  try {
    const lastSession = await GameSession.findOne({ active: false })
      .sort({ endTime: -1 })
      .populate('players.userId')

    if (!lastSession) {
      return res.status(404).json({ message: 'No completed session found' })
    }

    const winningNumber = lastSession.winningNumber
    const winners = lastSession.players
      .filter((p) => p.isWinner)
      .map((p) => p.userId?.username)

    res.status(200).json({
      winningNumber,
      totalPlayers: lastSession.players.length,
      winners,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result', error })
  }
}
