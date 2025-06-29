const GameSession = require('../models/GameSession')
const User = require('../models/User')

async function manageGameSessions() {
  const now = new Date()

  let session = await GameSession.findOne({ active: true })

  // END EXPIRED SESSION
  if (session && now >= session.endTime) {
    const winningNumber = Math.floor(Math.random() * 10) + 1
    session.winningNumber = winningNumber
    session.active = false

    for (const player of session.players) {
      if (player.guess === winningNumber) {
        player.isWinner = true
        await User.findByIdAndUpdate(player.userId, { $inc: { wins: 1 } })
      }
    }

    await session.save()
    console.log(`🎉 Session ended. Winning number: ${winningNumber}`)
  }

  // CREATE NEW SESSION IF NONE ACTIVE
  const existingActive = await GameSession.findOne({ active: true })
  if (!existingActive) {
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + 20000) // 20 seconds ahead

    await GameSession.create({
      startTime,
      endTime,
      active: true,
      players: [],
    })

    console.log(
      `🚀 New session started at ${startTime.toISOString()} — ends at ${endTime.toISOString()}`
    )
  }
}

// Start interval loop
setInterval(manageGameSessions, 10000)

module.exports = {}
