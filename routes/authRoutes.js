const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and login
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user with a username
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: taiye
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username already exists
 */
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in using username
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: taiye
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT token.
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login)

module.exports = router
