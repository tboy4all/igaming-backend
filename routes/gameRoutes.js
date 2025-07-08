const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  getActiveSession,
  joinSession,
  endSession,
  startSession,
  getTopPlayers,
  getUserStats,
  getActiveSessionStatus,
  markUserEnteredSession,
} = require('../controllers/gameController')

/**
 * @swagger
 * tags:
 *   name: Game
 *   description: Game-related endpoints
 */

/**
 * @swagger
 * /game/session:
 *   get:
 *     summary: Get the currently active game session
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Current session data
 *       404:
 *         description: No active session
 */
router.get('/session', getActiveSession)

/**
 * @swagger
 * /game/join:
 *   post:
 *     summary: Join the active game session with a number
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickedNumber
 *             properties:
 *               guess:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 5
 *     responses:
 *       200:
 *         description: Successfully joined the session
 *       400:
 *         description: Already joined or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/join', auth, joinSession)

/**
 * @swagger
 * /game/start:
 *   post:
 *     summary: Manually start a new game session
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Session started
 */
router.post('/start', startSession)

/**
 * @swagger
 * /game/end:
 *   post:
 *     summary: Manually end the current game session
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Session ended and result broadcast
 */
router.post('/end', endSession)

/**
 * @swagger
 * /game/user-stats:
 *   get:
 *     summary: Get win/loss stats for the authenticated user
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wins:
 *                   type: integer
 *                   example: 3
 *                 loses:
 *                   type: integer
 *                   example: 7
 *       401:
 *         description: Unauthorized
 */
router.get('/user-stats', auth, getUserStats)

/**
 * @swagger
 * /game/session-status:
 *   get:
 *     summary: Check if a session is currently active and joinable
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Session status info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isJoinable:
 *                   type: boolean
 *                 timeLeft:
 *                   type: integer
 */
router.get('/session-status', getActiveSessionStatus)

/**
 * @swagger
 * /game/enter:
 *   post:
 *     summary: Mark that a user has entered the session from the home page
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User marked as entered
 *       401:
 *         description: Unauthorized
 */
router.post('/enter', auth, markUserEnteredSession)

/**
 * @swagger
 * /game/top-players:
 *   get:
 *     summary: Get leaderboard with top players
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: List of top players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   wins:
 *                     type: integer
 */
router.get('/top-players', getTopPlayers)

module.exports = router
