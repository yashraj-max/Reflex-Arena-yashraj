# 01 · How It Works 🧠

Before touching code, let's understand what we're building and **why it's split into three parts**.

---

## From idea to product

Every app you use started as one sentence.

| Stage | For Reflex Arena |
|---|---|
| 💡 **Idea** | "A Simon Says game that tests your reflexes, with a leaderboard." |
| 📝 **Rules** | 15 rounds, 3 lives, traps, faster rounds, streak multiplier ([README](../README.md#-game-rules)) |
| 🤝 **Contract** | What exactly the browser and server say to each other ([02](02-api-contract.md)) |
| 🛠️ **Build** | Frontend + backend + database, built separately against the contract |
| 🧪 **Test** | Automated tests for the rules, plus playing it by hand |
| 🚀 **Ship** | Deploy to Vercel + Render + Atlas, so it gets a public URL |
| 🔧 **Maintain** | Watch logs, fix bugs, ship updates ([09](09-maintenance.md)) |

---

## The three parts

```
┌─────────────────────┐        ┌──────────────────────┐        ┌────────────────────┐
│  FRONTEND (React)   │  HTTP  │  BACKEND (Express)   │        │  DATABASE (Mongo)  │
│  frontend/          │ ─────▶ │  backend/            │ ─────▶ │  MongoDB Atlas     │
│                     │  JSON  │                      │        │                    │
│ • draws the screen  │ ◀───── │ • invents commands   │ ◀───── │ • remembers runs   │
│ • plays sounds      │        │ • judges answers     │        │ • leaderboard      │
│ • detects taps      │        │ • calculates score   │        │                    │
│ • measures reaction │        │ • validates input    │        │                    │
└─────────────────────┘        └──────────────────────┘        └────────────────────┘
     on Vercel                       on Render                      on Atlas
```

### 🧠 Concept: why not put everything in the browser?

Everything in the browser can be **read and changed by the player**. Press `F12`, open the Console, and you can change any variable. If the browser decided the score, anyone could type their way to #1.

So we split responsibilities:

| The browser is trusted to... | The server is trusted to... |
|---|---|
| Show things nicely | Decide what the correct answer is |
| Report "I tapped RED after 742 ms" | Check that 742 ms is even possible |
| Play sounds and animations | Calculate points and save them |

**The server never tells the browser the answer.** It sends only `{ round, text, timeLimitMs }`. The secret fields (`simon`, `action`, `color`) stay in the database.

> 🧪 **Try it:** in [backend/requests.http](../backend/requests.http), request #4 claims a 5 ms reaction. The referee replies `invalid_timing`. Nobody is that fast!

---

## Follow one tap through the system 👆

Say the screen shows **"Simon says: tap RED"** and you tap the red pad after 742 ms.

```
 1. useGameEngine.js   records the moment the command was painted (performance.now())
 2. Pad.jsx            you press red → pointerdown → engine.pressDown('red') → beep 🔊
 3. useGameEngine.js   on release it waits 400 ms in case a 2nd tap (double-tap) comes...
                       ...none comes → it's a "click". Pads lock.
 4. api/client.js      POST /api/answer  { runId, round: 1, action: "click", color: "red", reactionMs: 742 }
        │
        ▼  ─────────────────── the internet ───────────────────
 5. app.js             CORS check → JSON parse → log line
 6. api.routes.js      POST /answer → validateAnswer → answer
 7. validate.js        is action valid? is color valid? is reactionMs a whole number?
 8. game.controller.js loads the run from MongoDB (models/Run.js)
 9. referee.js         judge() → "ok"      scoreRound() → (100 + 75) × 1 = 175 points
10. game.controller.js updates score/streak, makes the NEXT command, saves to MongoDB
        │
        ▼  ─────────────────── the internet ───────────────────
11. api/client.js      gets { correct: true, pointsEarned: 175, command: {...round 2...} }
12. useGameEngine.js   "Nice! +175" 🎉, good sound, then 350 ms later shows round 2
```

Open these files side by side and follow the numbers. Each file has **one job**. That's the most important habit in software: **separation of concerns.**

---

## Backend tour (`backend/src/`)

| File | Its one job | Read it when... |
|---|---|---|
| `server.js` | Connect to MongoDB, then start listening | the server won't start |
| `app.js` | Build the Express app: CORS, JSON parsing, routes, error handler | adding middleware |
| `config/env.js` | Read settings from `.env` / Render | adding a setting |
| `config/db.js` | Connect to MongoDB, with helpful error hints | the DB won't connect |
| `routes/api.routes.js` | The "menu": URL → function | adding an endpoint |
| `controllers/game.controller.js` | What each endpoint does | changing behaviour |
| `middleware/validate.js` | Reject bad input with 422 | changing input rules |
| `middleware/errorHandler.js` | Turn any error into `{ "detail": "..." }` | debugging 500s |
| `models/Run.js` | The shape of one game in MongoDB | adding a field |
| `game/rules.js` | **Every number**: timings, points, ranks | tuning difficulty |
| `game/referee.js` | Pure functions: make command, judge, score | changing rules |

🧠 **Why is `referee.js` "pure"?** It doesn't touch the database or the network. Give it inputs and you get outputs. That makes it trivial to test (`npm test`) and safe to change.

## Frontend tour (`frontend/src/`)

| File | Its one job |
|---|---|
| `main.jsx` | Apply the theme, mount `<App />` |
| `App.jsx` | Decide which screen is visible: start → play → over → board |
| `config.js` | Mock mode on/off, backend URL, timing constants |
| `theme/index.js` | 🎨 **Pick the active theme** (one line!) |
| `theme/presets/*.js` | The themes: words, emojis, colors, sounds, ranks |
| `theme/applyTheme.js` | Turn the theme into CSS variables, fonts, title, favicon |
| `hooks/useGameEngine.js` | 🧠 The engine: timer, tap/double/hold detection, talking to the server |
| `hooks/useServerStatus.js` | Is the backend awake? (Render free servers sleep) |
| `api/client.js` | **The only file that calls the backend** |
| `api/mockServer.js` | A fake backend in the browser, for building without a server |
| `lib/commandText.js` | Turn "Simon says: click RED" into the themed "Mummy says: grab 🌶️ MIRCHI" |
| `lib/sound.js` | Beeps made by code (Web Audio API), no audio files |
| `screens/*.jsx` | The 4 screens |
| `components/*.jsx` | Reusable pieces: Pad, TimerBar, Hud, Toast... |
| `styles/global.css` | All styles, driven by theme CSS variables |

---

## 🧠 Concept: mock mode

Real teams don't wait for each other. The frontend team builds against a **mock** (a fake server with the same JSON shapes) while the backend team builds the real thing. Because both follow the same **contract**, switching is one setting:

```
VITE_API_URL empty        →  mockServer.js answers  (🧪 badge on the start screen)
VITE_API_URL=https://...  →  your real backend      (🟢 badge on the start screen)
```

## 🧠 Concept: environment variables

Settings that change between laptop and production, or that are **secret**, live in environment variables, not in code:

| Where | File on laptop | Set in production at |
|---|---|---|
| Backend | `backend/.env` (git-ignored!) | Render → Environment |
| Frontend | `frontend/.env.local` (git-ignored!) | Vercel → Settings → Environment Variables |

⚠️ Frontend variables (`VITE_...`) end up **inside the JavaScript sent to every visitor**, so they are public. Never put passwords there. The MongoDB password lives **only** in the backend.

## 🧠 Concept: CORS

Your frontend (`something.vercel.app`) and backend (`something.onrender.com`) are **different websites**. By default, browsers block a page from reading responses from another site. The backend must say "I allow that site". That's the `cors()` line in `app.js`, controlled by `CORS_ORIGINS`.

---

Next: **[02 · API contract](02-api-contract.md)** →
