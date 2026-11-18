# 03 · Run It on Your Laptop 💻

We'll go in the order real teams do: **frontend alone → backend alone → connect them.**

You'll need **two terminals** open in VS Code (click the ➕ in the terminal panel): one for the frontend and one for the backend.

---

## Part A: frontend in mock mode (no backend yet)

```bash
cd frontend
npm install        # downloads React + Vite into node_modules/ (takes ~1 min the first time)
npm run dev
```

You'll see:

```
  VITE v8.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173**. The badge at the bottom says **🧪 Mock mode**, so a fake server inside your browser is playing referee. Play a full game!

✅ **Check before moving on**
- [ ] The game is playable, with all 4 screens working (start, play, game over, leaderboard)
- [ ] Waiting out a trap (no "Simon says") keeps your life; tapping it costs one
- [ ] Score, lives, streak and timer bar update every round
- [ ] Press `F12` → toggle device toolbar (`Ctrl+Shift+M`) → it works at phone width too

💡 **Hot reload:** keep the game open, change `gameTitle` in `src/theme/presets/classic.js`, save, and watch it update instantly.

---

## Part B: backend on its own

### 1. Get a database URL

Follow **[04 · MongoDB Atlas](04-database-mongodb-atlas.md)** (about 10 minutes) and come back with a string like:

```
mongodb+srv://reflex:MyPass123@cluster0.ab1cd.mongodb.net/reflex-arena?retryWrites=true&w=majority
```

### 2. Create your `.env`

In a **second terminal**:

```bash
cd backend
npm install
```

Copy the example settings file:

| macOS / Linux / Git Bash | Windows PowerShell / CMD |
|---|---|
| `cp .env.example .env` | `copy .env.example .env` |

Open `backend/.env` and paste your connection string after `MONGODB_URI=`.

⚠️ `.env` holds your database password. It's listed in `.gitignore`, so Git will never upload it. **Never** paste it into frontend code, chats or screenshots.

### 3. Prove the rules work: run the tests

```bash
npm test
```

```
✔ worked example: 742 ms on a 3000 ms limit at streak 0 gives 175
✔ judge: trap
...
ℹ pass 14
ℹ fail 0
```

🧠 These tests check `game/referee.js` **without** a database or browser. That's why the referee is written as pure functions.

### 4. Start the server

```bash
npm run dev
```

```
✅ MongoDB connected (database: reflex-arena)
🚀 Reflex Arena API listening on port 5000
```

`npm run dev` restarts automatically when you save a file (`node --watch`).

Open **http://localhost:5000/api/health** → `{"status":"ok", ... "db":"connected"}` 🎉

### 5. Talk to the API directly (smoke test)

**Option 1: VS Code REST Client.** Install the "REST Client" extension, open `backend/requests.http`, and click **Send Request** above each block.

**Option 2: terminal.**

macOS / Linux / Git Bash:
```bash
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/start -H "Content-Type: application/json" -d '{"nickname":"Asha"}'
curl http://localhost:5000/api/leaderboard
```

Windows PowerShell:
```powershell
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/start -ContentType "application/json" -Body '{"nickname":"Asha"}'
Invoke-RestMethod http://localhost:5000/api/leaderboard
```

✅ **Check before moving on**
- [ ] `npm test` passes
- [ ] `/api/start` returns a `command` with **only** `round`, `text`, `timeLimitMs` (no answer leaked!)
- [ ] Answering a trap with `none` straight away gives `invalid_timing` (you can't skip the wait)
- [ ] In Atlas → Browse Collections, you can see your run documents appear

---

## Part C: connect frontend ↔ backend (integration)

This is the moment of truth: the mock gets replaced by the real server.

1. Create `frontend/.env.local` with:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_ARENA=global
   ```
2. **Restart** the frontend (`Ctrl+C`, then `npm run dev`). Vite reads `.env` files only at startup.
3. Reload http://localhost:5173. The badge should now be **🟢 Server online · v1.0.0**.
4. Open DevTools (`F12`) → **Network** tab → play a round. Click the `answer` request and compare the **Payload** and **Response** with [02 · API contract](02-api-contract.md), field by field.

✅ **Integration checklist**
- [ ] Starting with a valid nickname shows command 1
- [ ] A correct tap adds points and shows the next command
- [ ] Waiting out a trap scores 150 (100 + 50) at ×1
- [ ] Tapping during a trap costs a life and shakes the screen
- [ ] A double-tap command accepts a double-tap (not read as a single tap)
- [ ] Losing all 3 lives shows the game-over screen with your rank
- [ ] Your run appears on the leaderboard, and stays after refreshing the page
- [ ] A 1-letter nickname shows an inline error instead of crashing

Something off? → [08 · Troubleshooting](08-troubleshooting.md)

---

## 💾 Save your progress with Git

```bash
git add .
git commit -m "Reflex Arena running locally"
git push
```

Next: put it on the internet → **[05 · Deploy backend](05-deploy-backend-render.md)**
