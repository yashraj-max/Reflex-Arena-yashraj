# 08 · Troubleshooting 🩺

Errors are **messages, not insults**. Read the red text slowly. It usually tells you exactly what's wrong.

### The 4-step debugging habit

1. **Where** is the error? Browser console (`F12`)? Terminal? Render logs? Vercel build log?
2. **Read the first red line**, plus the file name and line number.
3. **Reproduce** it: can you make it happen again on purpose?
4. **Change one thing** at a time, then test again.

> 🧠 **Frontend or backend?** Open DevTools → **Network** tab and click the failing request.
> - The request never went out, or the URL is wrong → **frontend** problem
> - The server replied with 4xx/5xx → read the `detail` in the Response tab. A 4xx means the frontend sent something wrong; a 5xx means the **backend** has a bug, so check its logs

---

## 🧱 Install & setup

| Symptom | Cause | Fix |
|---|---|---|
| `'npm' is not recognized` / `command not found: npm` | Node not installed, or the terminal was opened before installing | Install Node LTS, then **close and reopen** VS Code |
| `npm ERR! code ENOENT ... package.json` | You're in the wrong folder | `cd frontend` or `cd backend` first. `ls` (or `dir`) should show `package.json` |
| `running scripts is disabled on this system` (PowerShell) | Windows script policy | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use Command Prompt / Git Bash |
| `EADDRINUSE: address already in use :::5000` | The backend is already running in another terminal | Close the other terminal, or set `PORT=5001` in `.env` |
| Port 5173 busy | Another Vite app is running | Vite will offer 5174 automatically, so use that URL |

## 🎨 Frontend

| Symptom | Cause | Fix |
|---|---|---|
| White screen | A JavaScript error | `F12` → Console, read the first red error |
| `Failed to resolve import "./presets/xyz.js"` | Typo in `theme/index.js` | Match the file name exactly, capitals included |
| `Unexpected token` in a theme file | Missing comma, quote or bracket (common after AI edits) | Look at the line before the one reported. Every property ends with `,` |
| `Cannot read properties of undefined (reading 'color')` | You renamed a pad key (`red` → `pizza`) | Pad **keys** must stay `red/blue/green/yellow`. Change only what's inside |
| Rank shows as "Rookie" instead of your custom name | You renamed a rank key | Rank keys must stay `Rookie`, `Sharp`, `Lightning`, `'Reflex God'` |
| Font doesn't change | `fontsUrl` and `fonts` names don't match | Copy the font name exactly as Google Fonts writes it, in quotes |
| No sound | Phone on silent, or browser autoplay rules | Sound starts after the first tap. Check the 🔊 button and your silent switch |
| Changed `.env.local` but nothing happened | Vite reads env files only at startup | Stop (`Ctrl+C`) and `npm run dev` again |

## 🧠 Backend

| Symptom | Cause | Fix |
|---|---|---|
| `MONGODB_URI is missing` | No `backend/.env`, or it's not named exactly `.env` | Copy `.env.example` to `.env`. On Windows, make sure it isn't saved as `.env.txt` |
| `bad auth : authentication failed` | Wrong DB username/password, or `< >` left in | See [04](04-database-mongodb-atlas.md#-common-problems) |
| `Could not connect to any servers in your MongoDB Atlas cluster` | IP not allowed, or college Wi-Fi blocks MongoDB | Atlas → Network Access → `0.0.0.0/0`. Try a **phone hotspot** |
| `querySrv ECONNREFUSED _mongodb._tcp...` | DNS on this network can't resolve SRV records | Hotspot, or set your DNS to `8.8.8.8` |
| `npm test` fails after you changed `rules.js` | The tests check the old numbers | Good, the tests caught it! Update the expected values in the tests if the change was intentional |
| `SyntaxError: Cannot use import statement outside a module` | `"type": "module"` was removed from `package.json` | Put it back |

## 🔌 Integration (frontend ↔ backend)

| Symptom | Likely cause | Fix |
|---|---|---|
| Badge stuck on **🧪 Mock mode** | `VITE_API_URL` empty or not loaded | Check `frontend/.env.local` (locally) or Vercel env vars, then restart / **redeploy** |
| **🔴 Server offline** | Wrong URL, backend crashed, or still waking up | Open `<API_URL>/api/health` directly in the browser. If it fails, check the Render logs |
| `blocked by CORS policy` in the console | Backend doesn't allow your site | Render: `CORS_ORIGINS=*`, or include your exact Vercel URL (https, no trailing `/`) |
| 404 on every `/api/...` call | `VITE_API_URL` ends with `/api`, so calls go to `/api/api/...` | Use only the base URL: `https://x.onrender.com` |
| `422` on `/api/start` | Nickname breaks the rule | 2-16 chars: letters, digits, space, `_`, `-` (no emojis!) |
| `422` on `/api/answer` | A changed frontend sends wrong fields | Compare the Network payload with [02](02-api-contract.md). Did an AI edit `client.js` or `useGameEngine.js`? |
| Every answer says **"Suspiciously fast"** (`invalid_timing`) | The feedback pause was made longer, or the network is very slow | Keep `FEEDBACK_PAUSE_MS` ≤ 350. On slow networks raise `MAX_NETWORK_GAP_MS` in `backend/src/game/rules.js` |
| Traps always count as wrong | The frontend sends `none` before the timer ends | Don't change the timer logic in `useGameEngine.js` |
| "This run got out of sync" | A request was sent twice, or the server restarted mid-run | Tap **New run**. That's the `round` check protecting the score |
| Works in mock mode, fails with the real server | A field name differs (camelCase vs snake_case) | Network tab → compare every field with [02](02-api-contract.md) |

## 🚀 Deployment

| Symptom | Fix |
|---|---|
| **Render**: build fails `ENOENT package.json` | Root Directory = `backend` |
| **Render**: "Exited with status 1" | Scroll **up** in the logs to the first error. Usually it's `MONGODB_URI` |
| **Render**: first load takes ~1 min | Free tier wakes from sleep, which is normal. Open `/api/health` before demos |
| **Vercel**: 404 NOT_FOUND | Root Directory = `frontend` |
| **Vercel**: build fails but works locally | Case-sensitive file names on Linux (`MyTheme.js` ≠ `mytheme.js`), or a file you forgot to `git add` |
| **Vercel**: env var change ignored | Deployments → ⋯ → **Redeploy** (variables are baked in at build time) |
| Pushed but the site didn't change | Check the deploy finished (Vercel/Render dashboards). Hard refresh with `Ctrl+Shift+R` |

## 🌿 Git

| Symptom | Fix |
|---|---|
| `fatal: not a git repository` | `cd` into the `reflex-arena` folder |
| `rejected ... fetch first` | `git pull --rebase` then `git push` |
| Accidentally committed `.env` | Tell your facilitator. **Change the DB password in Atlas immediately** (it's now public), update `MONGODB_URI` on Render, then `git rm --cached backend/.env` and commit |
| Broke everything, want my last commit back | `git checkout -- .` (discards uncommitted changes. Careful!) |

---

### 🤖 Still stuck? Ask AI with evidence

```
I'm building a MERN app (React + Vite frontend on Vercel, Express + MongoDB backend on Render).
What I did: [the step you were on]
What I expected: [...]
What happened instead (exact error text):
[paste]
Relevant file(s):
[paste]
Explain the most likely cause and the smallest fix.
```

Evidence beats description. "It doesn't work" can't be debugged; a pasted error can.
