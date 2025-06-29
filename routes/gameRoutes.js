const express = require('express')
const router = express.Router()

const {
  joinSession,
  getTopPlayers,
  startNewSession,
  resetGame,
  getActiveSession,
  getLastSessionResult,
} = require('../controller/gameController')
const { protect } = require('../controller/authController')

router.post('/join', protect, joinSession)
router.get('/leaderboard', getTopPlayers)
router.post('/start-session', startNewSession)
router.post('/reset', resetGame)
router.get('/active-session', getActiveSession)
router.get('/last-result', getLastSessionResult)

module.exports = router
