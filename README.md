# 🎮 iGaming Backend API

This is the backend API for a simple multiplayer number-guessing game. Players have 20 seconds to guess a number between 1–10 in each game session. The player(s) who guess correctly win the round. Sessions run automatically with countdown sync between frontend and backend.

---

## 🧠 Approach Overview

This backend was designed to:

- Run automatic 20-second sessions using server-side timers.
- Allow authenticated users to submit a guess during active sessions.
- Store each session’s guesses and determine winners at the end.
- Prevent players from submitting more than once per session.
- Sync session status and countdown with frontend reliably.
- Only show results if at least one player participated in a session.
- Expose a leaderboard showing the top 10 players by number of wins.

Sessions are automatically started and closed using a timer. When the session ends, the backend evaluates all submitted guesses, picks a winning number, and records the winners. The frontend polls the session and result endpoints to stay in sync.

---

## 🛠 Tech Stack

- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- CORS & Helmet for security
- Render.com for deployment

---

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/tboy4all/igaming-backend.git
cd igaming-backend
npm install
```

## 🔐 Environment Variables

Create a `config.env` file in the root of the project and add the following:

```config.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

You can copy `config.env.example` to `config.env` and fill in your own credentials.
```

### 📬 API Endpoints

All routes are prefixed with /api/v1

- POST /api/v1/auth/register – Register a new user
- POST /api/v1/auth/login – Login user and receive JWT
- GET /api/v1/game/active-session – Get current session status
- POST /api/v1/game/join – Join a session with a guess
- GET /api/v1/game/last-result – Get result after session ends
- GET /api/v1/game/leaderboard – Fetch top 10 players by wins

### 3. Run the App Locally

After setting up your `config.env`, run:

```bash
npm install
npm run dev
```

### GET /api/v1/game/leaderboard

Returns the top 10 players sorted by the number of wins.

#### Sample Response

```json
[
  {
    "username": "playerOne",
    "wins": 8
  },
  {
    "username": "playerTwo",
    "wins": 6
  }
]
```
