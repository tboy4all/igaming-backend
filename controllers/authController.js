const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

exports.register = async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ msg: 'Username required' })

    let user = await User.findOne({ username })
    if (user) return res.status(400).json({ msg: 'Username already taken' })

    user = await User.create({ username })
    const token = generateToken(user)

    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.login = async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: 'User not found' })

    const token = generateToken(user)
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}
