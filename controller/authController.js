const User = require('../models/User')
const { createSendToken } = require('../utils/token')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const GameSession = require('../models/GameSession')

// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required.' })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken.' })
    }

    const user = await User.create({ username })
    createSendToken(user, 201, req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required.' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found. Please register.' })
    }

    createSendToken(user, 200, req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// @route GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Count how many times the user has played (joined sessions)

    const allSessions = await GameSession.find({ 'players.userId': user._id })

    const totalGames = allSessions.reduce((count, session) => {
      const hasPlayed = session.players.some(
        (p) => p.userId.toString() === user._id.toString()
      )
      return hasPlayed ? count + 1 : count
    }, 0)

    res.status(200).json({
      username: user.username,
      wins: user.wins,
      totalGames,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to get user info' })
  }
}

exports.protect = async (req, res, next) => {
  try {
    // 1. Get token
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      })
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3. Check if user exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists.',
      })
    }

    // 4. Grant access
    req.user = currentUser
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ status: 'fail', message: 'Unauthorized access' })
  }
}
