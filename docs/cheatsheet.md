# ⚡ Reflex Arena Cheat Sheet

## Run locally
| What | Command | URL |
|---|---|---|
| Frontend | `cd frontend` → `npm install` → `npm run dev` | http://localhost:5173 |
| Backend | `cd backend` → `npm install` → `npm run dev` | http://localhost:5000/api/health |
| Backend tests | `cd backend` → `npm test` | |
| Load test | `cd backend` → `npm run load-test -- <url> 20` | |

## Settings files (never commit these!)
| File | Contents |
|---|---|
| `backend/.env` | `MONGODB_URI=...` · `PORT=5000` · `CORS_ORIGINS=*` · `ENABLE_STRETCH=false` |
| `frontend/.env.local` | `VITE_API_URL=http://localhost:5000` · `VITE_ARENA=global` |

Empty `VITE_API_URL` = 🧪 mock mode.

## Deploy settings
| | Render (backend) | Vercel (frontend) |
|---|---|---|
| Root Directory | `backend` | `frontend` |
| Build | `npm install` | `npm run build` (auto) |
| Start / Output | `npm start` | `dist` (auto) |
| Env vars | `MONGODB_URI`, `CORS_ORIGINS`, `NODE_VERSION=22` | `VITE_API_URL`, `VITE_ARENA` |
| Free-tier gotcha | sleeps after 15 min (~1 min to wake) | env changes need a **Redeploy** |

## Make it yours
| Change | File |
|---|---|
| Switch theme | `frontend/src/theme/index.js` |
| Your own theme | `frontend/src/theme/presets/my-theme.js` |
| Styles | `frontend/src/styles/global.css` |
| Sounds | `frontend/src/lib/sound.js` |
| Game rules (own backend only) | `backend/src/game/rules.js` |

## Git
```bash
git add .
git commit -m "what I changed"
git push                      # = deploy 🚀
git checkout -- .             # undo uncommitted changes
git checkout -b feature/x     # new branch → Vercel preview URL
```

## API
| | |
|---|---|
| `GET /api/health` | `{ status, version, db }` |
| `POST /api/start` | `{ nickname, arena }` → `{ runId, command }` |
| `POST /api/answer` | `{ runId, round, action, color, reactionMs, holdMs }` → verdict + next command |
| `GET /api/leaderboard?limit=10&arena=global` | `{ entries: [...] }` |

## When it breaks
1. `F12` → **Console** (red errors) and **Network** (failing request → Response tab)
2. Render → **Logs** · Vercel → **Deployments** → build log
3. [08 · Troubleshooting](08-troubleshooting.md)
4. Paste the **exact error** + file into ChatGPT/Gemini
