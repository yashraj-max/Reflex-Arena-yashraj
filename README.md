# ⚡ Reflex Arena

**A Simon Says reflex game you build, ship to the internet, and make your own.**

> *"Simon says: tap RED."* Tap it, fast.
> *"Tap GREEN."* Don't touch anything. Simon didn't say.

15 rounds. 3 lives. Commands get faster and trickier. Your score goes on a live leaderboard that anyone with your link can play.

This repository is the hands-on project for the **"From Idea to Production"** workshop for 1st and 2nd year B.Tech students. You'll see how a frontend, a backend and a database connect, and you'll leave with **your own game live on the internet**.

---

## 🧠 The big idea in one picture

```
   YOU (browser)                    THE REFEREE (server)                 THE MEMORY (database)
 ┌──────────────────┐   JSON over  ┌──────────────────────┐   Mongoose   ┌────────────────────┐
 │  React frontend  │ ───HTTPS───▶ │  Express backend     │ ───────────▶ │  MongoDB Atlas     │
 │  shows commands, │              │  picks commands,     │              │  stores every run  │
 │  reports taps    │ ◀─────────── │  judges, scores      │ ◀─────────── │  and leaderboard   │
 └──────────────────┘              └──────────────────────┘              └────────────────────┘
   hosted on VERCEL                  hosted on RENDER                     hosted on ATLAS (free)
```

**Golden rule: the server is the referee.** The browser only *shows* commands and *reports* what you did. The server decides what's correct and keeps the score. That's why typing `score = 999999` in the browser console doesn't get you onto the leaderboard.

---

## 🧰 Tech stack (MERN)

| Layer | Tool | Where it runs | Free plan |
|---|---|---|---|
| **M**ongoDB | MongoDB Atlas + Mongoose | Atlas cloud | M0 cluster, free forever |
| **E**xpress | Node.js + Express 5 | Render | Free web service |
| **R**eact | React 19 + Vite | Vercel | Hobby plan |
| **N**ode | Node.js 20+ | Your laptop & Render | - |

No TypeScript, no CSS framework, no state library: just the basics, so every line is readable.

---

## 📁 Folder map

```
reflex-arena/
├── README.md                 ← you are here
├── render.yaml               ← optional one-click Render setup
├── docs/                     ← 📚 THE HANDBOOK (start with 00-START-HERE.md)
│
├── backend/                  ← THE REFEREE (Express + MongoDB) → deploys to Render
│   ├── .env.example          ← copy to .env and add your MongoDB URL
│   ├── requests.http         ← try the API from VS Code
│   ├── src/
│   │   ├── server.js         ← starts everything (connect DB → listen)
│   │   ├── app.js            ← Express app: CORS, JSON, routes, errors
│   │   ├── config/           ← env.js (settings), db.js (MongoDB connection)
│   │   ├── routes/           ← api.routes.js: which URL → which function
│   │   ├── controllers/      ← game.controller.js: what each route does
│   │   ├── middleware/       ← validate.js, errorHandler.js, logger.js
│   │   ├── models/           ← Run.js: the shape of a game in MongoDB
│   │   └── game/             ← 🧠 rules.js (all the numbers) + referee.js (judging)
│   └── tests/                ← referee.test.js: proves the rules work
│
└── frontend/                 ← WHAT PLAYERS SEE (React + Vite) → deploys to Vercel
    ├── .env.example          ← copy to .env.local, add your backend URL
    └── src/
        ├── main.jsx          ← entry point
        ├── App.jsx           ← switches between the 4 screens
        ├── config.js         ← mock mode switch, timings
        ├── theme/            ← 🎨 MAKE IT YOURS: index.js picks a theme from presets/
        ├── screens/          ← Start, Play, GameOver, Leaderboard
        ├── components/       ← Pad, CommandBanner, TimerBar, Hud, ...
        ├── hooks/            ← useGameEngine.js (timer + tap detection), useServerStatus.js
        ├── api/              ← client.js (real server) + mockServer.js (fake server)
        ├── lib/              ← sound.js (Web Audio beeps), commandText.js
        └── styles/           ← global.css
```

---

## 🚀 Quick start (on your laptop)

You need [Node.js 20 or newer](https://nodejs.org) and [Git](https://git-scm.com).

**1. Play right away in mock mode (no backend needed):**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. A fake server inside your browser plays the referee.

**2. Run the real backend** (needs a free MongoDB Atlas database, see [docs/04](docs/04-database-mongodb-atlas.md)):

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env   then paste your MONGODB_URI
npm test                  # the referee's rules pass their tests
npm run dev               # http://localhost:5000/api/health
```

**3. Connect them:** create `frontend/.env.local` containing `VITE_API_URL=http://localhost:5000`, then restart `npm run dev`.

Full walkthrough: **[docs/03-run-locally.md](docs/03-run-locally.md)**

---

## 📚 The Handbook

| # | Guide | What you'll do |
|---|---|---|
| 00 | [Start here](docs/00-START-HERE.md) | Your roadmap, accounts and tools |
| 01 | [How it works](docs/01-how-it-works.md) | Follow one tap from your finger to the database and back |
| 02 | [API contract](docs/02-api-contract.md) | The agreement between frontend and backend |
| 03 | [Run locally](docs/03-run-locally.md) | Get everything running on your laptop |
| 04 | [Database: MongoDB Atlas](docs/04-database-mongodb-atlas.md) | Create your free cloud database |
| 05 | [Backend: Render](docs/05-deploy-backend-render.md) | Put the referee on the internet |
| 06 | [Frontend: Vercel](docs/06-deploy-frontend-vercel.md) | Put the game on the internet and get your link |
| 07 | [🎨 Make it yours](docs/07-make-it-yours.md) | Themes, ideas and AI prompts to make it unique |
| 08 | [Troubleshooting](docs/08-troubleshooting.md) | When something breaks (it will, and that's normal) |
| 09 | [Maintenance](docs/09-maintenance.md) | Life after launch: logs, updates, rollbacks |
| 10 | [Facilitator guide](docs/10-facilitator-guide.md) | For organisers: run-of-show, shared backend, fallbacks |
| ★ | [Cheat sheet](docs/cheatsheet.md) | One page of every command and URL |

---

## 🎮 Game rules

| Command | What to do |
|---|---|
| **Simon says:** tap RED | Tap the red pad |
| **Simon says:** double-tap BLUE | Tap blue twice within 0.4 s |
| Tap GREEN *(no "Simon says")* | 🚫 It's a trap: do nothing until the timer ends |

| Rounds | Time per command | Commands | Traps |
|---|---|---|---|
| 1-5 | 3.0 s | tap | 20% |
| 6-10 | 2.0 s | tap, double-tap | 30% |
| 11-15 | 1.2 s | tap, double-tap (+ hold / DON'T tap if stretch mode is on) | 40% |

**Points** = (100 + speed bonus) × streak multiplier. A faster reaction earns a bigger bonus, and dodging a trap earns a flat 50. Get 3 right in a row for ×2, and 6 in a row for ×3.

**Ranks:** 🐣 Rookie (<1000) · 🎯 Sharp (1000+) · ⚡ Lightning (2500+) · 👑 Reflex God (4500+)

Keyboard: keys **1 2 3 4** = red, blue, green, yellow.

---

*Based on the "Reflex Arena: Full Project Plan" (QuickRoll, Nov 2026), rebuilt on the MERN stack for the workshop.*
